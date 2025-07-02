'use client'
import { useState } from "react";


export default function GenerateUsers() {
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/generate-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count }),
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาด! ลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">สร้างผู้ใช้จำลอง</h2>
      <input
        type="number"
        min="1"
        value={count}
        onChange={(e) => setCount(Number(e.target.value))}
        className="border p-2 rounded w-full mb-2"
      />
      <Button onClick={handleGenerate} disabled={loading}>
        {loading ? "กำลังสร้าง..." : "สร้างผู้ใช้"}
      </Button>
      <Card className="mt-4">
        <CardContent>
          <h3 className="font-bold">ผลลัพธ์</h3>
          <ul>
            {users.map((user, index) => (
              <li key={index} className="border-b py-2">
                {user.fname} {user.lname} ({user.national_id}) - {user.occupation}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
