'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let token;
    if (typeof window !== "undefined") {
      token = localStorage.getItem("token");
    }
    console.log("🔍 Token from Local Storage:", token); // ✅ Debug เช็คว่า Token ยังอยู่ไหม
  
    if (!token) {
      console.log("🚨 No Token Found! Redirecting to Login...");
      router.push("/login");
      return;
    }
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
