"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Budget from "../budget/page";

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login"); // ❌ ไม่มี Token -> ไปหน้า Login
      return;
    }

    // ✅ ตรวจสอบว่า Token เป็นของ Admin จริงหรือไม่
    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT
      if (payload.role === "admin") {
        setIsAuthenticated(true); // ✅ อนุญาตให้เข้าถึง Dashboard
      } else {
        router.push("/unauthorized"); // ❌ ไม่ใช่ Admin -> Redirect
      }
    } catch (error) {
      router.push("/login"); // ❌ Token ผิดพลาด -> Redirect
    }
  }, []);

  if (!isAuthenticated) return null; // ❌ ถ้ายังไม่ได้เช็ค Token ให้รอ

  // 🔹 ฟังก์ชัน Logout
  const handleLogout = () => {
    localStorage.removeItem("token"); // ลบ Token
    router.push("/login"); // Redirect ไปหน้า Login
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* 🔹 ปุ่มแอ็กชัน */}
      <div className="mt-4 flex gap-4">
        
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={() => window.location.reload()}
        >
          🔄 Refresh Data
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>
      </div>

      {/* 🔹 แสดงข้อมูล Budget */}
      <Budget />
    </div>
  );
}
