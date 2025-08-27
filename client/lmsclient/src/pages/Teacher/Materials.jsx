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
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-3">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Materials</span>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Course Materials</h2>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 rounded-md"
          >
            Upload Material
          </button>
        </div>

        <div className="border border-gray-200 bg-gray-50">
        {materials.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {materials.map((material) => (
              <div key={material.id} className="p-4">
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
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Download File
                          </a>
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(material.id)}
                    className="text-red-600 hover:text-red-800 ml-4"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <h3 className="text-sm font-medium text-gray-900">No materials uploaded</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by uploading your first material.</p>
          </div>
        )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
        >
          <div className="bg-white max-w-md w-full">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Upload Material</h3>
            </div>
            
            <form onSubmit={handleUpload} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                <input
                  type="file"
                  onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
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