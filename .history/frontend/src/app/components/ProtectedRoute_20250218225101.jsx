"use client"; // ✅ จำเป็นสำหรับการใช้ useRouter()

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(null); // ✅ ใช้ null เพื่อลด error

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

  const handleLogout = () => {
    localStorage.removeItem("token"); // ✅ ลบ Token
    router.push("/login"); // ✅ Redirect ไปหน้า Login
  };

  if (isAuthenticated === null) return <p>Loading...</p>; // ✅ รอให้เช็ค token เสร็จก่อน

  if (!isAuthenticated) return null;

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>

      {children}
    </div>
  );
}
