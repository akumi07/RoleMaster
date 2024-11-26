// Header.js (Part 2)
const Header = ({
    navigate,
    searchQuery,
    setSearchQuery,
    selectedUsers,
    setSelectedUsers,
    users,
    setUsers,
  }) => {
    // Handle bulk actions
    const handleBulkAction = (action) => {
      if (action === "activate") {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            selectedUsers.includes(user.id) ? { ...user, active: true } : user
          )
        );
      } else if (action === "delete") {
        setUsers((prevUsers) =>
          prevUsers.filter((user) => !selectedUsers.includes(user.id))
        );
      }
      setSelectedUsers([]);
    };
  
    return (
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        {/* Add User Button */}
        <button
          onClick={() => navigate("/add-user")}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Add User
        </button>
  
        {/* Bulk Actions */}
        <div className="flex items-center mt-4 md:mt-0">
          <select
            onChange={(e) => handleBulkAction(e.target.value)}
            defaultValue=""
            className="mr-4 p-2 border rounded-lg"
          >
            <option value="" disabled>
              Action
            </option>
            <option value="activate">Activate Users</option>
            <option value="delete">Delete Users</option>
          </select>
  
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search for users"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border rounded-lg w-full md:w-64"
          />
        </div>
      </div>
    );
  };
  
  export default Header;
  