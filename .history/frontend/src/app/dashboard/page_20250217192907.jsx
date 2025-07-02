"use client";
import Navbar from "../components/Nav";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Budget from "../budget/page";

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login"); // No token -> go to login page
      return;
    }

    // ✅ Check if the token is for an admin
    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT
      if (payload.role === "admin") {
        setIsAuthenticated(true); // Allow access to Dashboard
      } else {
        router.push("/unauthorized"); // Not an admin -> Redirect
      }
    } catch (error) {
      router.push("/login"); // Invalid token -> Redirect
    }
  }, []);

  if (!isAuthenticated) return null; // Wait until token is checked

  // 🔹 Logout function
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token
    router.push("/login"); // Redirect to login page
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <Budget />
        <div className="flex justify-end p-4"> {/* Align the button to the top right */}
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white p-2 rounded-md">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
