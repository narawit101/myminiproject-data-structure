"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Nav";
import ProtectedRoute from "../components/ProtectedRoute";

export default function TransactionManagement() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all"); // ค่าตัวกรองสถานะ
  const [filterGroup, setFilterGroup] = useState("all"); // ค่าตัวกรองกลุ่มเป้าหมาย
  const [groupOptions, setGroupOptions] = useState([]); // ตัวเลือกกลุ่มเป้าหมาย

  useEffect(() => {
    fetch("http://localhost:5000/transaction/get")
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ ข้อมูลธุรกรรม:", data);
        setTransactions(data);
        setLoading(false);

        // ดึงกลุ่มเป้าหมายทั้งหมดจากข้อมูลที่ได้
        const uniqueGroups = [...new Set(data.map((item) => item.group_name))];
        setGroupOptions(uniqueGroups);
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
      transactionId,
      citizenId,
      newStatus,
      targetGroupId,
    });

    if (!transactionId || !citizenId || !newStatus || !targetGroupId) {
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
        alert(
          `❌ อัปเดตล้มเหลว: ${
            responseData.message || "ข้อผิดพลาดจากเซิร์ฟเวอร์"
          }`
        );
      }
    } catch (err) {
      console.error("❌ Error updating status:", err);
    }
  };

  // กรองข้อมูลและเรียง Citizen ID
  const filteredTransactions = transactions
    .filter((item) =>
      filterStatus === "all" ? true : item.status === filterStatus
    )
    .filter((item) =>
      filterGroup === "all" ? true : item.group_name === filterGroup
    )
    .sort((a, b) => a.citizen_id - b.citizen_id); // ✅ เรียง Citizen ID จากน้อยไปมาก

  if (loading)
    return (
      <p className="text-center p-6 text-lg font-semibold">
        ⏳ กำลังโหลดข้อมูล...
      </p>
    );

  return (
    <ProtectedRoute>
      <Navbar />

      <div className="p-6 bg-gray-100 min-h-screen">
        <h2
          className="text-3xl font-semibold text-gray-800 mb-6 text-center"
          style={{ marginTop: "60px" }}
        >
          จัดการธุรกรรม
        </h2>

        {/* ฟิลเตอร์เลือกสถานะและกลุ่มเป้าหมาย */}
        <div className="mb-4 flex justify-between">
          <div>
            <label className="mr-2 text-gray-700 font-medium">
              กรองตามสถานะ:
            </label>
            <select
              className="border border-gray-300 rounded-md px-3 py-1 shadow bg-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">ทั้งหมด</option>
              <option value="pending">รอดำเนินการ</option>
              <option value="completed">เสร็จสิ้น</option>
            </select>
          </div>

          <div>
            <label className="mr-2 text-gray-700 font-medium">
              กรองตามกลุ่มเป้าหมาย:
            </label>
            <select
              className="border border-gray-300 rounded-md px-3 py-1 shadow bg-white"
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
            >
              <option value="all">ทั้งหมด</option>
              {groupOptions.map((group, index) => (
                <option key={index} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 bg-white shadow-lg rounded-lg">
            <thead>
              <tr className="bg-blue-500 text-white text-left">
                <th className="border p-4">เลขบัตรประชาชน</th>
                <th className="border p-4">ชื่อ-สกุล</th>
                <th className="border p-4">อายุ</th>
                <th className="border p-4">อาชีพ</th>
                <th className="border p-4">กลุ่มเป้าหมาย</th>
                <th className="border p-4">สถานะ</th>
                <th className="border p-4 text-center">อัปเดต</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-50 transition duration-200"
                  >
                    <td className="p-4">{item.national_id}</td>
                    <td className="p-4">
                      {item.fname} {item.lname}
                    </td>
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
                        {item.status === "completed"
                          ? "เสร็จสิ้น"
                          : "รอดำเนินการ"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition duration-300"
                        onClick={() =>
                          handleStatusChange(
                            item.transaction_id,
                            item.citizen_id,
                            item.status === "completed"
                              ? "pending"
                              : "completed",
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
                  <td
                    colSpan="8"
                    className="text-center p-6 text-gray-600 text-lg font-semibold"
                  >
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
