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
      const res = await fetch(`http://localhost:3000/api/materials/offering/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        console.error("Failed to fetch materials:", res.status, res.statusText);
        setMaterials([]);
        return;
      }
      
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setMaterials(data);
      } else if (data.status === "success") {
        setMaterials(Array.isArray(data.data) ? data.data : []);
      } else {
        console.error("Materials API error:", data.message || 'Unknown error');
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
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Materials
      </h1>

      {materials.length === 0 ? (
        <p className="text-gray-700 dark:text-gray-300">
          No materials available at the moment.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => (
            <div
              key={material.id}
              className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 flex flex-col justify-between hover:shadow-xl transition"
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {material.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">
                  {material.description || "No description provided."}
                </p>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                  Created at: {new Date(material.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="mt-4 flex space-x-2">
                {material.fileUrl && (
                  <>
                    <a
                      href={material.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition"
                    >
                      View
                    </a>
                    <a
                      href={material.fileUrl}
                      download
                      className="flex-1 text-center bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition"
                    >
                      Download
                    </a>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
