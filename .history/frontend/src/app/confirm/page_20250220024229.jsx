"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Nav";
import ProtectedRoute from "../components/ProtectedRoute";

export default function TransactionManagement() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null); // ใช้ติดตามว่ากำลังอัปเดตรายการไหนอยู่

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

  const handleStatusChange = async (
    transactionId,
    citizenId,
    newStatus,
    targetGroupId
  ) => {
    if (!transactionId || !citizenId || !newStatus || !targetGroupId) {
      alert("❌ ข้อมูลไม่ครบ กรุณาลองใหม่!");
      return;
    }

    setUpdatingId(transactionId); // ตั้งค่ากำลังอัปเดต
    console.log("📤 กำลังส่งข้อมูล:", {
      transaction_id: transactionId,
      citizen_id: citizenId,
      status: newStatus,
      target_group_id: targetGroupId,
    });

    try {
      const response = await fetch("http://localhost:5000/transaction/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction_id: transactionId,
          citizen_id: citizenId,
          status: newStatus,
          target_group_id: targetGroupId,
        }),
      });

      const responseData = await response.json();
      console.log("📥 ได้รับข้อมูลจากเซิร์ฟเวอร์:", responseData);

      if (response.ok) {
        alert("✅ อัปเดตสถานะเรียบร้อย!");
        setTransactions((prev) =>
          prev.map((item) =>
            item.transaction_id === transactionId
              ? { ...item, status: newStatus }
              : item
          )
        );
      } else {
        alert(`❌ อัปเดตล้มเหลว: ${responseData.message || "เกิดข้อผิดพลาด"}`);
      }
    } catch (err) {
      console.error("❌ Error updating status:", err);
      alert("❌ เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    } finally {
      setUpdatingId(null); // รีเซ็ตสถานะอัปเดต
    }
  };

  if (loading) return <p className="text-center p-4">⏳ กำลังโหลดข้อมูล...</p>;

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="p-6 bg-gray-100 min-h-screen">
        <h2 className="text-2xl font-bold mb-5">🛠️ จัดการธุรกรรม</h2>

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
              transactions.map((item) => (
                <tr key={item.transaction_id} className="border">
                  <td className="p-2">{item.citizen_id}</td>
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
                        item.status === "completed"
                          ? "bg-green-500"
                          : item.status === "pending"
                          ? "bg-yellow-500"
                          : "bg-gray-500"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-2">
                    <select
                      className="border rounded px-2 py-1"
                      value={item.status}
                      onChange={(e) =>
                        handleStatusChange(
                          item.transaction_id,
                          item.citizen_id,
                          e.target.value,
                          item.target_group_id
                        )
                      }
                      disabled={updatingId === item.transaction_id}
                    >
                      <option value="pending">รอดำเนินการ</option>
                      <option value="completed">เสร็จสิ้น</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center p-4">
                  ❌ ไม่มีข้อมูลธุรกรรม
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ProtectedRoute>
  );
}
