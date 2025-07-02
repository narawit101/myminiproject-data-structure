import React from "react";
import Register from "../components/Register";
import Nav from "../components/Nav";

export default function Page() {  // เปลี่ยนชื่อฟังก์ชันจาก "page" เป็น "Page" เพื่อให้ตรงตาม convention ของ Next.js
  return (
    <>
      <Nav />
    </>
  );
}
