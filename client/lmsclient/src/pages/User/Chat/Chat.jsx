import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function CourseChatRooms() {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChatRooms();
  }, []);

  const fetchChatRooms = async () => {
    const token = localStorage.getItem("accessToken");
    const userData = JSON.parse(localStorage.getItem("userData") || '{}');
    
    if (!token || !userData.id) {
      setChatRooms([]);
      setLoading(false);
      return;
    }

    try {
      // Get student's enrollments first
      const enrollmentsRes = await fetch(`http://localhost:3000/api/enrollments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!enrollmentsRes.ok) {
        setChatRooms([]);
        setLoading(false);
        return;
      }
      
      const enrollmentsData = await enrollmentsRes.json();
      const enrollments = enrollmentsData.status === "success" ? enrollmentsData.data : enrollmentsData;
      
      // Filter enrollments for current student
      const studentEnrollments = enrollments.filter(e => e.studentId === userData.id);
      
      if (studentEnrollments.length === 0) {
        setChatRooms([]);
        setLoading(false);
        return;
      }
      
      // Get enrolled offering IDs
      const enrolledOfferingIds = studentEnrollments.map(e => e.offeringId);
      
      // Get all chat rooms
      const roomsRes = await fetch(`http://localhost:3000/api/chat-rooms/course`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (roomsRes.ok) {
        const roomsData = await roomsRes.json();
        const allRooms = roomsData.status === "success" ? roomsData.data : roomsData;
        
        // Filter rooms for enrolled offerings only
        const enrolledRooms = allRooms.filter(room => enrolledOfferingIds.includes(room.offeringId));
        
        // Get course offerings and courses for room details
        const [offeringsRes, coursesRes] = await Promise.all([
          fetch(`http://localhost:3000/api/course-offerings`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`http://localhost:3000/api/courses`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        const offeringsData = await offeringsRes.json();
        const coursesData = await coursesRes.json();
        const offerings = offeringsData.status === "success" ? offeringsData.data : [];
        const courses = coursesData.status === "success" ? coursesData.data : [];
        
        const enrichedRooms = enrolledRooms.map(room => {
          const offering = offerings.find(o => o.id === room.offeringId);
          const course = courses.find(c => c.id === offering?.courseId);
          
          return {
            ...room,
            courseName: course?.title || 'Unknown Course',
            courseCode: course?.code || 'N/A'
          };
        });
        
        setChatRooms(enrichedRooms);
      } else {
        setChatRooms([]);
      }
    } catch (err) {
      console.error("Error fetching chat rooms:", err);
      setChatRooms([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading chat rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Course Chat Rooms</h1>
              <p className="text-gray-600">Connect with your classmates and instructors</p>
            </div>
          </div>
        </div>

        {chatRooms.length > 0 ? (
          <div className="grid gap-4">
            {chatRooms.map((room) => (
              <Link
                key={room.id}
                to={`/dashboard/courses/${room.offeringId}/chat`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white font-bold text-lg">
                      {room.courseCode.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {room.courseName}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{room.courseCode}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-xs text-gray-500">Active chat room</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-blue-600 group-hover:text-blue-700">
                    <span className="font-medium">Join Chat</span>
                    <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Chat Rooms Available</h3>
            <p className="text-gray-500">There are no course chat rooms available at the moment. Check back later or contact your instructor.</p>
          </div>
        )}
      </div>
    </div>
  );
}