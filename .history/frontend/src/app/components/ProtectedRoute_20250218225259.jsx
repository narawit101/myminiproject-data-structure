"use client"; // ✅ จำเป็นใน Next.js App Router

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }) {
  const router = useRouter('');
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsAuthenticated(false);
      router.push("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // ✅ Decode JWT
      if (payload.role === "admin") {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.push("/unauthorized");
      }
    } catch (error) {
      setIsAuthenticated(false);
      router.push("/login");
    }
  }, []);

  if (isAuthenticated === null) return <p>Loading...</p>; // ✅ รอให้เช็ค token เสร็จก่อน

  if (!isAuthenticated) return null;

  return <>{children}</>; // ✅ แสดงเนื้อหาของหน้า Dashboard
}
