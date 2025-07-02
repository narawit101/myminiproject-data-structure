"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";

export default function BudgetAllocation() {
  const [allocations, setAllocations] = useState({});
  const [projects, setProjects] = useState([]);
  const [newAllocation, setNewAllocation] = useState({
    budget_id: "",
    target_group_id: "",
    allocation_percentage: "",
    max_recipients: "",
  });

  useEffect(() => {
    fetch("http://localhost:5000/allocation/get")
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Allocation Data:", data);

        const groupedData = data.reduce((acc, item) => {
          if (!acc[item.budget_id]) {
            acc[item.budget_id] = {
              project_name: item.project_name,
              allocations: [],
            };
          }
          acc[item.budget_id].allocations.push(item);
          return acc;
        }, {});

        setAllocations(groupedData);

        const projectList = Object.keys(groupedData).map((budget_id) => ({
          id: budget_id,
          name: groupedData[budget_id].project_name,
        }));

        setProjects(projectList);
      })
      .catch((err) => console.error("❌ Error fetching allocation data:", err));
  }, []);

  const handleNewAllocationChange = (e) => {
    const { name, value } = e.target;
    setNewAllocation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddAllocation = () => {
    fetch("http://localhost:5000/allocation/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        budget_id: Number(newAllocation.budget_id),
        target_group_id: Number(newAllocation.target_group_id),
        allocation_percentage: Number(newAllocation.allocation_percentage),
        max_recipients: Number(newAllocation.max_recipients),
      }),
    })
      .then((res) => res.json())
      .then(() => {
        alert("✅ เพิ่มข้อมูลการจัดสรรสำเร็จ");
        setTimeout(() => {
          window.location.reload();
        }, 500);
      })
      .catch((err) => console.error("❌ Error adding allocation:", err));
  };

  return (
    <div className="p-6 bg-gray-100">
      <ProtectedRoute>
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">
          การแบ่งงบประมาณ
        </h2>

        {/* ✅ ฟอร์มเพิ่มการจัดสรรงบประมาณ */}
        <div className="bg-white p-4 shadow-md rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">เพิ่มการจัดสรรงบประมาณ</h3>
          <div className="grid grid-cols-2 gap-4">
            <select
              name="budget_id"
              className="p-2 border rounded-md"
              value={newAllocation.budget_id}
              onChange={handleNewAllocationChange}
            >
              <option value="">เลือกโครงการ</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              name="target_group_id"
              placeholder="รหัสกลุ่มเป้าหมาย (target_group_id)"
              className="p-2 border rounded-md"
              value={newAllocation.target_group_id}
              onChange={handleNewAllocationChange}
            />
            <input
              type="number"
              name="allocation_percentage"
              placeholder="สัดส่วน (%)"
              className="p-2 border rounded-md"
              value={newAllocation.allocation_percentage}
              onChange={handleNewAllocationChange}
            />
            <input
              type="number"
              name="max_recipients"
              placeholder="จำกัดจำนวนผู้รับ"
              className="p-2 border rounded-md"
              value={newAllocation.max_recipients}
              onChange={handleNewAllocationChange}
            />
          </div>
          <button
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            onClick={handleAddAllocation}
          >
            เพิ่มการจัดสรร
          </button>
        </div>

        {Object.keys(allocations).map((budgetId) => (
          <div key={budgetId} className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              โครงการ: {allocations[budgetId].project_name}
            </h3>
          </div>
        ))}
      </ProtectedRoute>
    </div>
  );
}
