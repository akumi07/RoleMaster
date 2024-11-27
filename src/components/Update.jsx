import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase/firebase"; // Assuming firebase is set up correctly
import { doc, getDoc, updateDoc } from "firebase/firestore";

const UpdateUser = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { name, email, userId, role } = location.state || {}; // Default to an empty object if location.state is missing

  // Debug log to ensure location.state is being passed correctly
  console.log("Location state:", location.state);

  // Initialize state for updated user data
  const [userData, setUserData] = useState({
    name: name || "",
    email: email || "",
    role: role || "user", // Set default role if not provided
  });

  // Fetch current user data if userId is available
  useEffect(() => {
    if (userId) {
      const fetchUserData = async () => {
        const userRef = doc(db, "users", userId);
        try {
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            setUserData(userDoc.data());
            console.log("User data fetched:", userDoc.data()); // Log user data fetched from Firestore
          } else {
            console.log("User not found in Firestore.");
          }
        } catch (error) {
          console.log("Error fetching user data:", error);
        }
      };
      fetchUserData();
    } else {
      console.log("Error: No userId provided.");
    }
  }, [userId]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Check if userId is available (for submitting the data)
    if (!userId) {
      console.error("User ID is missing.");
      return; // Prevent form submission if userId is missing
    }
  
    // Check if userData is fully defined
    if (!userData.name || !userData.email || !userData.role) {
      console.error("User data is incomplete.");
      return; // Prevent form submission if any of the fields are missing
    }
  
    try {
      // Log userData before submitting to Firestore
      console.log("Submitting user data:", userData);

      // Update user document in Firestore
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, userData);
  
      // Redirect to user management page after update
      console.log("User updated successfully.");
      navigate("/userManagement"); 
    } catch (error) {
      console.error("Error updating user: ", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-4xl w-full p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">Update User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={userData.name}
              onChange={handleInputChange}
              className="w-full p-3 mt-1 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleInputChange}
              className="w-full p-3 mt-1 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Role</label>
            <select
              name="role"
              value={userData.role}
              onChange={handleInputChange}
              className="w-full p-3 mt-1 border border-gray-300 rounded-md"
              required
            >
              <option value="user">User</option>
              <option value="candidate">Candidate</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
            >
              Update User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateUser;
