"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    // ดึง role จาก localStorage
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  return (
    <nav className="bg-gray-100 p-4 shadow-md flex justify-center gap-6">
      <NavLink href="/register" label="ลงทะเบียนรับเงิน" />
      <NavLink href="/checkstatus" label="ตรวจสอบการรับเงิน" />

      {/* ✅ แสดงเฉพาะ Admin */}
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
      className="relative text-gray-700 hover:text-blue-500 transition duration-200 after:content-[''] after:block after:h-[2px] after:w-0 after:bg-blue-500 after:transition-all after:duration-300 hover:after:w-full"
    >
      {label}
    </Link>
  );
}
