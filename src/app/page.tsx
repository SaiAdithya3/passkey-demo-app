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
  const [isConditionalMediationAvailable, setIsConditionalMediationAvailable] =
    useState(false);
  const router = useRouter();
  const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      router.push("/dashboard");
    }
  }, []);

  useEffect(() => {
    const checkConditionalMediationSupport = async () => {
      const supported =
        await window.PublicKeyCredential.isConditionalMediationAvailable();
      setIsConditionalMediationAvailable(supported);

      if (activeTab === "login") {
        if (supported) {
          console.log("Conditional Authentication is available.");
          handleConditionalLogin();
        } else {
          setStatus(
            "Conditional Authentication is not available. Please login using username"
          );
        }
      }
    };
    // handleConditionalLogin();

    checkConditionalMediationSupport();
  }, [activeTab]);

  const handleRegister = async () => {
    try {
      if (!username) {
        setStatus("Please enter a username");
        return;
      }

      const optionsRes = await axios
        .post(`${backend_url}/register_start`, { username })
        .catch((error) => {
          setStatus(
            error.response?.data?.message || "Failed to start registration"
          );
          throw error;
        });

      const options = optionsRes.data;

      let regResponse;
      try {
        regResponse = await startRegistration({
          optionsJSON: options.challenge.publicKey,
        });
      } catch (error: any) {
        if (error.name === "NotAllowedError") {
          setStatus("Registration was cancelled");
        } else {
          setStatus("Failed to create passkey");
        }
        return;
      }

      const verificationRes = await axios
        .post(`${backend_url}/register_finish`, {
          username,
          credential: regResponse,
        })
        .catch((error) => {
          setStatus(
            error.response?.data?.message || "Failed to verify registration"
          );
          throw error;
        });

      const verification = verificationRes.data;

      if (verification.token) {
        setStatus("Registration successful!");
        localStorage.setItem("authToken", verification.token);
        router.push("/dashboard");
      } else {
        setStatus("Registration failed - no token received");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogin = async () => {
    try {
      if (!username) {
        setStatus("Please enter a username");
        return;
      }

      const optionsRes = await axios
        .post(`${backend_url}/login_start`, {
          username,
        })
        .catch((error) => {
          setStatus(error.response?.data?.details);
          throw error;
        });

      const options = optionsRes.data;

      let authResponse;
      try {
        authResponse = await startAuthentication({
          optionsJSON: options.publicKey,
        });
      } catch (error: any) {
        if (error.name === "NotAllowedError") {
          setStatus("Login was cancelled");
        } else {
          setStatus("Failed to authenticate with passkey");
        }
        return;
      }

      const verificationRes = await axios
        .post(`${backend_url}/login_finish`, {
          username,
          credential: authResponse,
        })
        .catch((error) => {
          setStatus(error.response?.data?.message || "Failed to verify login");
          throw error;
        });

      const verification = verificationRes.data;
      if (verification.token) {
        setStatus("Login successful!");
        localStorage.setItem("authToken", verification.token);
        router.push("/dashboard");
      } else {
        setStatus("Login failed - no token received");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleConditionalLogin = async () => {
    try {
      const optionRes = await axios
        .get(`${backend_url}/conditional_login_start`)
        .catch((error) => {
          setStatus(
            error.response?.data?.message || "Failed to start conditional login"
          );
          throw error;
        });

      const options = optionRes.data;
      const login_id = options.login_id;

      let authResponse;
      try {
        authResponse = await startAuthentication({
          optionsJSON: options.challenge.publicKey,
        });
      } catch (error: any) {
        if (error.name === "NotAllowedError") {
          setStatus("Conditional login was cancelled");
        } else {
          setStatus("Failed to authenticate with passkey");
        }
        return;
      }

      const verificationResponse = await axios
        .post(`${backend_url}/conditional_login_finish`, {
          credential: authResponse,
          login_id,
        })
        .catch((error) => {
          setStatus(
            error.response?.data?.message ||
              "Failed to verify conditional login"
          );
          throw error;
        });

      const verification = verificationResponse.data;
      if (verification.token) {
        setStatus("Conditional Login successful!");
        localStorage.setItem("authToken", verification.token);
        router.push("/dashboard");
      } else {
        setStatus("Conditional login failed - no token received");
      }
    } catch (error) {
      console.error(error);
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
