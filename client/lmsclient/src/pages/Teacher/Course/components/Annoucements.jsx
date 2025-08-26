import { useState }  from "react";
import React from "react";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Welcome to the Course 🎉",
      message: "Please check the course outline and materials uploaded.",
      date: "2025-08-23",
    },
    {
      id: 2,
      title: "Assignment 1 Released",
      message: "Submit your assignment by next Friday (Aug 30).",
      date: "2025-08-20",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", message: "" });

  const handleCreate = () => {
    const newAnnouncement = {
      id: Date.now(),
      title: formData.title,
      message: formData.message,
      date: new Date().toISOString().split("T")[0],
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    setFormData({ title: "", message: "" });
    setShowForm(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">📢 Announcements</h2>
        <button
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="w-4 h-4 mr-2" /> New Announcement
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="border rounded-lg p-4 bg-white shadow">
          <h3 className="text-lg font-semibold mb-2">Create Announcement</h3>
          <input
            type="text"
            placeholder="Title"
            className="w-full border rounded-lg p-2 mb-2"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <textarea
            placeholder="Message"
            rows={4}
            className="w-full border rounded-lg p-2 mb-2"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          />
          <div className="flex justify-end space-x-2">
            <button
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={handleCreate}
            >
              Publish
            </button>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((a) => (
          <div
            key={a.id}
            className="border rounded-lg p-4 bg-white shadow flex flex-col"
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-lg font-semibold">{a.title}</h3>
                <p className="text-sm text-gray-500">{a.date}</p>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 border rounded hover:bg-gray-100">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 border rounded text-red-600 hover:bg-red-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-gray-700">{a.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
