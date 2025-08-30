import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../../../lib/api";
import io from "socket.io-client";

export default function Chat() {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatRoom, setChatRoom] = useState(null);
  const [members, setMembers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({}); // { userId: {name, timeoutId}}
  const [socketConnected, setSocketConnected] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem("userData"));
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Resolve file URL from backend (same as Materials.jsx)
  const apiOrigin = (() => {
    try {
      const u = new URL(api.baseUrl);
      u.pathname = ""; // strip any path like /api
      return u.toString().replace(/\/$/, "");
    } catch {
      return api.baseUrl.replace(/\/api$/, "");
    }
  })();

  const resolveFileUrl = (u) => {
    if (!u) return null;
    if (/^https?:\/\//i.test(u)) return u;
    if (u.startsWith("/")) return `${apiOrigin}${u}`;
    return `${apiOrigin}/${u}`;
  };

  useEffect(() => {
    fetchChatRoom();
  }, [id]);

  useEffect(() => {
    if (chatRoom) {
      fetchMessages();
      // Fetch members immediately (works even if sockets are unavailable)
      fetchMembers(chatRoom.id);
      // Initialize Socket.IO
      initSocket(chatRoom);
      // Always poll to ensure cross-client updates even if no socket broadcast
      const interval = setInterval(() => {
        fetchMessages();
      }, 3000);
      return () => {
        clearInterval(interval);
        teardownSocket();
      };
    }
  }, [chatRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChatRoom = async () => {
    try {
      // Use specific route to get room by offering id
      const resp = await api.get(`chat-rooms/offeringCourse/${id}`);
      const payload = resp?.data || resp;
      let room = null;
      if (Array.isArray(payload)) room = payload[0];
      else if (Array.isArray(payload?.data)) room = payload.data[0];
      else room = payload?.data || payload || null;
      if (room) setChatRoom(room);
    } catch (err) {
      console.error("Error fetching chat room:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch members via REST as canonical source
  const fetchMembers = async (roomId) => {
    try {
      const resp = await api.get(`chat-rooms/offeringCourse/${roomId}/members`);
      const payload = resp?.data || resp;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
        ? payload.data
        : [];
      setMembers(list || []);
    } catch (e) {
      // silent fail
      console.error("Error fetching chat members:", e);
    }
  };

  const initSocket = (room) => {
    try {
      const base = api.baseUrl.replace(/\/$/, "").replace(/\/api$/, "");
      const token = (() => {
        try {
          return localStorage.getItem("accessToken");
        } catch {
          return null;
        }
      })();
      const socket = io(base, {
        transports: ["websocket", "polling"],
        auth: token ? { token } : undefined,
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        setSocketConnected(true);
        // Join course chat room
        socket.emit("join-chat-room", { roomType: "COURSE", roomId: room.id });
        // Also fetch members via REST to align with routes
        fetchMembers(room.id);
      });

      socket.on("disconnect", () => {
        setSocketConnected(false);
      });

      // Receive new chat message
      socket.on("new-message", (msg) => {
        if (!msg || msg.roomId !== room.id) return;
        setMessages((prev) => {
          const next = [...prev, normalizeMessage(msg)];
          next.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          return next;
        });
        scrollToBottom();
      });

      // If backend emits presence events, update; otherwise REST fetch covers it
      socket.on("member_joined", () => fetchMembers(room.id));
      socket.on("member_left", () => fetchMembers(room.id));

      // Typing indicators
      socket.on("typing", ({ userId, name, isTyping }) => {
        if (!userId || userId === currentUser?.id) return;
        setTypingUsers((prev) => {
          const copy = { ...prev };
          if (isTyping) {
            copy[userId] = { name, last: Date.now() };
          } else {
            delete copy[userId];
          }
          return copy;
        });
      });
    } catch (e) {
      console.error("Socket init error:", e);
      setSocketConnected(false);
    }
  };

  const teardownSocket = () => {
    try {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    } catch {
      // Ignore disconnect errors
    }
    socketRef.current = null;
    setSocketConnected(false);
    setTypingUsers({});
  };

  const normalizeMessage = (msg) => ({
    id: msg.id,
    message: msg.message,
    fileUrl: resolveFileUrl(msg.fileUrl),
    createdAt: msg.createdAt || msg.created_at || new Date().toISOString(),
    senderId: msg.senderId || msg.sender?.id,
    senderName: msg.sender?.fullName || msg.senderName || "Unknown User",
  });

  const fetchMessages = async () => {
    if (!chatRoom) return;

    try {
      const data = await api.get(`/chat-rooms/COURSE/${chatRoom.id}/messages`);
      const messagesList = Array.isArray(data) ? data : [];

      const transformedMessages = messagesList.map((msg) => ({
        id: msg.id,
        message: msg.message,
        fileUrl: resolveFileUrl(msg.fileUrl),
        createdAt: msg.createdAt,
        senderId: msg.senderId || msg.sender?.id,
        senderName: msg.sender?.fullName || msg.senderName || "Unknown User",
      }));

      transformedMessages.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      console.log("Fetched messages:", transformedMessages);
      setMessages(transformedMessages);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        alert("File size must be less than 100MB");
        return;
      }

      setSelectedFile(file);

      // Show preview for images only
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if ((!newMessage.trim() && !selectedFile) || !chatRoom) return;

    try {
      if (selectedFile || !socketConnected) {
        // Use REST API for file uploads or when socket is disconnected
        const formData = new FormData();
        formData.append("roomType", "COURSE");
        formData.append("roomId", chatRoom.id);
        formData.append("senderId", currentUser?.id);
        if (newMessage.trim()) formData.append("message", newMessage);
        if (selectedFile) formData.append("file", selectedFile);

        const response = await fetch(`${api.baseUrl}/chat-rooms/send-message`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status}`);
        }

        setNewMessage("");
        clearFile();
        fetchMessages();
      } else if (socketRef.current && socketConnected) {
        // Use socket for text-only messages
        socketRef.current.emit("chat_message", {
          roomType: "COURSE",
          roomId: chatRoom.id,
          senderId: currentUser?.id,
          message: newMessage,
        });
        setNewMessage("");
        fetchMessages();
      }
    } catch (err) {
      console.error("Send message error:", err);
      alert(`Failed to send message: ${err.message || "Please try again"}`);
    }
  };

  const emitTyping = (isTyping) => {
    try {
      if (!socketRef.current || !socketConnected || !chatRoom) return;
      socketRef.current.emit("typing", {
        roomType: "COURSE",
        roomId: chatRoom.id,
        userId: currentUser?.id,
        name: currentUser?.fullName || currentUser?.username || "You",
        isTyping,
      });
    } catch {
      // Ignore typing emit errors
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setNewMessage(val);
    emitTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTyping(false), 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!chatRoom) {
    return (
      <div className="p-6 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No chat room available
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Chat room for this course is not set up yet.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 h-screen">
      <div className="max-w-4xl mx-auto h-full">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 h-full flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Course Chat Room
                </h2>
                <p className="text-blue-100 text-sm">{chatRoom.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div
                className={`h-2 w-2 rounded-full ${
                  socketConnected ? "bg-green-400" : "bg-red-400"
                }`}
              ></div>
              <span className="text-xs text-blue-100">
                {socketConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
            {/* <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
            <span className="font-medium">Members:</span>
            {members && members.length ? (
              members.map((m) => (
                <span key={m.id} className="px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-gray-700">
                  {m.fullName || m.username || m.name || m.userId || m.id}
                </span>
              ))
            ) : (
              <span className="italic">No members listed</span>
            )}
          </div> */}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white/50 to-gray-50/50">
            {messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === currentUser?.id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                      message.senderId === currentUser?.id
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                        : "bg-white/80 backdrop-blur-sm text-gray-900 border border-white/20"
                    }`}
                  >
                    {message.senderId !== currentUser?.id && (
                      <div className="text-xs font-medium mb-2 text-blue-600">
                        {message.senderName}
                      </div>
                    )}
                    {message.message && (
                      <div className="text-sm leading-relaxed">
                        {message.message}
                      </div>
                    )}
                    {message.fileUrl && (
                      <div className="mt-2">
                        {message.fileUrl.match(
                          /\.(jpg|jpeg|png|gif|webp)$/i
                        ) ? (
                          <img
                            src={message.fileUrl}
                            alt="Shared image"
                            className="max-w-xs rounded-lg cursor-pointer hover:opacity-90"
                            onClick={() =>
                              window.open(message.fileUrl, "_blank")
                            }
                          />
                        ) : message.fileUrl.match(
                            /\.(mp4|webm|ogg|avi|mov)$/i
                          ) ? (
                          <video
                            src={message.fileUrl}
                            controls
                            className="max-w-xs rounded-lg"
                            style={{ maxHeight: "200px" }}
                          >
                            Your browser does not support video playback.
                          </video>
                        ) : (
                          <div
                            className={`flex items-center gap-3 p-3 rounded-xl ${
                              message.senderId === currentUser?.id
                                ? "bg-white/20 backdrop-blur-sm"
                                : "bg-gray-50 border border-gray-200"
                            }`}
                          >
                            <div className="text-2xl">
                              {message.fileUrl.match(/\.(pdf)$/i)
                                ? "📄"
                                : message.fileUrl.match(/\.(doc|docx)$/i)
                                ? "📝"
                                : message.fileUrl.match(/\.(xls|xlsx)$/i)
                                ? "📊"
                                : message.fileUrl.match(/\.(ppt|pptx)$/i)
                                ? "📋"
                                : message.fileUrl.match(/\.(zip|rar|7z)$/i)
                                ? "🗜️"
                                : message.fileUrl.match(/\.(txt)$/i)
                                ? "📄"
                                : "📎"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div
                                className={`text-sm font-medium truncate ${
                                  message.senderId === currentUser?.id
                                    ? "text-white"
                                    : "text-gray-900"
                                }`}
                              >
                                {message.fileUrl.split("/").pop()}
                              </div>
                              <a
                                href={message.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-xs underline hover:no-underline ${
                                  message.senderId === currentUser?.id
                                    ? "text-blue-100 hover:text-white"
                                    : "text-blue-600 hover:text-blue-800"
                                }`}
                              >
                                Download
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div
                      className={`text-xs mt-2 ${
                        message.senderId === currentUser?.id
                          ? "text-blue-100"
                          : "text-gray-500"
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="h-8 w-8 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No messages yet
                </h3>
                <p className="text-gray-500">
                  Start the conversation by sending a message!
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
            {/* Typing indicator */}
            {Object.keys(typingUsers).length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
                <span className="text-sm text-gray-500">
                  {Object.values(typingUsers)
                    .slice(0, 3)
                    .map((t) => t.name)
                    .join(", ")}
                  {Object.keys(typingUsers).length > 3 ? " and others" : ""} is
                  typing...
                </span>
              </div>
            )}
          </div>

          {/* Message Input - Fixed at bottom */}
          <div className="px-6 py-4 bg-white/90 backdrop-blur-sm border-t border-white/20">
            {/* File Preview */}
            {(filePreview || selectedFile) && (
              <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">
                    {filePreview
                      ? "🖼️ Image Preview"
                      : `📎 Selected: ${selectedFile?.name}`}
                  </span>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    ✕ Remove
                  </button>
                </div>
                {filePreview ? (
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="max-w-40 max-h-40 rounded-xl object-cover shadow-md"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-2xl">
                      {selectedFile?.type.startsWith("video/")
                        ? "🎥"
                        : selectedFile?.type.includes("pdf")
                        ? "📄"
                        : selectedFile?.type.includes("document") ||
                          selectedFile?.name.match(/\.(doc|docx)$/i)
                        ? "📝"
                        : selectedFile?.type.includes("spreadsheet") ||
                          selectedFile?.name.match(/\.(xls|xlsx)$/i)
                        ? "📊"
                        : selectedFile?.type.includes("presentation") ||
                          selectedFile?.name.match(/\.(ppt|pptx)$/i)
                        ? "📋"
                        : "📎"}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {selectedFile?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {(selectedFile?.size / 1024 / 1024).toFixed(1)} MB
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={sendMessage} className="flex items-center gap-3">
              {/* File Upload Button */}
              <label
                className="p-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 rounded-xl hover:from-gray-200 hover:to-gray-300 cursor-pointer flex items-center justify-center transition-all shadow-sm"
                title="Attach file (images, videos, documents)"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
                <input
                  type="file"
                  accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              <input
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                autoComplete="off"
              />

              <button
                type="submit"
                disabled={!newMessage.trim() && !selectedFile}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg transition-all"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
