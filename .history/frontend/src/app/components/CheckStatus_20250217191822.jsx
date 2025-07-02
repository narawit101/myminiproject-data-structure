"use client";
import { useState } from "react";

export default function CheckTargetPage() {
  const [nationalId, setNationalId] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const formatDate = (isoDate) => {
    if (!isoDate) return "ยังไม่มีข้อมูล";
    const date = new Date(isoDate);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const handleCheckTarget = async () => {
    if (nationalId.trim().length !== 13) {
      setError("กรุณากรอกเลขบัตรประชาชน 13 หลักให้ถูกต้อง");
      setResult(null);
      return;
    }

    setError("");
    setResult(null);

    try {
      const response = await fetch(`http://localhost:5000/citizens/check-target/${nationalId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "เกิดข้อผิดพลาด");
      }

      setResult(data);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-9">ตรวจสอบกลุ่มเป้าหมายและวันรับเงิน</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <label className="block mb-2">เลขบัตรประชาชน:</label>
        <input
          type="text"
          value={nationalId}
          onChange={(e) => setNationalId(e.target.value)}
          className="border p-2 rounded w-full"
          maxLength={13}
          placeholder="กรอกเลขบัตรประชาชน"
        />

        <button
          onClick={handleCheckTarget}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          ตรวจสอบ
        </button>

        {error && <p className="mt-4 text-red-500">{error}</p>}

        {result && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
            <p><strong>ชื่อ-สกุล:</strong> {result.fname} {result.lname}</p>
            <p><strong>อายุ:</strong> {result.age} ปี</p>
            <p><strong>อาชีพ:</strong> {result.occupation || "ไม่ระบุ"}</p>
            <p><strong>กลุ่มเป้าหมาย:</strong> {result.target_group || "ไม่เข้าข่าย"}</p>
            <p><strong>วันรับเงิน:</strong> {formatDate(result.distribution_date)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
