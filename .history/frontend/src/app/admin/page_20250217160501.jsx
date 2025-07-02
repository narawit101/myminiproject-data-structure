"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      fetch("http://localhost:5000/admin/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            localStorage.removeItem("token");
            router.push("/login");
          } else {
            setAdmin(data);
          }
        });
    }
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      {admin ? (
        <Card>
          <CardContent>
            <p>Welcome, {admin.name}</p>
            <Button onClick={() => {
              localStorage.removeItem("token");
              router.push("/login");
            }}>Logout</Button>
          </CardContent>
        </Card>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
