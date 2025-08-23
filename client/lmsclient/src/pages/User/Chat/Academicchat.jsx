import React from 'react'
import { useState } from "react";
export default function Academicchat() {

   const [messages, setMessages] = useState([
    { id: 1, sender: "Admin", text: "🎉 Welcome to the Academic Year 2025 chat room!" },
    { id: 2, sender: "Alice", text: "Hi everyone 👋" },
    { id: 3, sender: "Bob", text: "Good luck with the new semester 🚀" },
  ]);

  const [newMessage, setNewMessage] = useState("");

  const sendMessage = () => {
    if (newMessage.trim() === "") return;
    setMessages([
      ...messages,
      { id: messages.length + 1, sender: "You", text: newMessage },
    ]);
    setNewMessage("");
  };


  return (
    <div className="p-6  min-h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-6">🏫 Academic Year Chat</h1>

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
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
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
