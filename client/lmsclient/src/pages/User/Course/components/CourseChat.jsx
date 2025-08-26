import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

export default function Chat() {
  const { id: courseId } = useParams();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChatRooms = async () => {
      const token = localStorage.getItem("accessToken");
      const userData = JSON.parse(localStorage.getItem("userData") || '{}');
      
      if (!token || !userData.id) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:3000/api/students/${userData.id}/course-chat-rooms`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        
        const data = await res.json();
        if (data.status === "success" && data.data.length > 0) {
          const chatRoom = data.data[0][0];
          setMessages([
            { id: 1, user: "System", text: `Welcome to ${chatRoom?.name || 'course chat'}!` },
          ]);
        } else {
          setMessages([
            { id: 1, user: "System", text: "Welcome to course chat!" },
          ]);
        }
      } catch (err) {
        console.error("Error fetching chat rooms:", err);
        setMessages([
          { id: 1, user: "System", text: "Welcome to course chat!" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchChatRooms();
  }, [courseId]);

  const handleSend = () => {
    if (newMessage.trim() === "") return;
    setMessages([
      ...messages,
      { id: messages.length + 1, user: "You", text: newMessage },
    ]);
    setNewMessage("");
  };
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 flex items-center justify-center h-[80vh]">
        <div className="text-lg">Loading chat...</div>
      </div>
    );
  }

  return (
     <div className="max-w-3xl mx-auto p-6 flex flex-col h-[80vh]">
     

      <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 rounded-lg space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded-lg max-w-[80%] ${
              msg.user === "You"
                ? "bg-blue-500 text-white self-end"
                : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white self-start"
            }`}
          >
            <p className="text-sm font-semibold">{msg.user}</p>
            <p className="mt-1">{msg.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex">
        <input
          type="text"
          className="flex-1 p-3 rounded-l-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 rounded-r-lg transition"
        >
          Send
        </button>
      </div>
    </div>
  )
}
