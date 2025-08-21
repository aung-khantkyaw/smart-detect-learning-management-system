import React,{ useState } from 'react'

export default function Chat() {

  const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState([
    { id: 1, user: "Instructor", text: "Welcome to CST-4211 discussion!" },
    { id: 2, user: "Student A", text: "Hi everyone, excited for this course." },
    { id: 3, user: "Student B", text: "Can someone explain parallel algorithms?" },
    { id: 4, user: "Instructor", text: "Sure! We will cover that in next lecture." },
  ]);

  const handleSend = () => {
    if (newMessage.trim() === "") return;
    setMessages([
      ...messages,
      { id: messages.length + 1, user: "You", text: newMessage },
    ]);
    setNewMessage("");
  };
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
