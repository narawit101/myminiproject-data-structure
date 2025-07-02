"use client";
import { useState, useEffect } from "react";
import ProtectedRoute from "../components/ProtectedRoute"; // Import ProtectedRoute

export default function CitizensPage() {
  const [citizens, setCitizens] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  // ✅ โหลดข้อมูลจาก API
  const fetchCitizens = async () => {
    try {
      const res = await fetch("http://localhost:5000/citizens/check-target");
      if (!res.ok) throw new Error("Failed to fetch citizens");
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
      birth_date: citizen.birth_date ? citizen.birth_date.split("T")[0] : "",
    });
    setIsEditing(true);
  };

  // ✅ ฟังก์ชันอัปเดตข้อมูล
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `http://localhost:5000/citizens/update/${editData.citizen_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editData),
        }
      );

      if (!res.ok) throw new Error("Update failed");

      setIsEditing(false);
      fetchCitizens(); // โหลดข้อมูลใหม่
    } catch (error) {
      console.error("Error updating citizen:", error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">จัดการผู้ลงทะเบียน</h1>
        <table className="w-full table-auto border-collapse bg-white shadow-lg">
          <thead>
            <tr className="bg-blue-100 text-gray-600 ">
              <th className="border p-3 text-left">เลขบัตรประชาชน</th>
              <th className="border p-3 text-left">ชื่อ</th>
              <th className="border p-3 text-left">นามสกุล</th>
              <th className="border p-3 text-left">อาชีพ</th>
              <th className="border p-3 text-left">รายได้</th>
              <th className="border p-3 text-left">กลุ่มเป้าหมาย</th>
              <th className="border p-3 text-left">วันแจกเงิน</th>
              <th className="border p-3 text-left">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {citizens.map((citizen) => (
              <tr key={citizen.citizen_id} className="border-b hover:bg-gray-50">
                <td className="border p-3">{citizen.national_id}</td>
                <td className="border p-3">{citizen.fname}</td>
                <td className="border p-3">{citizen.lname}</td>
                <td className="border p-3">{citizen.occupation}</td>
                <td className="border p-3">{Math.floor(citizen.income).toLocaleString()} บาท</td>
                <td className="border p-3">{citizen.target_group || "ไม่มีข้อมูล"}</td>
                <td className="border p-3">
                  {citizen.distribution_date
                    ? new Date(citizen.distribution_date).toLocaleDateString("th-TH")
                    : "ไม่มีข้อมูล"}
                </td>
                <td className="border p-3 flex gap-2">
                  <button
                    onClick={() => openEditModal(citizen)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleDelete(citizen.citizen_id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
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
            <div className="bg-white p-8 rounded-lg shadow-xl w-96">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">แก้ไขข้อมูล</h2>
              <form onSubmit={handleUpdate}>
                <label className="block mb-4">
                  ชื่อ:
                  <input
                    type="text"
                    value={editData.fname || ""}
                    onChange={(e) => setEditData({ ...editData, fname: e.target.value })}
                    className="w-full border p-3 rounded-md mt-2"
                  />
                </label>
                <label className="block mb-4">
                  นามสกุล:
                  <input
                    type="text"
                    value={editData.lname || ""}
                    onChange={(e) => setEditData({ ...editData, lname: e.target.value })}
                    className="w-full border p-3 rounded-md mt-2"
                  />
                </label>
                <label className="block mb-4">
                  อาชีพ:
                  <input
                    type="text"
                    value={editData.occupation || ""}
                    onChange={(e) => setEditData({ ...editData, occupation: e.target.value })}
                    className="w-full border p-3 rounded-md mt-2"
                  />
                </label>
                <label className="block mb-4">
                  รายได้:
                  <input
                    type="number"
                    value={editData.income || ""}
                    onChange={(e) => setEditData({ ...editData, income: e.target.value })}
                    className="w-full border p-3 rounded-md mt-2"
                  />
                </label>
                <label className="block mb-4">
                  วันเกิด:
                  <input
                    type="date"
                    value={editData.birth_date || ""}
                    onChange={(e) => setEditData({ ...editData, birth_date: e.target.value })}
                    className="w-full border p-3 rounded-md mt-2"
                  />
                </label>
                <label className="block mb-4">
                  กลุ่มเป้าหมาย:
                  <input
                    type="text"
                    value={editData.target_group || ""}
                    disabled
                    className="w-full border p-3 rounded-md mt-2 bg-gray-200"
                  />
                </label>
                <label className="block mb-4">
                  วันแจกเงิน:
                  <input
                    type="text"
                    value={editData.distribution_date || ""}
                    disabled
                    className="w-full border p-3 rounded-md mt-2 bg-gray-200"
                  />
                </label>
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition duration-300"
                  >
                    บันทึก
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition duration-300"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
