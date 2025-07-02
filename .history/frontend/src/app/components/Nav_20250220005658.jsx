"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-100 p-4 shadow-md flex justify-center gap-6">
      <NavLink href="/register" label="ลงทะเบียนรับเงิน" />
      <NavLink href="/checkstatus" label="ตรวจสอบการรับเงิน" />
      <NavLink href="/dashboard" label="Admin" />
      <NavLink href="/confirm" label="ยืนยันสถานะ" />
    </nav>
  );
}

function NavLink({ href, label }) {
  return (
    <Link
      href={href}
      className="text-blue-600 hover:underline hover:text-blue-800 transition duration-200"
    >
      {label}
    </Link>
  );
}
