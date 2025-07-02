"use client";
import Navbar from "../components/Nav";
import Budget from "../budget/page";
import Edit from "../edit/page";
import ProtectedRoute from "../components/ProtectedRoute"; // Import ProtectedRoute

export default function Dashboard() {
  // 🔹 Logout function
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token
    router.push("/login"); // Redirect to login page
  };

  return (
    <>
      <ProtectedRoute>
        <Navbar />

        <Budget />

        <Edit />
      </ProtectedRoute>
    </>
  );
}
