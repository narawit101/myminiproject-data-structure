import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login"); // No token -> redirect to login
      return;
    }

    // ✅ Check if the token is for an admin
    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT
      if (payload.role === "admin") {
        setIsAuthenticated(true); // Allow access to children (Dashboard)
      } else {
        router.push("/unauthorized"); // Not an admin -> redirect to unauthorized
      }
    } catch (error) {
      router.push("/login"); // Invalid token -> redirect to login
    }
  }, []);

  if (!isAuthenticated) return null; // Wait until token is checked

  return <>{children}</>; // Render protected content
}
