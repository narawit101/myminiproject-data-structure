'use'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // ใช้ `null` แทน `false`
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsAuthenticated(false); // 🔹 ตั้งค่าเป็น false เพื่อบล็อกเนื้อหา
      router.push("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT
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

  if (isAuthenticated === null) return <p>Loading...</p>; // 🔹 รอให้เช็ค token เสร็จก่อน

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
