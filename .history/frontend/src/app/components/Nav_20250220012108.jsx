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
    <nav className="bg-gray-100 p-4 shadow-md flex justify-center gap-6">
      <NavLink href="/register" label="ลงทะเบียนรับเงิน" />
      <NavLink href="/checkstatus" label="ตรวจสอบการรับเงิน" />

      {role === "admin" && (
        <>
          <NavLink href="/dashboard" label="Admin" />
          <NavLink href="/confirm" label="ยืนยันสถานะ" />
        </>
      )}
    </nav>
  );
}

function NavLink({ href, label }) {
  return (
    <Link
      href={href}
      className="relative text-blue-600 hover:text-blue-800 transition duration-200 
      after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 
      after:h-[2px] after:bg-blue-600 after:transition-all after:duration-300 hover:after:w-full"
    >
      {label}
    </Link>
  );
}
