"use client";
import { useState, useEffect } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import Navbar from "../components/Nav";
import GenUser from "../components/GenUser";

export default function CitizensPage() {
  const [citizens, setCitizens] = useState([]);
  const [filteredCitizens, setFilteredCitizens] = useState([]);
  const [filter, setFilter] = useState("ทั้งหมด");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchCitizens();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [citizens, filter]);

  const fetchCitizens = async () => {
    try {
      const res = await fetch("http://localhost:5000/citizens/check-target");
      if (!res.ok) throw new Error("Failed to fetch citizens");
      const data = await res.json();
      const uniqueCitizens = [...new Map(data.map((item) => [item.citizen_id, item])).values()];
      setCitizens(uniqueCitizens);
    } catch (error) {
      console.error("Error fetching citizens:", error);
    }
  };

  const applyFilter = () => {
    if (filter === "ทั้งหมด") {
      setFilteredCitizens(citizens);
    } else {
      setFilteredCitizens(citizens.filter((citizen) => citizen.target_group === filter));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้?")) return;
    try {
      const res = await fetch(`http://localhost:5000/citizens/delete/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setCitizens((prev) => prev.filter((citizen) => citizen.citizen_id !== id));
    } catch (error) {
      console.error("Error deleting citizen:", error);
    }
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <GenUser />
      <div className="container mx-auto p-6">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center mt-16">แก้ไขข้อมูล</h2>
        
        {/* ปุ่มกรอง */}
        <div className="flex gap-4 mb-4 justify-center">
          {["ทั้งหมด", "ผู้มีรายได้น้อย", "เกษตรกร", "ผู้สูงอายุ"].map((group) => (
            <button
              key={group}
              onClick={() => setFilter(group)}
              className={`px-4 py-2 rounded-md transition ${filter === group ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
            >
              {group}
            </button>
          ))}
        </div>

        <table className="w-full border-collapse bg-white shadow-lg">
          <thead>
            <tr className="bg-blue-100 text-gray-600">
              <th className="border p-3 text-left">ลำดับ</th>
              <th className="border p-3 text-left">เลขบัตรประชาชน</th>
              <th className="border p-3 text-left">ชื่อ</th>
              <th className="border p-3 text-left">นามสกุล</th>
              <th className="border p-3 text-left">อาชีพ</th>
              <th className="border p-3 text-left">รายได้</th>
              <th className="border p-3 text-left">กลุ่มเป้าหมาย</th>
              <th className="border p-3 text-left">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredCitizens.map((citizen, index) => (
              <tr key={citizen.citizen_id} className="border-b hover:bg-gray-50">
                <td className="border p-3">{index + 1}</td>
                <td className="border p-3">{citizen.national_id}</td>
                <td className="border p-3">{citizen.fname}</td>
                <td className="border p-3">{citizen.lname}</td>
                <td className="border p-3">{citizen.occupation || "ไม่มีข้อมูล"}</td>
                <td className="border p-3">{Math.floor(citizen.income).toLocaleString()} บาท</td>
                <td className="border p-3">{citizen.target_group || "ไม่มีข้อมูล"}</td>
                <td className="border p-3 flex gap-2">
                  <button onClick={() => handleDelete(citizen.citizen_id)} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition">ลบ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ProtectedRoute>
  );
}
