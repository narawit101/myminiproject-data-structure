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
    <>
    
      <Navbar />
      <Budget />
      
    </>
  );
}
