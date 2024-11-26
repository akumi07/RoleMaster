// UserTable.js (Part 3)
const UserTable = ({
    users,
    selectedUsers,
    setSelectedUsers,
    toggleActiveStatus,
    handleDelete,
    navigate,
  }) => {
    const handleCheckboxChange = (id) => {
      setSelectedUsers((prev) =>
        prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
      );
    };
  
    return (
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
                  checked={
                    selectedUsers.length === users.length && users.length > 0
                  }
                  className="rounded"
                />
              </th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-left">Active</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
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
                      onChange={() => toggleActiveStatus(user.id)}
                      className="sr-only peer"
                    />
                    <span className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500"></span>
                    <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-full transition-all"></span>
                  </label>
                </td>
                <td className="p-4 space-x-2">
                  <button
                    onClick={() => navigate(`/update-user/${user.id}`)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  export default UserTable;
  