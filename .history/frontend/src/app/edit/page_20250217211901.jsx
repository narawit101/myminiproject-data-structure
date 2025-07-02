"use client";
import { useState, useEffect } from "react";

export default function CitizensPage() {
  const [citizens, setCitizens] = useState([]);
  const [editingCitizen, setEditingCitizen] = useState(null);

  // ✅ ดึงข้อมูลประชาชนจาก Backend
  useEffect(() => {
    fetchCitizens();
  }, []);

  const fetchCitizens = async () => {
    const res = await fetch("http://localhost:5000/citizens/get");
    const data = await res.json();
    setCitizens(data);
  };

  // ✅ ฟังก์ชันลบข้อมูล
  const handleDelete = async (id) => {
    if (!confirm("คุณต้องการลบข้อมูลนี้ใช่หรือไม่?")) return;

    const res = await fetch(`http://localhost:5000/citizens/delete/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      alert("ลบข้อมูลสำเร็จ");
      fetchCitizens();
    }
  };

  // ✅ ฟังก์ชันแก้ไขข้อมูล
  const handleEdit = (citizen) => {
    setEditingCitizen(citizen);
  };

  const handleSave = async () => {
    if (!editingCitizen) return;

    const res = await fetch(
      `http://localhost:5000/citizens/update/${editingCitizen.citizen_id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCitizen),
      }
    );

    if (res.ok) {
      alert("อัปเดตข้อมูลสำเร็จ");
      setEditingCitizen(null);
      fetchCitizens();
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📋 รายชื่อประชาชน</h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">ชื่อ</th>
            <th className="border p-2">วันเกิด</th>
            <th className="border p-2">รายได้</th>
            <th className="border p-2">การกระทำ</th>
          </tr>
        </thead>
        <tbody>
          {citizens.map((citizen) => (
            <tr key={citizen.citizen_id} className="text-center">
              <td className="border p-2">{citizen.fname} {citizen.lname}</td>
              <td className="border p-2">
                {editingCitizen?.citizen_id === citizen.citizen_id ? (
                  <input
                    type="date"
                    value={editingCitizen.birth_date.split("T")[0]}
                    onChange={(e) =>
                      setEditingCitizen({ ...editingCitizen, birth_date: e.target.value })
                    }
                    className="border p-1"
                  />
                ) : (
                  new Date(citizen.birth_date).toLocaleDateString()
                )}
              </td>
              <td className="border p-2">
                {editingCitizen?.citizen_id === citizen.citizen_id ? (
                  <input
                    type="number"
                    value={editingCitizen.income}
                    onChange={(e) =>
                      setEditingCitizen({ ...editingCitizen, income: e.target.value })
                    }
                    className="border p-1 w-20"
                  />
                ) : (
                  `${citizen.income} บาท`
                )}
              </td>
              <td className="border p-2 space-x-2">
                {editingCitizen?.citizen_id === citizen.citizen_id ? (
                  <button
                    onClick={handleSave}
                    className="bg-green-500 text-white px-2 py-1 rounded"
                  >
                    ✅ บันทึก
                  </button>
                ) : (
                  <button
                    onClick={() => handleEdit(citizen)}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    ✏️ แก้ไข
                  </button>
                )}
                <button
                  onClick={() => handleDelete(citizen.citizen_id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  🗑️ ลบ
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
