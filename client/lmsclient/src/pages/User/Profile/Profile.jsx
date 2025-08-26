import React from 'react'
import { useState ,useEffect} from "react";

export default function Profile() {
 const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUserData = localStorage.getItem("userData");
    
    if (!token) {
      console.error("No token found - please login again");
      setLoading(false);
      return;
    }

    // If we have stored user data, use it directly
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        setUser(userData);
        setLoading(false);
        return;
      } catch (err) {
        console.error("Error parsing stored user data:", err);
      }
    }

    // Fallback: try to get current user from API
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (data.status === "success") {
          setUser(data.data);
          localStorage.setItem("userData", JSON.stringify(data.data));
        } else {
          console.error(data.message);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);


  // const [activeTab, setActiveTab] = useState("overview");
  // const [formData, setFormData] = useState({
  //   name: user.name,
  //   email: user.email,
  // });
  // const [passwordData, setPasswordData] = useState({
  //   oldPassword: "",
  //   newPassword: "",
  //   confirmPassword: "",
  // });

  // Handle profile edit form
  // const handleProfileChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData({ ...formData, [name]: value });
  // };
  // const handleProfileSubmit = (e) => {
  //   e.preventDefault();
  //   alert("Profile updated successfully!");
  //   // API call to update user profile here
  // };

  // Handle password change form
  // const handlePasswordChange = (e) => {
  //   const { name, value } = e.target;
  //   setPasswordData({ ...passwordData, [name]: value });
  // };
  // const handlePasswordSubmit = (e) => {
  //   e.preventDefault();
  //   if (passwordData.newPassword !== passwordData.confirmPassword) {
  //     alert("Passwords do not match!");
  //     return;
  //   }
  //   alert("Password changed successfully!");
  //   // API call to update password here
  // };

  if (loading) {
    return (
         <div className="flex w-full flex-col items-center justify-center h-screen">
      <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
            <p>Loading ...</p>
    
    </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-lg text-red-600">Please login to view your profile</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Profile Card */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6">
          <div className="max-w-5xl mx-auto  rounded-2xl p-6">
  <div className="flex items-center space-x-6">
    <img
      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPpAh63HncAuJOC6TxWkGLYpS0WwNXswz9MA&s"
      alt="Profile"
      className="w-24 h-24 rounded-full border-4 border-indigo-500"
    />
    <div>
      <h1 className="text-2xl font-bold text-gray-800">{user?.full_name || user?.fullName}</h1>
      <p className="text-gray-600">{user?.email}</p>

      <p className="text-sm text-gray-500">
        Student Number: {user?.student_number}
      </p>
      <p className="text-sm text-gray-500">
        Academic Year: {user?.academicYear || "N/A"}
      </p>
    
   
    </div>
  </div>
</div>
      </div>
    </div>
  );
}
