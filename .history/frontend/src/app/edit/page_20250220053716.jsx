"use client";
import { useState, useEffect } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import Navbar from "../components/Nav";

export default function CitizensPage() {
  const [citizens, setCitizens] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [filterGroup, setFilterGroup] = useState("all");

  useEffect(() => {
    fetchCitizens();
  }, []);

  const fetchCitizens = async () => {
    try {
      const res = await fetch("http://localhost:5000/citizens/check-target");
      if (!res.ok) throw new Error("Failed to fetch citizens");
      const data = await res.json();
      setCitizens([...new Map(data.map((item) => [item.citizen_id, item])).values()]);
    } catch (error) {
      console.error("Error fetching citizens:", error);
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

  const openEditModal = (citizen) => {
    setEditData({ ...citizen, birth_date: citizen.birth_date?.split("T")[0] || "" });
    setIsEditing(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/citizens/update/${editData.citizen_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error("Update failed");
      setCitizens((prev) => prev.map((citizen) => (citizen.citizen_id === editData.citizen_id ? editData : citizen)));
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating citizen:", error);
    }
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const filteredCitizens = citizens.filter((citizen) => {
    if (filterGroup === "all") return true;
    return citizen.target_group === filterGroup;
  });

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="container mx-auto p-6">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center mt-16">แก้ไขข้อมูล</h2>

        <div className="flex gap-4 mb-4">
          {[
            { label: "ทั้งหมด", value: "all" },
            { label: "ผู้มีรายได้น้อย", value: "กลุ่มผู้มีรายได้น้อย" },
            { label: "เกษตรกร", value: "กลุ่มเกษตรกร" },
            { label: "ผู้สูงอายุ", value: "กลุ่มผู้สูงอายุ" },
          ].map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilterGroup(value)}
              className={`px-4 py-2 rounded-md text-white ${filterGroup === value ? "bg-blue-600" : "bg-gray-500 hover:bg-gray-600"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <table className="w-full border-collapse bg-white shadow-lg">
          <thead>
            <tr className="bg-blue-100 text-gray-600">
              {["เลขบัตรประชาชน", "ชื่อ", "นามสกุล", "อาชีพ", "รายได้", "กลุ่มเป้าหมาย", "วันแจกเงิน", "จัดการ"].map((head) => (
                <th key={head} className="border p-3 text-left">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredCitizens.map((citizen) => (
              <tr key={citizen.citizen_id} className="border-b hover:bg-gray-50">
                <td className="border p-3">{citizen.national_id}</td>
                <td className="border p-3">{citizen.fname}</td>
                <td className="border p-3">{citizen.lname}</td>
                <td className="border p-3">{citizen.occupation || "ไม่มีข้อมูล"}</td>
                <td className="border p-3">{Math.floor(citizen.income).toLocaleString()} บาท</td>
                <td className="border p-3">{citizen.target_group || "ไม่มีข้อมูล"}</td>
                <td className="border p-3">{citizen.distribution_date ? new Date(citizen.distribution_date).toLocaleDateString("th-TH") : "ไม่มีข้อมูล"}</td>
                <td className="border p-3 flex gap-2">
                  <button onClick={() => openEditModal(citizen)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">แก้ไข</button>
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
