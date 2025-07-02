"use client";

import { useEffect, useState } from "react";

export default function TransactionManagement() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch("http://localhost:5000/transaction/get");
      const data = await res.json();
      setTransactions(data);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching transactions:", error);
      setLoading(false);
    }
  };

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
    <div className="p-6 bg-gray-100">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">
        จัดการธุรกรรม
      </h2>

      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : (
        <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">ชื่อ-สกุล</th>
              <th className="p-3">กลุ่มเป้าหมาย</th>
              <th className="p-3">สถานะ</th>
              <th className="p-3">จัดการ</th>
            </tr>
          </thead>
          <tbody>
          {transactions.map((transaction) => (
  <tr key={transaction.transaction_id}> {/* ✅ ใช้ transaction_id เป็น key */}
    <td>{transaction.citizen_id}</td>
    <td>{transaction.fname} {transaction.lname}</td>
    <td>{transaction.group_name}</td>
    <td>{transaction.status}</td>
    <td>
      <button
        className="px-2 py-1 bg-blue-500 text-white rounded"
        onClick={() => updateStatus(transaction.transaction_id, transaction.status)}
      >
        เปลี่ยนสถานะ
      </button>
    </td>
  </tr>
))}

          </tbody>
        </table>
      )}
    </div>
  );
}
