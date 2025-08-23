import React ,{useState} from 'react'
import { Upload, FileText, Trash2, Edit } from "lucide-react";
export default function Materials() {

      const [materials, setMaterials] = useState([
    { id: 1, title: "Week 1 - Introduction.pdf", date: "2025-08-22" },
    { id: 2, title: "Week 2 - Database Design.pptx", date: "2025-08-23" },
  ]);
  const [newFile, setNewFile] = useState(null);

  const handleUpload = () => {
    if (newFile) {
      const newMaterial = {
        id: Date.now(),
        title: newFile.name,
        date: new Date().toISOString().split("T")[0],
      };
      setMaterials([...materials, newMaterial]);
      setNewFile(null);
    }
  };

  const handleDelete = (id) => {
    setMaterials(materials.filter((m) => m.id !== id));
  };


  return (
     <div className="p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">📚 Course Materials</h2>

      {/* Upload Section */}
      <div className="flex items-center space-x-4 mb-6">
        <input
          type="file"
          onChange={(e) => setNewFile(e.target.files[0])}
          className="border rounded-lg px-3 py-2"
        />
        <button
          onClick={handleUpload}
          className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          <Upload className="w-4 h-4 mr-2" /> Upload
        </button>
      </div>

      {/* Materials List */}
      <ul className="space-y-3">
        {materials.map((m) => (
          <li
            key={m.id}
            className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-sm"
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="font-medium text-gray-800">{m.title}</p>
                <p className="text-sm text-gray-500">Uploaded: {m.date}</p>
              </div>
            </div>

            <div className="flex space-x-2">
              <button className="p-2 rounded-full hover:bg-indigo-100">
                <Edit className="w-5 h-5 text-indigo-600" />
              </button>
              <button
                onClick={() => handleDelete(m.id)}
                className="p-2 rounded-full hover:bg-red-100"
              >
                <Trash2 className="w-5 h-5 text-red-600" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
