import { useState, useEffect } from "react";

export default function CitizensPage() {
  const [citizens, setCitizens] = useState([]);

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
    </div>
  );
}
