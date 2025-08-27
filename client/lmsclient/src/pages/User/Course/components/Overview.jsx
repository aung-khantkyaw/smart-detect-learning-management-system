import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function Overview() {
  const { course } = useOutletContext() || {};
  const [loading, setLoading] = useState(!course);

  if (loading && !course) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
     
        
     
        <div className="border border-gray-200 bg-gray-50 p-6">
          <div className="space-y-4">
           
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Learning Outcomes</h3>
              <p className="text-gray-700 leading-relaxed">
                By the end of this course, you will be able to develop parallel and distributed applications, optimize performance, and address challenges like coordination and fault tolerance in real-world computing systems.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="border-l-4 border-blue-600 pl-4">
                <h4 className="font-medium text-gray-900">Course Code</h4>
                <p className="text-gray-600">{course?.code || 'N/A'}</p>
              </div>
              
              <div className="border-l-4 border-purple-600 pl-4">
                <h4 className="font-medium text-gray-900">Course Title</h4>
                <p className="text-gray-600">{course?.title || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}