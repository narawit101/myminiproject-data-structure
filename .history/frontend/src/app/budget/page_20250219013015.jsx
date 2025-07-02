"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute"; // Import ProtectedRoute

export default function Dashboard() {
  const [budgets, setBudgets] = useState([]);
  const [editProject, setEditProject] = useState(null);
  const [newYear, setNewYear] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [newTotalBudget, setNewTotalBudget] = useState("");

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await fetch("http://localhost:5000/budget/get", {
        headers: { Authorization: "Bearer 042545" },
      });

      const data = await response.json();
      setBudgets(data);
    } catch (error) {
      console.error("Error fetching budget data:", error);
    }
  };

  const handleEdit = async (id) => {
    // Ensure that newProjectName, newYear, and newTotalBudget are valid
    if (
      !newProjectName ||
      !newYear ||
      isNaN(newTotalBudget) ||
      newTotalBudget === ""
    )
      return;

    try {
      // Send the PUT request with budget_id in the URL and both project_name and total_budget in the body
      const response = await fetch(
        `http://localhost:5000/budget/update/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer 042545",
          },
          body: JSON.stringify({
            project_name: newProjectName, // Send the new project name
            total_budget: parseFloat(newTotalBudget), // Send the updated total_budget
          }),
        }
      );

      if (response.ok) {
        setEditProject(null);
        setNewYear("");
        setNewProjectName(""); // Reset project name
        setNewTotalBudget(""); // Reset total budget
        fetchBudgets();
      } else {
        throw new Error("Failed to update project");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าจะลบโครงการนี้?")) return;

    try {
      const response = await fetch(
        `http://localhost:5000/budget/delete/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: "Bearer 042545" },
        }
      );

      if (response.ok) {
        fetchBudgets();
      } else {
        throw new Error("ไม่สามารถลบโครงการได้");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">แดชบอร์ด</h1>
        <h2 className="text-xl font-semibold text-gray-600 mb-4">
          ข้อมูลงบประมาณ
        </h2>
        <div className="overflow-x-auto w-full max-w-4xl">
          <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="py-2 px-4 text-left">ปี</th>
                <th className="py-2 px-4 text-left">ชื่อโครงการ</th>
                <th className="py-2 px-4 text-left">งบประมาณรวม</th>
                <th className="py-2 px-4 text-left">งบประมาณคงเหลือ</th>
                <th className="py-2 px-4 text-center">การกระทำ</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((budget) => {
                const remainingBudget = budget.remaining_budget; // คำนวณงบประมาณคงเหลือ
                return (
                  <tr key={budget.id} className="border-b">
                    <td className="py-2 px-4">
                      {editProject === budget.id ? (
                        <input
                          type="number"
                          value={newYear}
                          onChange={(e) => setNewYear(e.target.value)}
                          className="w-full p-2 border rounded"
                        />
                      ) : (
                        budget.year
                      )}
                    </td>
                    <td className="py-2 px-4">
                      {editProject === budget.id ? (
                        <input
                          type="text"
                          value={newProjectName}
                          onChange={(e) => setNewProjectName(e.target.value)}
                          className="w-full p-2 border rounded"
                        />
                      ) : (
                        budget.project_name
                      )}
                    </td>
                    <td className="py-2 px-4">
                      {editProject === budget.id ? (
                        <input
                          type="number"
                          value={newTotalBudget}
                          onChange={(e) => setNewTotalBudget(e.target.value)}
                          className="w-full p-2 border rounded"
                        />
                      ) : (
                        budget.total_budget
                      )}
                    </td>
                    <td className="py-2 px-4">
                      {remainingBudget} {/* แสดงงบประมาณคงเหลือ */}
                    </td>
                    <td className="py-2 px-4 flex gap-2 justify-center">
                      {editProject === budget.id ? (
                        <>
                          <button
                            onClick={() => handleEdit(budget.id)}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                          >
                            บันทึก
                          </button>
                          <button
                            onClick={() => setEditProject(null)}
                            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                          >
                            ยกเลิก
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditProject(budget.id);
                              setNewYear(budget.year);
                              setNewProjectName(budget.project_name);
                              setNewTotalBudget(budget.total_budget);
                            }}
                            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={() => handleDelete(budget.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          >
                            ลบ
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
}
