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

  const handleStatusChange = async (
    transactionId,
    citizenId,
    newStatus,
    targetGroupId
  ) => {
    console.log("📤 กำลังส่งข้อมูล:", {
      transaction_id: transactionId,
      citizen_id: citizenId,
      status: newStatus,
      target_group_id: targetGroupId,
    });

    if (!transactionId || !citizenId || !newStatus || !targetGroupId) {
      console.error("❌ ข้อมูลไม่ครบ", {
        transaction_id: transactionId,
        citizen_id: citizenId,
        status: newStatus,
        target_group_id: targetGroupId,
      });
      alert("ข้อมูลไม่ครบ กรุณาลองใหม่");
      return;
    }

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
      console.log("✅ ได้รับข้อมูลจากเซิร์ฟเวอร์:", responseData);

      if (response.ok) {
        alert("✅ อัปเดตสถานะเรียบร้อย");
        setTransactions((prev) =>
          prev.map((item) =>
            item.citizen_id === citizenId
              ? { ...item, status: newStatus }
              : item
          )
        );
      } else {
        alert(`❌ อัปเดตล้มเหลว: ${responseData.message || "ข้อผิดพลาดจากเซิร์ฟเวอร์"}`);
      }
    } catch (err) {
      console.error("❌ Error updating status:", err);
    }
  };

  if (loading) return <p className="text-center p-6 text-lg font-semibold">⏳ กำลังโหลดข้อมูล...</p>;

  return (
    <ProtectedRoute>
      <Navbar />

      <div className="p-6 bg-gray-100 min-h-screen">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">จัดการธุรกรรม</h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 bg-white shadow-lg rounded-lg">
            <thead>
              <tr className="bg-blue-500 text-white text-left">
                <th className="border p-4">Citizen ID</th>
                <th className="border p-4">ชื่อ-สกุล</th>
                <th className="border p-4">เลขบัตรประชาชน</th>
                <th className="border p-4">อายุ</th>
                <th className="border p-4">อาชีพ</th>
                <th className="border p-4">กลุ่มเป้าหมาย</th>
                <th className="border p-4">สถานะ</th>
                <th className="border p-4 text-center">อัปเดต</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50 transition duration-200">
                    <td className="p-4">{item.citizen_id}</td>
                    <td className="p-4">{item.fname} {item.lname}</td>
                    <td className="p-4">{item.national_id}</td>
                    <td className="p-4">{item.age} ปี</td>
                    <td className="p-4">{item.occupation || "ไม่ระบุ"}</td>
                    <td className="p-4">{item.group_name}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-md text-white text-sm font-semibold ${
                          item.status === "completed"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                      >
                        {item.status === "completed" ? "เสร็จสิ้น" : "รอดำเนินการ"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition duration-300"
                        onClick={() =>
                          handleStatusChange(
                            item.transaction_id,
                            item.citizen_id,
                            item.status === "completed" ? "pending" : "completed",
                            item.target_group_id
                          )
                        }
                      >
                        เปลี่ยนสถานะ
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center p-6 text-gray-600 text-lg font-semibold">
                    ไม่มีข้อมูล
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
}
