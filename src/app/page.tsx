"use client";
import { useEffect, useState } from "react";
import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Home() {
  const [activeTab, setActiveTab] = useState("register");
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("");
  const router = useRouter();
  const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      router.push("/dashboard");
    }
  }, [] );

  const handleRegister = async () => {
    try {
      const optionsRes = await axios.post(`${backend_url}/register_start`, {
        username,
      });
      const options = await optionsRes.data;

      const regResponse = await startRegistration({
        optionsJSON: options.challenge.publicKey,
      });

      const verificationRes = await fetch(`${backend_url}/register_finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, credential: regResponse }),
      });

      const verification = await verificationRes.json();

      console.log(verification);

      if (verification.token) {
        setStatus("Registration successful!");
        localStorage.setItem("authToken", verification.token);
      }
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      setStatus("Registration failed!");
    }
  };

  const handleLogin = async () => {
    try {
      const optionsRes = await axios.post(`${backend_url}/login_start`, {
        username,
      });
      const options = await optionsRes.data;

      console.log(options);

      const authResponse = await startAuthentication({
        optionsJSON: options.publicKey,
      });

      const verificationRes = await fetch(`${backend_url}/login_finsih`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, credential: authResponse }),
      });

      const verification = await verificationRes.json();
      console.log(verification);

      if (verification.token) {
        setStatus("Login successful!");
        localStorage.setItem("authToken", verification.token);
      }
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      setStatus("Login failed!");
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-6">
          Passkey Demo App
        </h1>

        <div className="flex mb-6">
          <button
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-2 px-4 text-center ${
              activeTab === "register"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
          >
            Register
          </button>
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-2 px-4 text-center ${
              activeTab === "login"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
          >
            Login
          </button>
        </div>

        {/* Form Content */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={activeTab === "register" ? handleRegister : handleLogin}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            {activeTab === "register"
              ? "Register with Passkey"
              : "Login with Passkey"}
          </button>

          {status && (
            <p
              className={`text-center text-sm mt-2 ${
                status.includes("successful")
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {status}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
