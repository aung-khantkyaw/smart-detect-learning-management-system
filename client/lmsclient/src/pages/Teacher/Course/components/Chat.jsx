import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

export default function Chat() {
  const { id } = useParams(); // course offering ID
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatRoom, setChatRoom] = useState(null);
  const messagesEndRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem("userData"));

  useEffect(() => {
    fetchChatRoom();
  }, [id]);

  useEffect(() => {
    if (chatRoom) {
      fetchMessages();
      // Set up polling for new messages
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [chatRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChatRoom = async () => {
    const token = localStorage.getItem("accessToken");
    
    try {
      // Get course chat rooms
      const res = await fetch(`http://localhost:3000/api/chat-rooms/course`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        console.error("Failed to fetch chat rooms:", res.status);
        return;
      }
      
      const data = await res.json();
      console.log("Chat rooms response:", data);
      
      // Find chat room for this offering
      const rooms = data.status === "success" ? data.data : [];
      const room = rooms.find(r => r.offeringId === id);
      
      if (room) {
        setChatRoom(room);
      } else {
        console.log("No chat room found for this offering");
      }
    } catch (err) {
      console.error("Error fetching chat room:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!chatRoom) return;
    
    const token = localStorage.getItem("accessToken");
    
    try {
      const res = await fetch(`http://localhost:3000/api/chat-rooms/COURSE/${chatRoom.id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        let messagesList = [];
        
        if (Array.isArray(data)) {
          messagesList = data;
        } else if (data.status === "success" && data.data) {
          messagesList = data.data;
        }
        
        // Transform messages to ensure sender info is available
        const transformedMessages = messagesList.map(msg => ({
          id: msg.id,
          message: msg.message,
          fileUrl: msg.fileUrl,
          createdAt: msg.createdAt,
          senderId: msg.senderId || msg.sender?.id,
          senderName: msg.sender?.fullName || msg.senderName || 'Unknown User'
        }));
        
        // Sort messages by creation time (oldest first, newest last)
        transformedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        setMessages(transformedMessages);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !chatRoom) return;
    
    const token = localStorage.getItem("accessToken");
    
    try {
      const res = await fetch(`http://localhost:3000/api/chat-rooms/send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          roomType: "COURSE",
          roomId: chatRoom.id,
          senderId: currentUser?.id,
          message: newMessage
        })
      });
      
      if (res.ok) {
        setNewMessage("");
        fetchMessages(); // Refresh messages
      } else {
        const error = await res.json();
        alert(error.message || "Failed to send message");
      }
    } catch (err) {
      console.error("Send message error:", err);
      alert("Failed to send message");
    }
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
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No chat room available</h3>
        <p className="mt-1 text-sm text-gray-500">Chat room for this course is not set up yet.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[500px] flex flex-col">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Course Chat Room</h2>
          <p className="text-sm text-gray-500">{chatRoom.name}</p>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderId === currentUser?.id ? "justify-end" : "justify-start"
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
                  <div className="text-sm">{message.message}</div>
                  {message.fileUrl && (
                    <div className="mt-2">
                      <a
                        href={message.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs underline opacity-75 hover:opacity-100"
                      >
                        📎 Download File
                      </a>
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
        </div>

        {/* Message Input - Fixed at bottom */}
        <div className="px-4 py-4 border-t border-gray-200 bg-white">
          <form onSubmit={sendMessage} className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
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