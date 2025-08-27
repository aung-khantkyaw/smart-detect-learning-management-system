import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function Materials() {
  const { id } = useParams();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, [id]);

  const fetchMaterials = async () => {
    const token = localStorage.getItem("accessToken");
    
    try {
      // Get course offerings to find the offering ID for this course
      const offeringsRes = await fetch(`http://localhost:3000/api/course-offerings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const offeringsData = await offeringsRes.json();
      
      if (offeringsData.status === "success") {
        // Find offering for this course
        const offering = offeringsData.data.find(o => o.courseId === id);
        
        if (offering) {
          // Fetch materials using offering ID
          const materialsRes = await fetch(`http://localhost:3000/api/materials/offering/${offering.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (materialsRes.ok) {
            const materialsData = await materialsRes.json();
            
            if (Array.isArray(materialsData)) {
              setMaterials(materialsData);
            } else if (materialsData.status === "success" && Array.isArray(materialsData.data)) {
              setMaterials(materialsData.data);
            } else {
              setMaterials([]);
            }
          } else {
            setMaterials([]);
          }
        } else {
          setMaterials([]);
        }
      } else {
        setMaterials([]);
      }
    } catch (err) {
      console.error("Error fetching materials:", err);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-3">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Materials</span>
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-4">Course Materials</h2>

        <div className="border border-gray-200 bg-gray-50">
          {materials.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {materials.map((material) => (
                <div key={material.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{material.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{material.description || "No description provided."}</p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <span>Uploaded: {new Date(material.createdAt).toLocaleDateString()}</span>
                        {material.fileUrl && (
                          <span className="ml-4">
                            <a 
                              href={material.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Download File
                            </a>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-sm font-medium text-gray-900">No materials available</h3>
              <p className="mt-1 text-sm text-gray-500">There are no materials uploaded for this course yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}