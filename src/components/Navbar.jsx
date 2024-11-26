import React, { useEffect } from "react";
import { Disclosure, DisclosureButton } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../context/LoginContext"; // Import the custom hook

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const { isLoggedIn, login, logout } = useLogin(); // Access login state and actions from context
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (user) {
      login(); // If a user is found in local/session storage, mark as logged in
    }
  }, [login]);

  const handleLoginLogout = () => {
    if (isLoggedIn) {
      // Logout logic
      logout();
      alert("You have been logged out!");
      navigate("/login");
    } else {
      // Redirect to login page
      navigate("/login");
    }
  };

  const handleNavigation = (href) => {
    if (href === "/userManagement" && !isLoggedIn) {
      // Redirect to login if not logged in
      alert("Please login to access the dashboard.");
      navigate("/login");
    } else {
      navigate(href); // Navigate to the intended route
    }
  };

  const navigation = [
    { name: "Dashboard", href: "/userManagement", current: true },
  ];

  return (
    <Disclosure as="nav" className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button */}
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <span className="block h-6 w-6 group-data-[open]:hidden">
                <Bars3Icon />
              </span>
              <span className="hidden h-6 w-6 group-data-[open]:block">
                <XMarkIcon />
              </span>
            </DisclosureButton>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div
              className="flex shrink-0 items-center cursor-pointer"
              onClick={() => navigate("/")} // Redirect to homepage on logo click
            >
              <img alt="Your Company" src="/logo.svg" className="h-8 w-auto" />
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className={classNames(
                      item.current
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white",
                      "rounded-md px-3 py-2 text-sm font-medium"
                    )}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {/* Login/Logout Button */}
            <button
              onClick={handleLoginLogout}
              type="button"
              className={`relative px-5 py-2 rounded-full ${
                isLoggedIn
                  ? "bg-red-500 hover:bg-red-600 text-white" // Red button for Logout
                  : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white" // Gradient button for Login
              } font-medium shadow-lg hover:shadow-xl hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out`}
            >
              {isLoggedIn ? "Logout" : "Login"}
            </button>
          </div>
        </div>
      </div>

      <Disclosure.Panel className="sm:hidden">
        <div className="space-y-1 px-2 pb-3 pt-2">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as="button"
              onClick={() => handleNavigation(item.href)}
              className={classNames(
                item.current
                  ? "bg-gray-900 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white",
                "block rounded-md px-3 py-2 text-base font-medium"
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </Disclosure.Panel>
    </Disclosure>
  );
}
