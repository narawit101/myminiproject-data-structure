"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1])); // ✅ Decode JWT
        setRole(payload.role); // ตั้งค่า role
      } catch (error) {
        console.error("❌ Error decoding token:", error);
      }
    }
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-100 shadow-md p-4 flex justify-center gap-6 z-50">
      <NavLink href="/register" label="ลงทะเบียนรับเงิน" />
      <NavLink href="/checkstatus" label="ตรวจสอบการรับเงิน" />
      <NavLink href="/dashboard" label="Admin" />
      <NavLink href="/edit" label="แก้ไขข้อมูล" />
      <NavLink href="/confirm" label="ยืนยันการโอนเงิน" />
    </nav>
  );
}

function NavLink({ href, label }) {
  return (
    <Link
      href={href}
      className="relative text-blue-600 px-4 py-2 font-semibold transition-all duration-300
      after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 
      after:h-[2px] after:bg-blue-600 after:transition-all after:duration-300 hover:after:w-full"
    >
      {label}
    </Link>
  );
}
