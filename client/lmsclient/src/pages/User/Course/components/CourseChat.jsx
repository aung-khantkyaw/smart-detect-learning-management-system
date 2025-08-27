import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

export default function Chat() {
  const { id } = useParams();
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
    
    console.log("Course ID:", id);
    
    try {
      const offeringsRes = await fetch(`http://localhost:3000/api/course-offerings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const offeringsData = await offeringsRes.json();
      console.log("Offerings data:", offeringsData);
      
      const offerings = offeringsData.status === "success" ? offeringsData.data : [];
      const offering = offerings.find(o => o.courseId === id);
      console.log("Found offering:", offering);
      
      if (offering) {
        const res = await fetch(`http://localhost:3000/api/chat-rooms/course`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("Chat rooms response status:", res.status);
        const data = await res.json();
        console.log("Chat rooms data:", data);
        
        const rooms = data.status === "success" ? data.data : [];
        const room = rooms.find(r => r.offeringId === offering.id);
        console.log("Found chat room:", room);
        
        if (room) {
          setChatRoom(room);
        }
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
    
    console.log("Fetching messages for chat room:", chatRoom.id);
    
    try {
      const res = await fetch(`http://localhost:3000/api/chat-rooms/COURSE/${chatRoom.id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Messages response status:", res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log("Messages data:", data);
        
        let messagesList = [];
        
        if (Array.isArray(data)) {
          messagesList = data;
        } else if (data.status === "success" && data.data) {
          messagesList = data.data;
        }
        
        const transformedMessages = messagesList.map(msg => ({
          id: msg.id,
          message: msg.message,
          fileUrl: msg.fileUrl,
          createdAt: msg.createdAt,
          senderId: msg.sender?.id,
          senderName: msg.sender?.fullName
        }));
        
        console.log("Transformed messages:", transformedMessages);
        setMessages(transformedMessages);
      } else {
        console.error("Failed to fetch messages:", res.status, await res.text());
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
        fetchMessages();
      }
    } catch (err) {
      console.error("Send message error:", err);
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
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Course Chat</span>
          </div>
          <div className="border border-gray-200 p-8 bg-gray-50 text-center">
            <h3 className="text-sm font-medium text-gray-900">No chat room available</h3>
            <p className="mt-1 text-sm text-gray-500">Chat room for this course is not set up yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-3">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Course Chat</span>
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-4">Course Chat Room</h2>

        <div className="border border-gray-200 bg-gray-50 h-[500px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length > 0 ? (
              messages.map((message, index) => (
                <div
                  key={message.id || `message-${index}`}
                  className={`flex ${
                    message.senderId === currentUser?.id ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-md ${
                      message.senderId === currentUser?.id
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-900 border border-gray-200"
                    }`}
                  >
                    {message.senderId !== currentUser?.id && (
                      <div className="text-xs font-medium mb-1 text-gray-600">
                        {message.senderName || 'Unknown User'}
                      </div>
                    )}
                    <div className="text-sm">{message.message}</div>
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

          <div className="p-4 border-t border-gray-200 bg-white">
            <form onSubmit={sendMessage} className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}