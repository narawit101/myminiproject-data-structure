"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Nav"; // ใส่ Navbar ที่คุณใช้
import ProtectedRoute from "../components/ProtectedRoute"; // ถ้ามีการตรวจสอบการเข้าสู่ระบบ

export default function ReportPage() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ดึงข้อมูลจาก API
    fetch("http://localhost:5000/report/get")
      .then((response) => response.json())
      .then((data) => {
        console.log("✅ ข้อมูลรายงาน:", data);
        setReportData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("❌ ข้อผิดพลาด:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <p className="text-center p-6 text-lg font-semibold">
        ⏳ กำลังโหลดข้อมูล...
      </p>
    );
  }

  if (!reportData) {
    return (
      <p className="text-center p-6 text-lg font-semibold text-red-600">
        ❌ ไม่พบข้อมูล
      </p>
    );
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="p-6 bg-gray-100 min-h-screen">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
          รายงานการจัดสรรงบประมาณ
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 bg-white shadow-lg rounded-lg">
            <thead>
              <tr className="bg-blue-500 text-white text-left">
                <th className="border p-4">งบประมาณหลักทั้งหมด</th>
                <th className="border p-4">งบประมาณหลักคงเหลือ</th>
                <th className="border p-4">ชื่อโครงการ</th>
                <th className="border p-4">กลุ่มเป้าหมาย</th>
                <th className="border p-4">จำนวนงบประมาณที่จัดสรร</th>
                {/* <th className="border p-4">งบประมาณที่เหลือ</th> */}
                <th className="border p-4">จำนวนที่ได้รับแล้ว</th>
                <th className="border p-4">จำนวนที่ค้าง</th>
                <th className="border p-4">จำนวนประชากรทั้งหมด</th>
              </tr>
            </thead>
            <tbody>
              {reportData.groups.map((group, index) => (
                <tr key={index} className="border-b hover:bg-gray-50 transition duration-200">
                  <td className="p-4">{reportData.total_budget}</td>
                  <td className="p-4">{reportData.total_remaining_budget}</td>
                  <td className="p-4">{group.budget_name}</td>
                  <td className="p-4">{group.group_name}</td>
                  <td className="p-4">{group.allocated_amount}</td>
                  {/* <td className="p-4">{group.remaining_budget}</td> */}
                  <td className="p-4">{group.received_count}</td>
                  <td className="p-4">{group.pending_count}</td>
                  <td className="p-4">{group.total_citizens}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
}
