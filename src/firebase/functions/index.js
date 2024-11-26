const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
import { resendKey } from "../firebase";
admin.initializeApp();

// Function to send OTP to admin email
exports.sendOtp = functions.https.onCall(async (data, context) => {
  const email = data.email; // Get email from client

  if (!email) {
    throw new functions.https.HttpsError("invalid-argument", "Email is required.");
  }

  // Generate a 4-digit OTP (you can customize this logic)
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // Store OTP and email temporarily (e.g., in Firestore)
  const otpRef = admin.firestore().collection('otps').doc(email);
  await otpRef.set({ otp });

  // Send OTP to email using Resend API
//   const resendApiKey = functions.config().resendKey; // Get API Key from Firebase config
  
  try {
    const response = await axios.post(
      'https://api.resend.io/v1/email',
      {
        from: "iitakashmishra@gmail.com",  // Use your verified sender email
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is: ${otp}`
      },
      {
        headers: {
          "Authorization": `Bearer ${resendKey}`,
        }
      }
    );

    return { message: "OTP sent successfully", success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new functions.https.HttpsError("unknown", "Failed to send OTP.");
  }
});
