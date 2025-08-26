import React from "react";
import { useOutletContext } from "react-router-dom";

export default function TeacherOverview() {
  const { courseOffering } = useOutletContext();

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Course Information</h3>
              <div className="mt-2 space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Course Name</label>
                  <p className="text-gray-900">{courseOffering?.courseTitle || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Course Code</label>
                  <p className="text-gray-900">{courseOffering?.courseCode || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Academic Year</label>
                  <p className="text-gray-900">{courseOffering?.academicYear || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Course Description</h3>
              <div className="mt-2">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-900">
                    {courseOffering?.courseDescription || 'No description available for this course.'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Quick Stats</h3>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-xs text-blue-600">Materials</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-xs text-green-600">Students</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}