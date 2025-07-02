"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [budgets, setBudgets] = useState([]);
  const [editProject, setEditProject] = useState(null);
  const [newProjectName, setNewProjectName] = useState("");

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await fetch("http://localhost:5000/budget/get", {
        headers: {
          Authorization: "Bearer 042545", // ใช้ token เหมือนใน Postman
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setBudgets(data);
    } catch (error) {
      console.error("Error fetching budget data:", error);
    }
  };

  // ✅ แก้ไขชื่อโครงการ
  // ✅ อัปเดตโครงการ
  const handleEdit = async (id) => {
    if (!newProjectName.trim() || newTotalBudget === undefined) return; // ✅ เช็กค่าก่อนส่ง

    try {
      const response = await fetch(
        `http://localhost:5000/budget/update/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer 042545",
          },
          body: JSON.stringify({
            project_name: newProjectName,
            total_budget: newTotalBudget, // ✅ ส่ง budget ไปด้วย
          }),
        }
      );

      const result = await response.json();
      console.log("Update Response:", result); // ✅ Debug ดูข้อมูลที่ส่งกลับมา

      if (!response.ok) {
        throw new Error(result.message || "Failed to update project");
      }

      setEditProject(null);
      setNewProjectName("");
      setNewTotalBudget(""); // ✅ ล้างค่า budget หลังอัปเดต
      fetchBudgets(); // โหลดข้อมูลใหม่หลังอัปเดต
    } catch (error) {
      console.error("Error updating project:", error);
      alert(error.message);
    }
  };

  // ❌ ลบโครงการ
  const handleDelete = async (id) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบโครงการนี้?")) return;

    try {
      const response = await fetch(
        `http://localhost:5000/budget/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer 042545",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      fetchBudgets(); // โหลดข้อมูลใหม่หลังลบ
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <h2>Budget Data</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Year</th>
            <th>Project Name</th>
            <th>Total Budget</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {budgets.map((budget) => (
            <tr key={budget.id}>
              <td>{budget.year}</td>
              <td>
                {editProject === budget.id ? (
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                  />
                ) : (
                  budget.project_name
                )}
              </td>
              <td>{budget.total_budget}</td>
              <td>
                {editProject === budget.id ? (
                  <button onClick={() => handleEdit(budget.id)}>✔ Save</button>
                ) : (
                  <button onClick={() => setEditProject(budget.id)}>
                    ✏ Edit
                  </button>
                )}
                <button onClick={() => handleDelete(budget.id)}>
                  ❌ Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
