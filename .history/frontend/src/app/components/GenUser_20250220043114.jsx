import { useState } from "react";


export default function GenerateUsers() {
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);

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
        toast({ title: "✅ สร้างผู้ใช้สำเร็จ!", description: `สร้าง ${count} ผู้ใช้เรียบร้อยแล้ว` });
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
      <h2 className="text-2xl font-bold mb-4 text-center">🚀 สร้างผู้ใช้จำลอง</h2>
      <div className="flex items-center gap-2 mb-4">
        <input
          type="number"
          min="1"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="border p-2 rounded w-full text-lg text-center"
        />
        <Button onClick={handleGenerate} disabled={loading} className="px-4 py-2 text-lg">
          {loading ? "กำลังสร้าง..." : "สร้างผู้ใช้"}
        </Button>
      </div>
      {users.length > 0 && (
        <Card className="mt-4 p-4 shadow-lg">
          <CardContent>
            <h3 className="font-bold text-lg mb-2">ผลลัพธ์</h3>
            <ul className="divide-y">
              {users.slice((page - 1) * 10, page * 10).map((user, index) => (
                <li key={index} className="py-2 text-sm">
                  <span className="font-medium">{user.fname} {user.lname}</span> ({user.national_id}) - {user.occupation}
                </li>
              ))}
            </ul>
            <div className="flex justify-between mt-4">
              <Button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>
                ก่อนหน้า
              </Button>
              <Button onClick={() => setPage((prev) => prev + 1)} disabled={page * 10 >= users.length}>
                ถัดไป
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
