/* eslint-disable no-unused-vars */
import React, { useRef, useState } from "react";
import RoomIcon from "@mui/icons-material/Room";
import CloseIcon from "@mui/icons-material/Close";
import { useAuthStore } from "../store/authStore";
import "./register.css";

export default function Register({ setShowRegister, setShowLogin }) {
  const { signup } = useAuthStore();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const nameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(
        emailRef.current.value,
        passwordRef.current.value,
        nameRef.current.value
      );
      setSuccess(true);
      setError(null);
    } catch (err) {
      setError("Error signing up. Please try again.");
    }
  };

  return (
    <div className="registerContainer">
      <div className="logo">
        <RoomIcon className="logoIcon" />
        <span>PlacerPin</span>
      </div>
      <form onSubmit={handleSubmit}>
        <input autoFocus placeholder="Name" ref={nameRef} />
        <input type="email" placeholder="Email" ref={emailRef} />
        <input type="password" placeholder="Password" ref={passwordRef} />
        <button className="registerBtn" type="submit">
          Register
        </button>
        {success && (
          <span className="success">Successful. You can now log in!</span>
        )}
        {error && <span className="failure">{error}</span>}
      </form>
      <CloseIcon
        className="registerCancel"
        onClick={() => setShowRegister(false)}
      />
      {/* Optionally add a link to switch to login */}
      <span
        onClick={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
        className="switchModal"
      >
        Already have an account? Login
      </span>
    </div>
  );
}
