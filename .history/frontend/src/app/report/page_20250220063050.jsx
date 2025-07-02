'use client'
import { useState } from "react";

const data = {
  year: 2028,
  projectName: "โครงการแจกเงินดิจิตอล (เฟส1)",
  totalBudget: 100000,
  remainingBudget: 0,
  allocations: [
    { id: 1, group: "กลุ่มผู้สูงอายุ", percentage: 50, amount: 50000, recipients: 200 },
    { id: 2, group: "กลุ่มผู้มีรายได้น้อย", percentage: 30, amount: 30000, recipients: 500 },
    { id: 3, group: "กลุ่มเกษตรกร", percentage: 20, amount: 20000, recipients: 500 },
  ],
};

export default function Home() {
  const [allocations, setAllocations] = useState(data.allocations);

  const handleSave = (id) => {
    alert(`บันทึกการเปลี่ยนแปลงของ ${id}`);
  };

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
              <th className="p-2">ปี</th>
              <th className="p-2">ชื่อโครงการ</th>
              <th className="p-2">งบประมาณทั้งหมด</th>
              <th className="p-2">งบประมาณคงเหลือ</th>
              <th className="p-2">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-center">
              <td className="p-2">{data.year}</td>
              <td className="p-2">{data.projectName}</td>
              <td className="p-2">{data.totalBudget.toLocaleString()} บาท</td>
              <td className="p-2">{data.remainingBudget.toLocaleString()} บาท</td>
              <td className="p-2">
                <button className="bg-blue-400 text-white px-2 py-1 rounded mx-1">แก้ไข</button>
                <button className="bg-red-500 text-white px-2 py-1 rounded">ลบโครงการ</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ส่วนการแบ่งงบประมาณ */}
      <h2 className="text-2xl font-bold mt-8">การแบ่งงบประมาณ</h2>
      <p className="text-lg">โครงการ: {data.projectName}</p>

      {/* ตารางแสดงการแบ่งงบประมาณ */}
      <div className="mt-4 bg-white p-4 rounded shadow-md">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="p-2">กลุ่มเป้าหมาย</th>
              <th className="p-2">การแบ่งสัดส่วน (%)</th>
              <th className="p-2">เป็นเงินทั้งหมด</th>
              <th className="p-2">จำกัดผู้รับสิทธิ์ (คน)</th>
              <th className="p-2">เงินที่ได้รับ (ต่อคน)</th>
              <th className="p-2">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((alloc) => (
              <tr key={alloc.id} className="text-center">
                <td className="p-2">{alloc.group}</td>
                <td className="p-2">
                  <input
                    type="number"
                    className="border p-1 w-20 text-center"
                    defaultValue={alloc.percentage}
                  />
                </td>
                <td className="p-2">{alloc.amount.toLocaleString()} บาท</td>
                <td className="p-2">
                  <input
                    type="number"
                    className="border p-1 w-20 text-center"
                    defaultValue={alloc.recipients}
                  />
                </td>
                <td className="p-2">
                  {Math.floor(alloc.amount / alloc.recipients).toLocaleString()} บาท
                </td>
                <td className="p-2">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={() => handleSave(alloc.id)}
                  >
                    บันทึก
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
