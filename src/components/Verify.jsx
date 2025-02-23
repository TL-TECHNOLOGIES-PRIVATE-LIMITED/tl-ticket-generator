import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useFormik } from "formik";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, signInWithCredential, PhoneAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAv5eb6I1AEY_UfX1S8r2IVOWJD0sIVFXo",
  authDomain: "swayamvara-ticket-generator.firebaseapp.com",
  projectId: "swayamvara-ticket-generator",
  storageBucket: "swayamvara-ticket-generator.firebasestorage.app",
  messagingSenderId: "586038179958",
  appId: "1:586038179958:web:195e1f3393364472c28757",
  measurementId: "G-QWX9RVZ9L8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const PhoneAuth = ( {onVerificationSuccess ,isPhoneVerified}) => {
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [verified, setVerified] = useState(false);
  const otpRefs = useRef([]);
  const recaptchaContainerRef = useRef(null);

  useEffect(() => {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "visible",
    });
  }, []);

  const { handleChange, handleSubmit, values } = useFormik({
    initialValues: {
      phone: "",
    },
    onSubmit: async (data) => {
      if (data.phone.length < 10) {
        setError("Please enter a valid phone number");
        return;
      }
      try {
        const confirmation = await signInWithPhoneNumber(auth, `+${data.phone}`, window.recaptchaVerifier);
        setConfirmationResult(confirmation);
        setShowOtpInput(true);
        setError("");
      } catch (err) {
        setError("Failed to send OTP. Try again.");
      }
    },
  });

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = otp.split("");
    newOtp[index] = value;
    setOtp(newOtp.join(""));
    if (value && index < otpRefs.current.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    try {
      const credential = PhoneAuthProvider.credential(confirmationResult.verificationId, otp);
      await signInWithCredential(auth, credential);
      setError("");
console.log(credential)
      onVerificationSuccess(true);

     alert("OTP Verified Successfully");
    } catch (err) {
      setError("Invalid OTP. Try again.");
    }
  };

  return (
    <div className="flex items-center justify-center ">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center rounded-3xl w-full"
      >
        <h2 className="text-2xl font-bold mb-6 text-pink-600">Phone Authentication</h2>

        {!verified && !showOtpInput && (
          <form onSubmit={handleSubmit} className="w-full">
            <div className="relative">
              <PhoneInput
                country={"in"}
                value={values.phone}
                onChange={(value) => handleChange({ target: { name: "phone", value } })}
                containerClass="w-full"
                inputClass="!w-full !py-3 !px-4 !border !border-pink-200 !rounded-xl focus:!border-pink-500 focus:!ring-2 focus:!ring-pink-200 !text-gray-800"
                buttonClass="!border-pink-200 !rounded-l-xl"
                dropdownClass="!bg-white !border-pink-200"
              />
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <button
              type="submit"
              className="mt-6 w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              disabled={!!error}
            >
              Send OTP
            </button>
          </form>
        )}

        {showOtpInput && !verified && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 w-full flex flex-col items-center"
          >
            <p className="text-sm text-pink-600 mb-4">Enter the OTP sent to your phone</p>
            <div className="flex space-x-3">
              {[...Array(6)].map((_, index) => (
                <input
                  key={index}
                  ref={(el) => (otpRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  className="w-12 h-12 text-center border border-pink-200 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-lg font-semibold text-pink-600"
                  value={otp[index] || ""}
                  onChange={(e) => handleOtpChange(e, index)}
                />
              ))}
            </div>
            <button
              onClick={handleVerifyOtp}
              className="mt-6 w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Verify OTP
            </button>
          </motion.div>
        )}

        {verified && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 w-full text-center"
          >
            <p className="text-lg font-semibold text-green-600">Phone Number Verified Successfully!</p>
          </motion.div>
        )}

<div id="recaptcha-container" ref={recaptchaContainerRef} className="mt-6"></div>
      </motion.div>
    </div>
  );
};

export default PhoneAuth;
