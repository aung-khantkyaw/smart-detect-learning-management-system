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
    } catch {}
    socketRef.current = null;
    setSocketConnected(false);
    setTypingUsers({});
  };

  const normalizeMessage = (msg) => ({
    id: msg.id,
    message: msg.message,
    fileUrl: msg.fileUrl,
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
        fileUrl: msg.fileUrl,
        createdAt: msg.createdAt,
        senderId: msg.senderId || msg.sender?.id,
        senderName: msg.sender?.fullName || msg.senderName || "Unknown User",
      }));

      transformedMessages.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      setMessages(transformedMessages);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is an image
      if (file.type.startsWith("image/")) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        alert("Please select an image file");
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

        await api.post("/chat-rooms/send-message", formData);

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
      // Show user-friendly error without blocking UI
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          message: "⚠️ Failed to send message. Please try again.",
          createdAt: new Date().toISOString(),
          senderId: "system",
          senderName: "System",
        },
      ]);
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
    } catch {}
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
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[500px] flex flex-col">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Course Chat Room
          </h2>
          <p className="text-sm text-gray-500">{chatRoom.name}</p>
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderId === currentUser?.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-900"
                  }`}
                >
                  {message.senderId !== currentUser?.id && (
                    <div className="text-xs font-medium mb-1 opacity-75">
                      {message.senderName}
                    </div>
                  )}
                  {message.message && (
                    <div className="text-sm">{message.message}</div>
                  )}
                  {message.fileUrl && (
                    <div className="mt-2">
                      {message.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <img
                          src={message.fileUrl}
                          alt="Shared image"
                          className="max-w-xs rounded-lg cursor-pointer hover:opacity-90"
                          onClick={() => window.open(message.fileUrl, "_blank")}
                        />
                      ) : (
                        <a
                          href={message.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs underline opacity-75 hover:opacity-100"
                        >
                          📎 Download File
                        </a>
                      )}
                    </div>
                  )}
                  <div className="text-xs mt-1 opacity-75">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
          {/* Typing indicator */}
          {Object.keys(typingUsers).length > 0 && (
            <div className="px-2 text-xs text-gray-500">
              {Object.values(typingUsers)
                .slice(0, 3)
                .map((t) => t.name)
                .join(", ")}
              {Object.keys(typingUsers).length > 3 ? " and others" : ""} is
              typing...
            </div>
          )}
        </div>

        {/* Message Input - Fixed at bottom */}
        <div className="px-4 py-4 border-t border-gray-200 bg-white">
          {/* File Preview */}
          {filePreview && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Image Preview:
                </span>
                <button
                  type="button"
                  onClick={clearFile}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  ✕ Remove
                </button>
              </div>
              <img
                src={filePreview}
                alt="Preview"
                className="max-w-32 max-h-32 rounded-lg object-cover"
              />
            </div>
          )}

          <form onSubmit={sendMessage} className="flex space-x-2">
            {/* File Upload Button */}
            <label className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 cursor-pointer flex items-center">
              📎
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="off"
            />

            <button
              type="submit"
              disabled={!newMessage.trim() && !selectedFile}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
