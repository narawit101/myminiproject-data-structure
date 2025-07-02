"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Nav";
import ProtectedRoute from "../components/ProtectedRoute";

export default function TransactionManagement() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransactions, setSelectedTransactions] = useState([]);

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

  const handleCheckboxChange = (transactionId) => {
    setSelectedTransactions((prev) =>
      prev.includes(transactionId)
        ? prev.filter((id) => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const handleBulkUpdate = async (newStatus) => {
    if (selectedTransactions.length === 0) {
      alert("กรุณาเลือกธุรกรรมก่อน");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/transaction/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction_ids: selectedTransactions,
          status: newStatus,
        }),
      });

      const responseData = await response.json();
      console.log("✅ อัปเดตเรียบร้อย:", responseData);

      if (response.ok) {
        alert("✅ อัปเดตสถานะเรียบร้อย");
        setTransactions((prev) =>
          prev.map((item) =>
            selectedTransactions.includes(item.transaction_id)
              ? { ...item, status: newStatus }
              : item
          )
        );
        setSelectedTransactions([]);
      } else {
        alert(`❌ อัปเดตล้มเหลว: ${responseData.message || "Server Error"}`);
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

        <div className="mb-4 flex gap-2">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={selectedTransactions.length === 0}
            onClick={() => handleBulkUpdate("completed")}
          >
            ✅ อัปเดตเป็น "เสร็จสิ้น"
          </button>
          <button
            className="bg-yellow-500 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={selectedTransactions.length === 0}
            onClick={() => handleBulkUpdate("pending")}
          >
            ⏳ อัปเดตเป็น "รอดำเนินการ"
          </button>
        </div>

        <table className="w-full border-collapse border border-gray-300 bg-white shadow-md">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-center">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    setSelectedTransactions(
                      e.target.checked ? transactions.map((item) => item.transaction_id) : []
                    )
                  }
                  checked={selectedTransactions.length === transactions.length && transactions.length > 0}
                />
              </th>
              <th className="border p-2">Citizen ID</th>
              <th className="border p-2">ชื่อ-สกุล</th>
              <th className="border p-2">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((item) => (
              <tr key={item.transaction_id} className="border">
                <td className="p-2 text-center">
                  <input
                    type="checkbox"
                    checked={selectedTransactions.includes(item.transaction_id)}
                    onChange={() => handleCheckboxChange(item.transaction_id)}
                  />
                </td>
                <td className="p-2">{item.citizen_id}</td>
                <td className="p-2">
                  {item.fname} {item.lname}
                </td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded-md text-white ${
                      item.status === "completed" ? "bg-green-500" : "bg-yellow-500"
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
