"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Nav";
import ProtectedRoute from "../components/ProtectedRoute";

export default function TransactionManagement() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleStatusChange = async (transactionId, citizenId, newStatus, targetGroupId) => {
    if (!transactionId || !citizenId || !newStatus || !targetGroupId) {
      console.error("❌ มีค่าที่เป็น undefined หรือ null", { transactionId, citizenId, newStatus, targetGroupId });
      alert("ข้อมูลไม่ครบ กรุณาลองใหม่");
      return;
    }

    console.log("📤 กำลังส่งข้อมูล:", { transactionId, citizenId, newStatus, targetGroupId });

    try {
      const response = await fetch("http://localhost:5000/transaction/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transaction_id: transactionId, citizen_id: citizenId, status: newStatus, target_group_id: targetGroupId }),
      });

      const responseData = await response.json();
      console.log("📥 ได้รับข้อมูลจากเซิร์ฟเวอร์:", responseData);

      if (response.ok) {
        alert("✅ อัปเดตสถานะเรียบร้อย");
        setTransactions((prev) =>
          prev.map((item) =>
            item.transaction_id === transactionId ? { ...item, status: newStatus } : item
          )
        );
      } else {
        alert(`❌ อัปเดตล้มเหลว: ${responseData.error || "เกิดข้อผิดพลาด"}`);
      }
    } catch (err) {
      console.error("❌ Error updating status:", err);
    }
  };

  // ✅ อนุมัติธุรกรรมทั้งหมดที่อยู่ในสถานะ "รออนุมัติ"
  const approveAll = async () => {
    const pendingTransactions = transactions.filter((t) => t.status === "รออนุมัติ");
    if (pendingTransactions.length === 0) {
      alert("ไม่มีรายการที่ต้องอนุมัติ");
      return;
    }

    for (const transaction of pendingTransactions) {
      await handleStatusChange(transaction.transaction_id, transaction.citizen_id, "อนุมัติแล้ว", transaction.target_group_id);
    }

    alert("✅ อนุมัติทั้งหมดเรียบร้อย");
  };

  if (loading) return <p className="text-center p-4">⏳ กำลังโหลดข้อมูล...</p>;

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="p-6 bg-gray-100 min-h-screen">
        <h2 className="text-2xl font-bold mb-5">จัดการธุรกรรม</h2>

        {/* ✅ ปุ่ม "อนุมัติทั้งหมด" */}
        <button className="bg-green-500 text-white px-4 py-2 rounded mb-4 hover:bg-green-600" onClick={approveAll}>
          อนุมัติทั้งหมด
        </button>

        <table className="w-full border-collapse border border-gray-300 bg-white shadow-md">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Citizen ID</th>
              <th className="border p-2">ชื่อ-สกุล</th>
              <th className="border p-2">เลขบัตรประชาชน</th>
              <th className="border p-2">อายุ</th>
              <th className="border p-2">อาชีพ</th>
              <th className="border p-2">กลุ่มเป้าหมาย</th>
              <th className="border p-2">สถานะ</th>
              <th className="border p-2">อัปเดต</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((item, index) => (
                <tr key={item.transaction_id} className="border">
                  <td className="p-2">{item.citizen_id}</td>
                  <td className="p-2">{item.fname} {item.lname}</td>
                  <td className="p-2">{item.national_id}</td>
                  <td className="p-2">{item.age} ปี</td>
                  <td className="p-2">{item.occupation || "ไม่ระบุ"}</td>
                  <td className="p-2">{item.group_name}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded-md text-white ${item.status === "อนุมัติแล้ว" ? "bg-green-500" : item.status === "รออนุมัติ" ? "bg-yellow-500" : "bg-gray-400"}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-2">
                    {item.status === "รออนุมัติ" ? (
                      <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600" onClick={() => handleStatusChange(item.transaction_id, item.citizen_id, "อนุมัติแล้ว", item.target_group_id)}>
                        อนุมัติ
                      </button>
                    ) : (
                      <button className="bg-gray-500 text-white px-3 py-1 rounded cursor-not-allowed" disabled>
                        อนุมัติแล้ว
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center p-4">ไม่มีข้อมูล</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ProtectedRoute>
  );
}
