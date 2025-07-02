"use client";

import { useEffect, useState } from "react";

export default function TransactionManagement() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/transaction/get")
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ ข้อมูลธุรกรรม:", data); // ดูข้อมูลก่อน
        setTransactions(data);
      })
      .catch((err) => console.error("❌ Error:", err));
  }, []);
  

  const updateStatus = async (transaction) => {
    const newStatus =
      transaction.status === "pending" ? "completed" : "pending";
    try {
      const res = await fetch("http://localhost:5000/transaction/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction_id: transaction.transaction_id,
          citizen_id: transaction.citizen_id,
          status: newStatus,
          target_group_id: transaction.target_group_id,
        }),
      });

      if (res.ok) {
        setTransactions((prev) =>
          prev.map((t) =>
            t.transaction_id === transaction.transaction_id
              ? { ...t, status: newStatus }
              : t
          )
        );
      } else {
        console.error("❌ Failed to update status");
      }
    } catch (error) {
      console.error("❌ Error updating status:", error);
    }
  };

  return (
    return (
  <div>
    <h2>รายการธุรกรรม</h2>
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr>
          <th className="border p-2">Citizen ID</th>
          <th className="border p-2">ชื่อ-สกุล</th>
          <th className="border p-2">กลุ่มเป้าหมาย</th>
          <th className="border p-2">สถานะ</th>
        </tr>
      </thead>
      <tbody>
        {transactions.length > 0 ? (
          transactions.map((transaction, index) => (
            <tr key={index} className="border">
              <td className="p-2">{transaction.citizen_id}</td>
              <td className="p-2">{transaction.fname} {transaction.lname}</td>
              <td className="p-2">{transaction.group_name}</td>
              <td className="p-2">{transaction.status}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="4" className="text-center p-4">ไม่มีข้อมูล</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);
;
}
