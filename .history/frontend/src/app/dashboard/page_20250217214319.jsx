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
    <ProtectedRoute>
      <Navbar />
      <Budget />
      <Edit />
      <div className="container mx-auto px-4 py-6 flex flex-col">
       
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white p-2 rounded-md"
        >
          Logout
        </button>
      </div>
    </div>
    </ProtectedRoute>

  );
}
