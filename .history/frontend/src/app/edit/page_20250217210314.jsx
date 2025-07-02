"use client"; // ✅ ใช้ client component ใน Next.js 13+
import { useEffect, useState } from "react";

export default function CitizensPage() {
  const [citizens, setCitizens] = useState([]);
  const [editCitizen, setEditCitizen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    national_id: "",
    fname: "",
    lname: "",
    birth_date: "",
    income: "",
    occupation: "",
  });

  // ✅ ดึงข้อมูลจาก API (ใช้ fetch แทน axios)
  useEffect(() => {
    fetchCitizens();
  }, []);

  const fetchCitizens = async () => {
    try {
      const res = await fetch("http://localhost:5000/citizens/get");
      const data = await res.json();
      setCitizens(data);
    } catch (error) {
      console.error("Error fetching citizens:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ เปิด Modal แก้ไข
  const openEditModal = (citizen) => {
    setEditCitizen(citizen);
    setForm({
      national_id: citizen.national_id,
      fname: citizen.fname,
      lname: citizen.lname,
      birth_date: citizen.birth_date.split("T")[0],
      income: citizen.income,
      occupation: citizen.occupation,
    });
  };

  // ✅ อัปเดตข้อมูล (ใช้ fetch PUT)
  const handleUpdate = async () => {
    try {
      const res = await fetch(`http://localhost:5000/citizens/update/${form.national_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Update failed");

      fetchCitizens(); // โหลดข้อมูลใหม่
      setEditCitizen(null);
    } catch (error) {
      console.error("Error updating citizen:", error);
    }
  };

  // ✅ ลบข้อมูล (ใช้ fetch DELETE)
  const handleDelete = async (national_id) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้?")) return;

    try {
      const res = await fetch(`http://localhost:5000/citizens/delete/${national_id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      fetchCitizens(); // โหลดข้อมูลใหม่
    } catch (error) {
      console.error("Error deleting citizen:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">ข้อมูลประชาชน</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">เลขบัตรประชาชน</th>
              <th className="border p-2">ชื่อ</th>
              <th className="border p-2">นามสกุล</th>
              <th className="border p-2">อาชีพ</th>
              <th className="border p-2">รายได้</th>
              <th className="border p-2">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {citizens.map((citizen) => (
              <tr key={citizen.national_id} className="border">
                <td className="border p-2">{citizen.national_id}</td>
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
                    onClick={() => handleDelete(citizen.national_id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ✅ Modal แก้ไขข้อมูล */}
      {editCitizen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-bold mb-4">แก้ไขข้อมูล</h2>

            <label className="block">ชื่อ</label>
            <input
              type="text"
              value={form.fname}
              onChange={(e) => setForm({ ...form, fname: e.target.value })}
              className="border p-2 w-full mb-2"
            />

            <label className="block">นามสกุล</label>
            <input
              type="text"
              value={form.lname}
              onChange={(e) => setForm({ ...form, lname: e.target.value })}
              className="border p-2 w-full mb-2"
            />

            <label className="block">วันเกิด</label>
            <input
              type="date"
              value={form.birth_date}
              onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
              className="border p-2 w-full mb-2"
            />

            <label className="block">อาชีพ</label>
            <input
              type="text"
              value={form.occupation}
              onChange={(e) => setForm({ ...form, occupation: e.target.value })}
              className="border p-2 w-full mb-2"
            />

            <label className="block">รายได้</label>
            <input
              type="number"
              value={form.income}
              onChange={(e) => setForm({ ...form, income: e.target.value })}
              className="border p-2 w-full mb-2"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditCitizen(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleUpdate}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
