/* eslint-disable no-unused-vars */
import React, { useRef, useState } from "react";
import RoomIcon from "@mui/icons-material/Room";
import CloseIcon from "@mui/icons-material/Close";
import { useAuthStore } from "../store/authStore";
import "./login.css";

export default function Login({ setShowLogin, setShowRegister }) {
  const { login } = useAuthStore();
  const [error, setError] = useState(null);
  const emailRef = useRef();
  const passwordRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(emailRef.current.value, passwordRef.current.value);
      setShowLogin(false);
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="loginContainer">
      <div className="logo">
        <RoomIcon className="logoIcon" />
        <span>PlacerPin</span>
      </div>
      <form onSubmit={handleSubmit}>
        <input autoFocus placeholder="Email" ref={emailRef} />
        <input type="password" placeholder="Password" ref={passwordRef} />
        <button className="loginBtn" type="submit">
          Login
        </button>
        {error && <span className="failure">{error}</span>}
      </form>
      <CloseIcon className="loginCancel" onClick={() => setShowLogin(false)} />
      {/* Optionally add a link to switch to register */}
      <span
        onClick={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
        className="switchModal"
      >
        Don't have an account? Register
      </span>
    </div>
  );
}
