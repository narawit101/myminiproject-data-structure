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
    const newStatus = transaction.status === "pending" ? "completed" : "pending";
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
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">จัดการธุรกรรม</h2>

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
              <tr key={transaction.transaction_id} className="border-t">
                <td className="p-3">
                  {transaction.fname} {transaction.lname}
                </td>
                <td className="p-3">{transaction.group_name}</td>
                <td className="p-3 text-center">
                  <span
                    className={`px-2 py-1 rounded-md text-white text-sm ${
                      transaction.status === "completed" ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  >
                    {transaction.status}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => updateStatus(transaction)}
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
