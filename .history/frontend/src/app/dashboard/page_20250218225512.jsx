"use client";
import Navbar from "../components/Nav";
import Budget from "../budget/page";
import Edit from "../edit/page";
import ProtectedRoute from "../components/ProtectedRoute"; // Import ProtectedRoute

export default function Dashboard() {
  // 🔹 Logout function

  return (
    <>
      <ProtectedRoute>
      <button
          onClick={handleLogout}
          className="bg-red-500 text-white p-2 rounded-md"
        >
          Logout
        </button>
        <Navbar />

        <Budget />

        <Edit />
        
      </ProtectedRoute>
    </>
  );
}
