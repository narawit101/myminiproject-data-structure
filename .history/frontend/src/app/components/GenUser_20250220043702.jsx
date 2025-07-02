"use client";

import { useState } from "react";

export default function GenerateUsers() {
  const [count, setCount] = useState();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleGenerate = async () => {
    if (count < 1) {
      alert("กรุณาใส่จำนวนที่ถูกต้อง!");
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("http://localhost:5000/citizens/generate-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count }),
      });

      const data = await res.json();
      setResponse(data);
      alert(data.message || "สร้างผู้ใช้สำเร็จ!");
    } catch (error) {
      console.error("❌ Error:", error);
      alert("เกิดข้อผิดพลาดในการสร้างผู้ใช้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">สร้างผู้ใช้จำลอง</h2>
      <div className="flex gap-4 items-center">
        <input
          type="number"
          className="p-2 border rounded"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          min="1"
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? "กำลังสร้าง..." : "สร้างผู้ใช้"}
        </button>
      </div>
    </div>
  );
}
