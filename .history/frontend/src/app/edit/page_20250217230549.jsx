'use client'
import { useState, useEffect } from "react";
import ProtectedRoute from "../components/ProtectedRoute"; // Import ProtectedRoute

export default function CitizensPage() {
  const [citizens, setCitizens] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  // ✅ โหลดข้อมูลจาก Backend
  const fetchCitizens = async () => {
    try {
      const res = await fetch("http://localhost:5000/citizens/check-target");
      if (!res.ok) {
        const error = await res.text();  // ดึงข้อความผิดพลาดจาก API
        throw new Error(`Failed to fetch: ${error}`);
      }
      const data = await res.json();
      setCitizens(data);
    } catch (error) {
      console.error("Error fetching citizens:", error.message);
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
    <>
      <ProtectedRoute> {/* Wrap everything that should be protected */}
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
                <th className="border p-2">กลุ่มเป้าหมาย</th> {/* เพิ่มกลุ่มเป้าหมาย */}
                <th className="border p-2">วันแจกเงิน</th> {/* เพิ่มวันแจกเงิน */}
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
                  <td className="border p-2">{citizen.target_group}</td> {/* แสดงกลุ่มเป้าหมาย */}
                  
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

                  {/* ไม่ให้ผู้ใช้แก้ไข กลุ่มเป้าหมาย และ วันแจกเงิน */}
                  <label className="block mb-2">
                    กลุ่มเป้าหมาย:
                    <input
                      type="text"
                      value={editData.target_group} // แสดงข้อมูลกลุ่มเป้าหมายที่ไม่สามารถแก้ไขได้
                      disabled
                      className="w-full border p-2 bg-gray-200"
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
      </ProtectedRoute>
    </>
  );
}
