"use client";
import { useRouter } from "next/navigation"; // ✅ ใช้สำหรับ Redirect
import Navbar from "../components/Nav";
import Budget from "../budget/page";
import Edit from "../edit/page";
import ProtectedRoute from "../components/ProtectedRoute";

export default function Dashboard() {
  const router = useRouter(); // ✅ ใช้ router สำหรับ logout

  const handleLogout = () => {
    localStorage.removeItem("token"); // ✅ ลบ Token ออกจาก localStorage
    router.push("/login"); // ✅ Redirect ไปหน้า Login
  };

  return (
    <ProtectedRoute>
      <Navbar />

      <button onClick={handleLogout} style={styles.logoutButton}>
        Logout
      </button>

      <Budget />
      <Edit />
    </ProtectedRoute>
  );
}

// ✅ เพิ่มสไตล์ปุ่ม Logout
const styles = {
  logoutButton: {
    backgroundColor: "#800080", // สีม่วงสวยๆ ตามที่ชอบ
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    margin: "10px",
  },
};
