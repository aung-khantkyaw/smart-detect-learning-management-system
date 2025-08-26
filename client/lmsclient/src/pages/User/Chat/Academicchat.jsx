import React, { useState, useEffect } from 'react'

export default function Academicchat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatRoom, setChatRoom] = useState(null);

  useEffect(() => {
    const fetchAcademicChatRoom = async () => {
      const token = localStorage.getItem("accessToken");
      const userData = JSON.parse(localStorage.getItem("userData") || '{}');
      
      if (!token || !userData.id) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:3000/api/students/${userData.id}/academic-chat`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        
        const data = await res.json();
        if (data.status === "success" && data.data.length > 0) {
          const room = data.data[0][0];
          setChatRoom(room);
          setMessages([
            { id: 1, sender: "System", text: `🎉 Welcome to ${room?.name || 'Academic Year Chat'}!` },
          ]);
        } else {
          setMessages([
            { id: 1, sender: "System", text: "🎉 Welcome to Academic Year Chat!" },
          ]);
        }
      } catch (err) {
        console.error("Error fetching academic chat room:", err);
        setMessages([
          { id: 1, sender: "System", text: "🎉 Welcome to Academic Year Chat!" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAcademicChatRoom();
  }, []);

  const sendMessage = () => {
    if (newMessage.trim() === "") return;
    setMessages([
      ...messages,
      { id: messages.length + 1, sender: "You", text: newMessage },
    ]);
    setNewMessage("");
  };


  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading academic chat...</div>
      </div>
    );
  }

  return (
    <div className="p-6  min-h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-6">🏫 {chatRoom?.name || 'Academic Year Chat'}</h1>

      {/* Chat Box */}
      <div className="flex-1 bg-white p-4 rounded shadow overflow-y-auto mb-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id}>
            <span className="font-semibold">{msg.sender}:</span>{" "}
            <span>{msg.text}</span>
          </div>
        ))}
      </div>

      {/* Input Section */}
     <div className="mt-4 flex">
        <input
          type="text"
          className="flex-1 p-3 rounded-l-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 rounded-r-lg transition"
        >
          Send
        </button>
      </div>
    </div>
  )
}
