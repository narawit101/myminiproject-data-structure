import React from "react";

export default function page() {
  return (
    <>
      <h1>ยินดีต้อนรับ</h1>
      <div>
      <a
        href="/register"
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        ลงทะเบียนรับเงิน
      </a>
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        ตรวบสอบการรับเงิน
      </a>
      <a
        href="/dashboard"
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Admin
      </a>
      </div>
    </>
  );
}
