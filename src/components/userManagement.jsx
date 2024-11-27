import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase/firebase";
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
import { signOut } from "firebase/auth";


const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [bulkAction, setBulkAction] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
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
          setIsAdmin(true);
        }
      } else {
        signOut(auth);
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

  const toggleActiveStatus = async (userId, currentStatus) => {
    try {
      const updatedUsers = users.map((user) =>
        user.id === userId ? { ...user, isToggling: true } : user
      );
      setUsers(updatedUsers);

      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { active: !currentStatus });

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? { ...user, active: !currentStatus, isToggling: false }
            : user
        )
      );
    } catch (error) {
      console.error("Error toggling active status:", error);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, isToggling: false } : user
        )
      );
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  const handleBulkAction = (action) => {
    if (action === "delete") {
      if (isAdmin) {
        setShowDeleteModal(true);
      } else {
        alert("You do not have permission to delete users.");
      }
    } else if (action === "activate") {
      selectedUsers.forEach(async (userId) => {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { active: true });
      });
      setSelectedUsers([]);
    }
    setBulkAction("");
  };

  const handleDelete = async () => {
    if (isAdmin) {
      selectedUsers.forEach(async (userId) => {
        await deleteDoc(doc(db, "users", userId));
      });
      setShowDeleteModal(false);
      setSelectedUsers([]);
      setBulkAction("");
    } else {
      alert("You do not have permission to delete users.");
    }
  };

  const indexOfLastUser = currentPage * rowsPerPage;
  const indexOfFirstUser = indexOfLastUser - rowsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const totalUsers = filteredUsers.length;

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen overflow-y-auto">
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

      <div className="overflow-x-auto w-full">
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
                  checked={
                    selectedUsers.length === users.length && users.length > 0
                  }
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
              <tr
                key={user.id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="p-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleCheckboxChange(user.id)}
                    className="rounded"
                  />
                </td>
                <td className=" p-4 
    truncate 
    whitespace-nowrap 
    overflow-hidden 
    text-ellipsis 
    min-w-[200px] 
    max-w-[250px]">
                  <img
                    src={`https://i.pravatar.cc/50?u=${user.id}`}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex flex-col">
                    <p className="font-medium">{user.name}</p>
                    <p
                      className="text-sm text-gray-500 truncate max-w-[200px] overflow-hidden"
                      title={user.email} // Tooltip for full email visibility
                    >
                      {user.email}
                    </p>
                  </div>
                </td>

                <td className="p-4">{user.role}</td>
                <td className="p-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={user.active}
                      onChange={() => toggleActiveStatus(user.id, user.active)}
                      className="sr-only peer"
                      disabled={user.isToggling} // Disable while toggling
                    />
                    <div
                      className={`w-11 h-6 rounded-full transition-all ${
                        user.active ? "bg-green-500" : "bg-gray-300"
                      } peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300`}
                    />
                    <div
                      className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all ${
                        user.active ? "translate-x-full" : ""
                      }`}
                    />
                    {user.isToggling && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="spinner-border animate-spin inline-block w-4 h-4 border-2 border-white rounded-full"></div>
                      </div>
                    )}
                  </label>
                </td>

                <td className="p-4 text-center">
                  <button
                    onClick={() => navigate(`/edit-user/${user.id}`)}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => {
                      setUserToDelete(user);
                      setShowDeleteModal(true);
                    }}
                    className="ml-4 text-red-500 hover:text-red-600"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="p-2 bg-blue-500 text-white rounded-l-lg hover:bg-blue-600"
          >
            Prev
          </button>
          <span className="text-gray-500">
            {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, totalUsers)} of{" "}
            {totalUsers} user{totalUsers !== 1 ? "s" : ""}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="p-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
          >
            Next
          </button>
        </div>

        <div className="ml-4">
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            className="p-2 border rounded-lg"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={15}>15 per page</option>
          </select>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-semibold">Confirm Deletion</h2>
            <p className="mt-2">
              Are you sure you want to delete the selected users?
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
