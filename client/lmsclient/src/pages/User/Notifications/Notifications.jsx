import React, { useState, useEffect } from 'react'

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem("accessToken");
      const userData = JSON.parse(localStorage.getItem("userData") || '{}');
      
      if (!token || !userData.id) {
        // Fallback to dummy data if no user
        setNotifications([
          {
            id: 1,
            type: "system",
            title: "Welcome!",
            message: "Welcome to the LMS notification system.",
            date: new Date().toISOString().split('T')[0],
            read: false,
          }
        ]);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:3000/api/students/${userData.id}/notifications`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        
        const data = await res.json();
        if (data.status === "success") {
          setNotifications(data.data);
        } else {
          setNotifications([]);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setNotifications([]);
      } finally {
        setLoading(false);
      }

    };

    fetchNotifications();
  }, []);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };
  // Mark notification as read

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading notifications...</div>
      </div>
    );
  }

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
