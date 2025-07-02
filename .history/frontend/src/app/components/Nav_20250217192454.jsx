"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-100 p-4 shadow-md flex justify-center gap-4">
      <LinkButton href="/register" label="ลงทะเบียนรับเงิน" />
      <LinkButton href="/checkstatus" label="ตรวจสอบการรับเงิน" />
      <LinkButton href="/dashboard" label="Admin" />
    </nav>
  );
}
const handleLogout = () => {
    localStorage.removeItem("token"); // ลบ Token
    router.push("/login"); // Redirect ไปหน้า Login
  };
function LinkButton({ href, label }) {
  return (
    <Link
      href={href}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
    >
      {label}
    </Link>
  );
}
