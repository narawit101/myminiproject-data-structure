'use client'
import { useState } from "react";

export default function Home({ reportData }) {
  const [allocations, setAllocations] = useState(reportData.groups);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* หัวข้อโครงการ */}
      <h1 className="text-3xl font-bold text-center mb-6">โครงการทั้งหมด</h1>
      <div className="flex justify-center">
        <button className="bg-blue-500 text-white px-4 py-2 rounded">เพิ่มงบประมาณ</button>
      </div>

      {/* ตารางแสดงโครงการ */}
      <div className="mt-6 bg-white p-4 rounded shadow-md">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="p-2">งบประมาณทั้งหมด</th>
              <th className="p-2">งบประมาณคงเหลือ</th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-center">
              <td className="p-2">{reportData.total_budget} บาท</td>
              <td className="p-2">{reportData.total_remaining_budget} บาท</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ส่วนการแบ่งงบประมาณ */}
      <h2 className="text-2xl font-bold mt-8">การแบ่งงบประมาณ</h2>

      {/* ตารางแสดงการแบ่งงบประมาณ */}
      <div className="mt-4 bg-white p-4 rounded shadow-md">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="p-2">กลุ่มเป้าหมาย</th>
              <th className="p-2">เงินทั้งหมด</th>
              <th className="p-2">จำนวนที่รับสิทธิ์</th>
              <th className="p-2">เงินที่ได้รับต่อคน</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((alloc) => (
              <tr key={alloc.target_group_id} className="text-center">
                <td className="p-2">{alloc.group_name}</td>
                <td className="p-2">{alloc.allocated_amount.toLocaleString()} บาท</td>
                <td className="p-2">{alloc.received_count}</td>
                <td className="p-2">
                  {alloc.received_count > 0 ? (alloc.allocated_amount / alloc.received_count).toLocaleString() : "-"} บาท
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ✅ โหลดข้อมูลจาก API ก่อนเรนเดอร์หน้า
export async function getServerSideProps() {
  try {
    const res = await fetch("http://localhost:5000/");
    const reportData = await res.json();
    return { props: { reportData } };
  } catch (error) {
    console.error("API Fetch Error:", error);
    return { props: { reportData: null } };
  }
}