import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Materials() {
  const { id } = useParams();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    file: null
  });

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
      console.log("Materials response:", data);
      
      // API returns array directly, not wrapped in status object
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

  const handleUpload = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    
    if (!formData.title.trim()) {
      alert("Please enter a title");
      return;
    }
    
    console.log("=== UPLOAD DEBUG ===");
    console.log("Offering ID:", id);
    console.log("Form data:", {
      title: formData.title,
      description: formData.description,
      hasFile: !!formData.file,
      fileName: formData.file?.name
    });
    
    // First verify the offering exists
    try {
      const offeringRes = await fetch(`http://localhost:3000/api/course-offerings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const offerings = await offeringRes.json();
      const offeringExists = offerings.data?.find(o => o.id === id);
      
      if (!offeringExists) {
        alert("Course offering not found. Please check the course ID.");
        return;
      }
      
      console.log("Offering verified:", offeringExists);
    } catch (err) {
      console.error("Error verifying offering:", err);
    }
    
    // Try simple JSON first (no file)
    const requestBody = {
      title: formData.title,
      description: formData.description || ""
    };
    
    console.log("Request body:", requestBody);

    try {
      const res = await fetch(`http://localhost:3000/api/materials/offering/${id}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log("Upload response status:", res.status);
      
      if (res.ok) {
        const result = await res.json();
        console.log("Upload success:", result);
        setShowUploadModal(false);
        setFormData({ title: "", description: "", file: null });
        fetchMaterials();
        
        // Success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.innerHTML = `
          <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Material uploaded successfully!
          </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
      } else {
        const errorText = await res.text();
        console.error("Upload failed:", res.status, res.statusText);
        console.error("Error response:", errorText);
        
        try {
          const error = JSON.parse(errorText);
          alert(error.error || error.message || `Upload failed: ${res.status}`);
        } catch {
          alert(`Upload failed: ${res.status} ${res.statusText}\n${errorText}`);
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed: " + err.message);
    }
  };

  const handleDelete = async (materialId) => {
    if (!confirm("Are you sure you want to delete this material?")) return;
    
    const token = localStorage.getItem("accessToken");
    
    try {
      const res = await fetch(`http://localhost:3000/api/materials/${materialId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        fetchMaterials();
      } else {
        const error = await res.json();
        alert(error.message || "Delete failed");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed");
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Course Materials</h2>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Upload Material
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {materials.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {materials.map((material) => (
              <div key={material.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{material.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <span>Uploaded: {new Date(material.createdAt).toLocaleDateString()}</span>
                      {material.fileUrl && (
                        <span className="ml-4">
                          <a 
                            href={material.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download File
                          </a>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDelete(material.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No materials uploaded</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by uploading your first material.</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Upload Material</h3>
            </div>
            
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">File</label>
                <input
                  type="file"
                  onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}