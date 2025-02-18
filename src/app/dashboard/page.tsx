'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const router = useRouter();

   useEffect(() => {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        router.push("/");
      }
    }, [] );

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/');
  };
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Welcome to Dashboard</h1>
      <p className="text-lg">You are successfully authenticated!</p>
      <button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4">
        Logout
      </button>
    </div>
  );
}