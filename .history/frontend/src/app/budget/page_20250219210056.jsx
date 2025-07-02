"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";

export default function Dashboard() {
  const [budgets, setBudgets] = useState([]);
  const [editProject, setEditProject] = useState(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [newTotalBudget, setNewTotalBudget] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newYear, setNewYear] = useState("");

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

  const handleEdit = async () => {
    if (!newProjectName || isNaN(newTotalBudget) || newTotalBudget === "")
      return;

    try {
      const response = await fetch(
        `http://localhost:5000/budget/update/${editProject.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer 042545",
          },
          body: JSON.stringify({
            project_name: newProjectName,
            total_budget: parseFloat(newTotalBudget),
          }),
        }
      );

      if (response.ok) {
        setEditProject(null);
        setNewProjectName("");
        setNewTotalBudget("");
        fetchBudgets();
      } else {
        throw new Error("Failed to update budget");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAddBudget = async () => {
    if (
      !newYear ||
      !newProjectName ||
      isNaN(newTotalBudget) ||
      newTotalBudget === ""
    )
      return;

    try {
      const response = await fetch("http://localhost:5000/budget/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer 042545",
        },
        body: JSON.stringify({
          year: newYear,
          project_name: newProjectName,
          total_budget: parseFloat(newTotalBudget),
        }),
      });

      if (response.ok) {
        setNewYear("");
        setNewProjectName("");
        setNewTotalBudget("");
        setShowAddForm(false);
        fetchBudgets();
      } else {
        throw new Error("Failed to add budget");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบโครงการนี้?")) return;
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
        throw new Error("Failed to delete budget");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <ProtectedRoute>
      <div className="bg-gray-100 flex flex-col items-center p-6">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">
          โครงการทั้งหมด
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 mb-4"
        >
          เพิ่มงบประมาณ
        </button>

        {showAddForm && (
          <div className="bg-white p-4 shadow-md rounded-md mb-4 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-2">เพิ่มงบประมาณใหม่</h3>
            <input
              type="number"
              placeholder="ปี"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              placeholder="ชื่อโครงการ"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="number"
              placeholder="งบประมาณ"
              value={newTotalBudget}
              onChange={(e) => setNewTotalBudget(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddBudget}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                บันทึก
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto w-full max-w-4xl">
          <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="py-2 px-4 text-left">ปี</th>
                <th className="py-2 px-4 text-left">ชื่อโครงการ</th>
                <th className="py-2 px-4 text-left">งบประมาณทั้งหมด</th>
                <th className="py-2 px-4 text-left">งบประมาณคงเหลือ</th>
                <th className="py-2 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((budget) => {
                const remainingBudget =
                  parseFloat(budget.remaining_budget) || 0;
                const totalBudget = parseFloat(budget.total_budget) || 0;
                return (
                  <tr key={budget.id} className="border-b">
                    <td className="py-2 px-4">{budget.year}</td>
                    <td className="py-2 px-4">{budget.project_name}</td>
                    <td className="py-2 px-4">{`${totalBudget.toLocaleString()} บาท`}</td>
                    <td className="py-2 px-4">{`${remainingBudget.toLocaleString()} บาท`}</td>
                    <td className="py-2 px-4 flex gap-2 justify-center">
                      <button
                        onClick={() => {
                          setEditProject(budget);
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
                        ลบโครงการ
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {editProject && (
          <div className="bg-white p-4 shadow-md rounded-md w-full max-w-md mt-6">
            <h3 className="text-xl font-semibold mb-2">แก้ไขงบประมาณ</h3>
            <input
              type="text"
              placeholder="ชื่อโครงการ"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="number"
              placeholder="งบประมาณ"
              value={newTotalBudget}
              onChange={(e) => setNewTotalBudget(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            />
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                บันทึกการแก้ไข
              </button>
              <button
                onClick={() => setEditProject(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
