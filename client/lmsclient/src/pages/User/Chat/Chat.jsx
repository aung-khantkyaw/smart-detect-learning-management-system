import React, { useEffect, useState } from 'react';

export default function CourseChatRooms() {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChatRooms = async () => {
      const token = localStorage.getItem("accessToken");
      const userData = JSON.parse(localStorage.getItem("userData") || '{}');
      if (!token || !userData.id) {
        setChatRooms([]);
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
        if (res.ok && data.status === "success") {
          setChatRooms(data.data);
        } else {
          setChatRooms([]);
        }
      } catch (err) {
        setChatRooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChatRooms();
  }, []);

  if (loading) return <div>Loading chat rooms...</div>;

  return (
    <div>
      <h2>Course Chat Rooms</h2>
      <ul>
        {chatRooms.map(room => (
          <li key={room.id}>{room.name}</li>
        ))}
      </ul>
    </div>
  );
}