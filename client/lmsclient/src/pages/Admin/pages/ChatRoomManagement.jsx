import React, { useEffect, useState } from "react";
import { api } from "../../../lib/api";

export default function ChatRoomManagement() {
  const [chatRooms, setChatRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState(""); // "" | "academic" | "course"
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomMembers, setRoomMembers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [academicData, courseData, usersData, coursesData] =
        await Promise.all([
          api.get("/chat-rooms/academic"),
          api.get("/chat-rooms/course"),
          api.get("/users"),
          api.get("/courses"),
        ]);

      // Combine academic and course chat rooms with type info
      const allRooms = [];
      const academicRooms = Array.isArray(academicData)
        ? academicData
        : academicData?.data || [];
      const courseRooms = Array.isArray(courseData)
        ? courseData
        : courseData?.data || [];
      if (Array.isArray(academicRooms)) {
        allRooms.push(
          ...academicRooms.map((room) => ({
            ...room,
            roomType: "academic",
            memberCount:
              room.membersCount ??
              room.memberCount ??
              (Array.isArray(room.members) ? room.members.length : 0),
          }))
        );
      }
      if (Array.isArray(courseRooms)) {
        allRooms.push(
          ...courseRooms.map((room) => ({
            ...room,
            roomType: "course",
            memberCount:
              room.membersCount ??
              room.memberCount ??
              (Array.isArray(room.members) ? room.members.length : 0),
          }))
        );
      }
      setChatRooms(allRooms);
      setUsers(Array.isArray(usersData) ? usersData : usersData?.data || []);
      setCourses(
        Array.isArray(coursesData) ? coursesData : coursesData?.data || []
      );
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomMembers = async (room) => {
    try {
      const endpoint =
        room.roomType === "academic"
          ? `/chat-rooms/academic/${room.id}/members`
          : `/chat-rooms/course/${room.id}/members`;
      const data = await api.get(endpoint);
      const members = Array.isArray(data) ? data : data?.data || [];
      // Enrich members with user details from cache
      const enriched = members.map((m) => {
        const user = users.find((u) => u.id === m.userId) || {};
        return {
          ...m,
          fullName: user.fullName || user.username || "Unknown",
          email: user.email || "",
          role: user.role || "",
        };
      });
      setRoomMembers(enriched);
    } catch (err) {
      console.error("Error fetching room members:", err);
      setRoomMembers([]);
    }
  };

  const filteredRooms = Array.isArray(chatRooms)
    ? chatRooms.filter((room) => {
        const matchesSearch =
          room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = !typeFilter || room.roomType === typeFilter;
        return matchesSearch && matchesType;
      })
    : [];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Chat Room Management
            </h1>
            <p className="text-gray-600">
              View and manage chat rooms and their members
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Chat Rooms
              </label>
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All</option>
                <option value="academic">Academic</option>
                <option value="course">Course</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Chat Rooms ({filteredRooms.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Members
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRooms.length > 0 ? (
                  filteredRooms.map((room) => (
                    <tr
                      key={room.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {room.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {room.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {room.offeringId
                            ? courses.find((c) => c.id === room.courseId)
                                ?.title || "Course Room"
                            : "Academic Room"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            room.roomType === "course"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {room.roomType === "course" ? "Course" : "Academic"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {typeof room.memberCount === "number"
                            ? room.memberCount
                            : 0}{" "}
                          members
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(room.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedRoom(room);
                            fetchRoomMembers(room);
                            setShowMembersModal(true);
                          }}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          View Members
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          No chat rooms found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Try adjusting your search criteria.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Members Modal */}
        {showMembersModal && selectedRoom && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Manage Members - {selectedRoom.name}
                  </h3>
                  <button
                    onClick={() => setShowMembersModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Room Members ({roomMembers.length})
                  </h4>
                  <div className="space-y-2">
                    {roomMembers.length > 0 ? (
                      roomMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                            {member.fullName?.charAt(0) || "U"}
                          </div>
                          <div className="ml-3 flex items-center justify-between w-full">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {member.fullName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {member.email}
                              </div>
                            </div>
                            <span className="ml-4 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize">
                              {member.role || 'member'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <svg
                          className="mx-auto h-8 w-8 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                          />
                        </svg>
                        <p className="mt-2 text-sm">No members in this room</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
