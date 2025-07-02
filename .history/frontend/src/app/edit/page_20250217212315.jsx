'use client'
import { useState, useEffect } from "react";

export default function CitizensPage() {
  const [citizens, setCitizens] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login"); // No token -> go to login page
      return;
    }

    // ✅ Check if the token is for an admin
    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT
      if (payload.role === "admin") {
        setIsAuthenticated(true); // Allow access to Dashboard
      } else {
        router.push("/unauthorized"); // Not an admin -> Redirect
      }
    } catch (error) {
      router.push("/login"); // Invalid token -> Redirect
    }
  }, []);

  if (!isAuthenticated) return null; // Wait until token is checked

  // 🔹 Logout function
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token
    router.push("/login"); // Redirect to login page
  };
  
  // ✅ โหลดข้อมูลจาก Backend
  const fetchCitizens = async () => {
    try {
      const res = await fetch("http://localhost:5000/citizens/get");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCitizens(data);
    } catch (error) {
      console.error("Error fetching citizens:", error);
    }
  };

  useEffect(() => {
    fetchCitizens();
  }, []);

  // ✅ ฟังก์ชันลบ citizen
  const handleDelete = async (id) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้?")) return;

    try {
      const res = await fetch(`http://localhost:5000/citizens/delete/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      fetchCitizens(); // โหลดข้อมูลใหม่หลังจากลบ
    } catch (error) {
      console.error("Error deleting citizen:", error);
    }
  };

  // ✅ เปิด Modal แก้ไข
  const openEditModal = (citizen) => {
    setEditData({
      ...citizen,
      birth_date: citizen.birth_date.split("T")[0], // แปลงวันเกิดให้อยู่ในรูปแบบ YYYY-MM-DD
    });
    setIsEditing(true);
  };

  // ✅ ฟังก์ชันอัปเดตข้อมูล
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`http://localhost:5000/citizens/update/${editData.citizen_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (!res.ok) throw new Error("Update failed");

      setIsEditing(false);
      fetchCitizens(); // โหลดข้อมูลใหม่
    } catch (error) {
      console.error("Error updating citizen:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">รายชื่อประชาชน</h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">ID</th>
            <th className="border p-2">ชื่อ</th>
            <th className="border p-2">นามสกุล</th>
            <th className="border p-2">อาชีพ</th>
            <th className="border p-2">รายได้</th>
            <th className="border p-2">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {citizens.map((citizen) => (
            <tr key={citizen.citizen_id} className="border">
              <td className="border p-2">{citizen.citizen_id}</td>
              <td className="border p-2">{citizen.fname}</td>
              <td className="border p-2">{citizen.lname}</td>
              <td className="border p-2">{citizen.occupation}</td>
              <td className="border p-2">{citizen.income}</td>
              <td className="border p-2 flex gap-2">
                <button
                  onClick={() => openEditModal(citizen)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  แก้ไข
                </button>
                <button
                  onClick={() => handleDelete(citizen.citizen_id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  ลบ
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ Modal ฟอร์มแก้ไข */}
      {isEditing && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">แก้ไขข้อมูล</h2>
            <form onSubmit={handleUpdate}>
              <label className="block mb-2">
                ชื่อ:
                <input
                  type="text"
                  value={editData.fname}
                  onChange={(e) => setEditData({ ...editData, fname: e.target.value })}
                  className="w-full border p-2"
                />
              </label>
              <label className="block mb-2">
                นามสกุล:
                <input
                  type="text"
                  value={editData.lname}
                  onChange={(e) => setEditData({ ...editData, lname: e.target.value })}
                  className="w-full border p-2"
                />
              </label>
              <label className="block mb-2">
                อาชีพ:
                <input
                  type="text"
                  value={editData.occupation}
                  onChange={(e) => setEditData({ ...editData, occupation: e.target.value })}
                  className="w-full border p-2"
                />
              </label>
              <label className="block mb-2">
                รายได้:
                <input
                  type="number"
                  value={editData.income}
                  onChange={(e) => setEditData({ ...editData, income: e.target.value })}
                  className="w-full border p-2"
                />
              </label>
              <label className="block mb-2">
                วันเกิด:
                <input
                  type="date"
                  value={editData.birth_date}
                  onChange={(e) => setEditData({ ...editData, birth_date: e.target.value })}
                  className="w-full border p-2"
                />
              </label>
              <div className="flex justify-end gap-2 mt-4">
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
                  บันทึก
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
