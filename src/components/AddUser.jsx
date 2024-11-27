import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { app } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import emailjs from "emailjs-com";

function AddUserForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [adminEmail, setAdminEmail] = useState(""); // Admin email field
  const [role, setRole] = useState("user"); // Role selection
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");
  const [isFirstAdmin, setIsFirstAdmin] = useState(false); // Track if this is the first admin registration
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const db = getFirestore(app);
  const navigate = useNavigate();

  // Check if any admins exist on component load
  useEffect(() => {
    const checkForAdmins = async () => {
      try {
        const adminQuery = query(
          collection(db, "users"),
          where("role", "==", "admin")
        );
        const adminSnapshot = await getDocs(adminQuery);

        if (adminSnapshot.empty) {
          setIsFirstAdmin(true); // Trigger first admin mode
          setRole("admin"); // Default role to admin for the first user
        }
      } catch (error) {
        console.error("Error checking for admins:", error);
        alert("Failed to verify admin status. Please try again.");
      }
    };

    checkForAdmins();
  }, [db]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Step 1: Check if admin email exists in Firestore with role=admin
      const querySnapshot = await getDocs(
        query(
          collection(db, "users"),
          where("email", "==", adminEmail.toLowerCase())
        )
      );

      if (querySnapshot.empty) {
        alert("Admin email not found in the database.");
        setIsLoading(false);
        return;
      }

      const adminDoc = querySnapshot.docs[0]; // Get the first document that matches the email
      if (adminDoc.data().role !== "admin") {
        alert(
          "Action not allowed. Admin email is not registered with role=admin."
        );
        setIsLoading(false);
        return;
      }

      // Step 2: Generate OTP and send it to the admin email
      const newOtp = Math.floor(1000 + Math.random() * 9000); // Generate 4-digit OTP
      setGeneratedOtp(newOtp.toString()); // Save OTP for later verification

      // Send email using EmailJS
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID, // Service ID from .env
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID, // Template ID from .env
        {
          admin_email: adminEmail,
          otp: newOtp,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY// Public key from .env
      );

      alert("OTP sent to admin email!");
      setOtpSent(true); // Display OTP input field
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();

    if (otp === generatedOtp) {
      setVerificationStatus("OTP verified successfully!");

      try {
        const userData = {
          name,
          email,
          role,
          status: "inactive",
        };

        await addDoc(collection(db, "users"), userData);

        alert("User added successfully!");
        navigate("/userManagement");
      } catch (error) {
        console.error("Error saving user data:", error);
        alert("Failed to save user data. Please try again.");
      }
    } else {
      setVerificationStatus("Invalid OTP. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isFirstAdmin ? "Register First Admin" : "Add User"}
        </h2>
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Admin Email
            </label>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              disabled={isFirstAdmin} // Disable role selection for first admin
            >
              <option value="admin">Admin</option>
              <option value="candidate">Candidate</option>
              <option value="user">User</option>
            </select>
          </div>

          {otpSent && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          )}

          {!otpSent ? (
            <button
              type="submit"
              className={`w-full ${
                isLoading ? "bg-gray-400" : "bg-blue-500"
              } text-white py-2 px-4 rounded-md`}
              disabled={isLoading}
            >
              {isLoading ? "Sending OTP..." : "Send OTP"}
            </button>
          ) : (
            <button
              onClick={handleOtpVerification}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-md"
            >
              Verify OTP
            </button>
          )}
        </form>

        {verificationStatus && (
          <div className="mt-4 text-center text-red-500">
            {verificationStatus}
          </div>
        )}
      </div>
    </div>
  );
}

export default AddUserForm;
