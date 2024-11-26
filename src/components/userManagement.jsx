import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase/firebase"; // Assuming auth is imported here
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { signOut } from "firebase/auth"; // Firebase sign out function

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [bulkAction, setBulkAction] = useState(""); // Track dropdown value
  const usersPerPage = 5;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // To track if user is admin

  useEffect(() => {
    // Check if logged-in user has admin role
    const checkAdminRole = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const q = query(
          collection(db, "users"),
          where("email", "==", currentUser.email),
          where("role", "==", "admin")
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setIsAdmin(true); // User is admin
        }
      } else {
        // Not logged in
        signOut(auth); // Log out if not authenticated
      }
    };

    checkAdminRole();

    const usersCollection = collection(db, "users");
    const unsubscribe = onSnapshot(
      usersCollection,
      (snapshot) => {
        const fetchedUsers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(fetchedUsers);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching users:", error);
        setError("Failed to fetch users.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCheckboxChange = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  const handleBulkAction = (action) => {
    if (action === "delete") {
      if (isAdmin) {
        setShowDeleteModal(true); // Open delete modal
      } else {
        alert("You do not have permission to delete users.");
      }
    } else if (action === "activate") {
      selectedUsers.forEach(async (userId) => {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { active: true });
      });
      setSelectedUsers([]); // Clear selections after action
    }
    setBulkAction(""); // Reset dropdown to default
  };

  const handleDelete = async () => {
    // Ensure the logged-in user is admin before deleting
    if (isAdmin) {
      selectedUsers.forEach(async (userId) => {
        await deleteDoc(doc(db, "users", userId));
      });
      setShowDeleteModal(false); // Close modal
      setSelectedUsers([]); // Clear selections
      setBulkAction(""); // Reset dropdown to default
    } else {
      alert("You do not have permission to delete users.");
    }
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const toggleActiveStatus = async (user) => {
    const userRef = doc(db, "users", user.id);
    await updateDoc(userRef, { active: !user.active });
    setUsers((prevUsers) =>
      prevUsers.map((userItem) =>
        userItem.id === user.id
          ? { ...userItem, active: !userItem.active }
          : userItem
      )
    );
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <button
          onClick={() => navigate("/add-user")}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Add User
        </button>

        <div className="flex items-center mt-4 md:mt-0">
          <select
            value={bulkAction}
            onChange={(e) => {
              setBulkAction(e.target.value);
              handleBulkAction(e.target.value);
            }}
            className="mr-4 p-2 border rounded-lg"
          >
            <option value="" disabled>
              Action
            </option>
            <option value="activate">Activate User</option>
            <option value="delete">Delete User</option>
          </select>

          <input
            type="text"
            placeholder="Search for users"
            value={searchQuery}
            onChange={handleSearch}
            className="p-2 border rounded-lg w-full md:w-64"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table-auto w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-4 text-center">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    setSelectedUsers(
                      e.target.checked ? users.map((user) => user.id) : []
                    )
                  }
                  checked={selectedUsers.length === users.length && users.length > 0}
                  className="rounded"
                />
              </th>
              <th className="p-4 text-left">Name & Email</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-left">Active</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr key={user.id} className="border-t hover:bg-gray-50 transition">
                <td className="p-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleCheckboxChange(user.id)}
                    className="rounded"
                  />
                </td>
                <td className="p-4 flex items-center space-x-4">
                  <img
                    src={`https://i.pravatar.cc/50?u=${user.id}`}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </td>
                <td className="p-4">{user.role}</td>
                <td className="p-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={user.active}
                      onChange={() => toggleActiveStatus(user)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-full peer-checked:border-white transition-all"></div>
                  </label>
                </td>
                <td className="p-4 space-x-4">
                  {/* Edit button */}
                  <button
                    onClick={() => {
                      if (isAdmin) {
                        navigate(`/update-user/${user.id}`);
                      } else {
                        alert("You do not have permission to edit users.");
                      }
                    }}
                    className="text-yellow-500 hover:text-yellow-600 transition"
                  >
                    <FaEdit />
                  </button>
                  {/* Delete button */}
                  <button
                    onClick={() => {
                      if (isAdmin) {
                        setUserToDelete(user.id);
                        setShowDeleteModal(true);
                      } else {
                        alert("You do not have permission to delete users.");
                      }
                    }}
                    className="text-red-500 hover:text-red-600 transition"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          className="p-2 bg-blue-500 text-white rounded-lg"
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <button
          className="p-2 ml-2 bg-blue-500 text-white rounded-lg"
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === Math.ceil(filteredUsers.length / usersPerPage)}
        >
          Next
        </button>
      </div>

      {/* Modal for Delete */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="text-xl">Are you sure you want to delete?</h2>
            <div className="mt-4 space-x-4">
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
