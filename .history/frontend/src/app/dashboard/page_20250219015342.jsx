"use client";
import { useRouter } from "next/navigation"; // ✅ ใช้สำหรับ Redirect
import Navbar from "../components/Nav";
import Budget from "../budget/page";
import Allocation from "../allocation/page";
import Edit from "../edit/page";
import ProtectedRoute from "../components/ProtectedRoute";

export default function Dashboard() {
  const router = useRouter(); // ✅ ใช้ router สำหรับ logout

  const handleLogout = () => {
    localStorage.removeItem("token"); // ✅ ลบ Token ออกจาก localStorage
    router.push("/login"); // ✅ Redirect ไปหน้า Login
  };

  return (
    <ProtectedRoute>
      <Navbar />

      <div className="flex items-center justify-center">
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-6 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <Budget />
      <Allocation />
      <Edit />
    </ProtectedRoute>
  );
}
