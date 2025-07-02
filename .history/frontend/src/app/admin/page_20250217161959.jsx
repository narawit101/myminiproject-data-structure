'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("🔍 Token from localStorage:", token); // ✅ ตรวจสอบ Token
  
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchBudgets = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("🔍 Sending Token in Request:", token); // ✅ ตรวจสอบ Token ที่ส่งไป
    
        const res = await fetch("http://localhost:5000/budget/get", {
          headers: { 
            "Authorization": `Bearer ${token}` 
          },
        });
    
        console.log("🔍 API Response Status:", res.status); // ✅ ดูว่า API ตอบอะไรกลับมา
    
        if (!res.ok) {
          throw new Error("Unauthorized");
        }
    
        const data = await res.json();
        setBudgets(data);
      } catch (error) {
        console.error("🚨 Error:", error.message);
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    

    fetchBudgets();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-3">Budget Data</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">#</th>
              <th className="border p-2">Year</th>
              <th className="border p-2">Project Name</th>
              <th className="border p-2">Total Budget</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map((budget, index) => (
              <tr key={budget.id} className="text-center">
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">{budget.year}</td>
                <td className="border p-2">{budget.project_name}</td>
                <td className="border p-2">{budget.total_budget}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
