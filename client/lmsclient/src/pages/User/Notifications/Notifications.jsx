import React from 'react'
import { useState } from "react";
export default function Notifications() {
    
 const dummyNotifications = [
    {
      id: 1,
      type: "assignment",
      title: "Assignment Due",
      message: "Assignment 2 for Web Development is due on Aug 30.",
      date: "2025-08-20",
      read: false,
    },
    {
      id: 2,
      type: "announcement",
      title: "New Announcement",
      message: "AI & Machine Learning lecture moved to Friday.",
      date: "2025-08-18",
      read: true,
    },
    {
      id: 3,
      type: "quiz",
      title: "Quiz Result Posted",
      message: "Your score for Database Quiz 1 is available.",
      date: "2025-08-15",
      read: false,
    },
  ];
  const [notifications, setNotifications] = useState(dummyNotifications);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };
  // Mark notification as read

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">🔔 Notifications</h1>

      <div className="space-y-4">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-lg shadow-md border-l-4 ${
              n.read
                ? "bg-white border-gray-300"
                : "bg-indigo-50 border-indigo-500"
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-lg">{n.title}</h2>
                <p className="text-gray-600">{n.message}</p>
                <span className="text-xs text-gray-400">{n.date}</span>
              </div>
              {!n.read && (
                <button
                  onClick={() => markAsRead(n.id)}
                  className="ml-4 px-3 py-2 text-sm rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Mark as Read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
