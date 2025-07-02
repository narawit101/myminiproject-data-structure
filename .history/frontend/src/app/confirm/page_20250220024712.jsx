"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Nav";
import ProtectedRoute from "../components/ProtectedRoute";

export default function TransactionManagement() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/transaction/get")
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ ข้อมูลธุรกรรม:", data);
        setTransactions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error:", err);
        setLoading(false);
      });
  }, []);

  const toggleSelectTransaction = (transactionId) => {
    setSelectedTransactions((prev) =>
      prev.includes(transactionId)
        ? prev.filter((id) => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const updateStatus = async (ids, newStatus) => {
    if (ids.length === 0) {
      alert("โปรดเลือกธุรกรรมก่อน!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/transaction/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transaction_ids: ids, status: newStatus }),
      });

      const responseData = await response.json();
      console.log("✅ อัปเดตสถานะสำเร็จ:", responseData);

      if (response.ok) {
        alert("อัปเดตสถานะเรียบร้อย");
        setTransactions((prev) =>
          prev.map((item) =>
            ids.includes(item.transaction_id)
              ? { ...item, status: newStatus }
              : item
          )
        );
        setSelectedTransactions([]);
      } else {
        alert("❌ อัปเดตล้มเหลว: " + (responseData.message || "ข้อผิดพลาดจากเซิร์ฟเวอร์"));
      }
    } catch (err) {
      console.error("❌ Error updating status:", err);
    }
  };

  if (loading) return <p className="text-center p-4">⏳ กำลังโหลดข้อมูล...</p>;

  return (
    <ProtectedRoute>
      <Navbar />

      <div className="p-6 bg-gray-100 min-h-screen">
        <h2 className="text-2xl font-bold mb-5">จัดการธุรกรรม</h2>

        <div className="mb-4">
          <label className="mr-2">กรองตามสถานะ:</label>
          <select
            className="border p-2"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">ทั้งหมด</option>
            <option value="pending">รอดำเนินการ</option>
            <option value="waiting">รออนุมัติ</option>
            <option value="approved">อนุมัติแล้ว</option>
          </select>
        </div>

        <button
          className="bg-green-500 text-white px-4 py-2 rounded mb-4"
          onClick={() => updateStatus(selectedTransactions, "approved")}
        >
          ✅ อนุมัติที่เลือก
        </button>
        <button
          className="bg-yellow-500 text-white px-4 py-2 rounded mb-4 ml-2"
          onClick={() => updateStatus(selectedTransactions, "waiting")}
        >
          ⏳ เปลี่ยนเป็นรออนุมัติ
        </button>

        <table className="w-full border-collapse border border-gray-300 bg-white shadow-md">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">เลือก</th>
              <th className="border p-2">ชื่อ-สกุล</th>
              <th className="border p-2">เลขบัตรประชาชน</th>
              <th className="border p-2">อายุ</th>
              <th className="border p-2">อาชีพ</th>
              <th className="border p-2">กลุ่มเป้าหมาย</th>
              <th className="border p-2">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {transactions
              .filter((item) => !filterStatus || item.status === filterStatus)
              .map((item) => (
                <tr key={item.transaction_id} className="border">
                  <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.includes(item.transaction_id)}
                      onChange={() => toggleSelectTransaction(item.transaction_id)}
                    />
                  </td>
                  <td className="p-2">
                    {item.fname} {item.lname}
                  </td>
                  <td className="p-2">{item.national_id}</td>
                  <td className="p-2">{item.age} ปี</td>
                  <td className="p-2">{item.occupation || "ไม่ระบุ"}</td>
                  <td className="p-2">{item.group_name}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded-md text-white ${
                        item.status === "approved"
                          ? "bg-green-500"
                          : item.status === "waiting"
                          ? "bg-yellow-500"
                          : "bg-gray-400"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </ProtectedRoute>
  );
}
