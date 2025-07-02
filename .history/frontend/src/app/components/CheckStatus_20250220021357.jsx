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
      const response = await fetch(
        `http://localhost:5000/citizens/check-target/${nationalId}`
      );
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
    <div className="flex flex-col items-center justify-center bg-gray-100 p-6">
     

      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 className="text-1xl font-bold mb-5">
        ตรวจสอบกลุ่มเป้าหมายและวันรับเงิน
      </h1>
        <label className="block mb-2 font-medium">เลขบัตรประชาชน:</label>
        <input
          type="text"
          value={nationalId}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, ""); // รับเฉพาะตัวเลข
            setNationalId(value);
          }}
          className="border p-2 rounded w-full focus:outline-blue-500"
          maxLength={13}
          placeholder="กรอกเลขบัตรประชาชน"
          autoFocus
        />

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleCheckTarget}
            className={`px-4 py-2 rounded transition duration-200 ${
              error
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white`}
          >
            ตรวจสอบ
          </button>
        </div>

        {error && <p className="mt-4 text-red-500">{error}</p>}

        {result && (
          <div className="mt-6 p-6 bg-green-100 border border-green-400 rounded-lg">
            <div className="flex flex-wrap gap-6 items-center">
              <p>
                <strong>ชื่อ-สกุล:</strong> {result.fname} {result.lname}
              </p>
              <p>
                <strong>อายุ:</strong> {result.age} ปี
              </p>
              <p>
                <strong>อาชีพ:</strong> {result.occupation || "ไม่ระบุ"}
              </p>
              <p>
                <strong>กลุ่มเป้าหมาย:</strong>{" "}
                {result.target_group || "ไม่เข้าข่าย"}
              </p>
              <p>
                <strong>วันรับเงิน:</strong> {result.distribution_date}
              </p>
            </div>

            {result.amount && Number(result.amount) > 0 ? (
              <div className="mt-4 p-4 bg-white border border-green-500 rounded-lg flex flex-wrap gap-6 items-center">
                <p className="text-green-600">
                  <strong>จำนวนเงิน:</strong>{" "}
                  {Number(result.amount).toLocaleString()} บาท
                </p>
                <p>
                  <strong>วันที่ลงทะเบียน:</strong>{" "}
                  {formatDate(result.transaction_date)}
                </p>
                <p>
                  <strong>สถานะ:</strong> {result.status}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-red-500 text-lg">❌ ท่านไม่ได้รับเงิน</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
