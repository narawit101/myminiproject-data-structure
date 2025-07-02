"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute"; // Import ProtectedRoute

export default function BudgetAllocation() {
  const [allocations, setAllocations] = useState({}); // จัดกลุ่มตาม budget_id
  const [editedAllocations, setEditedAllocations] = useState({});
  const [newAllocation, setNewAllocation] = useState({
    budget_id: '',
    target_group: '',
    allocation_percentage: '',
    max_recipients: '',
  });

  // ✅ ดึงข้อมูลทั้งหมดจาก API
  useEffect(() => {
    fetch("http://localhost:5000/allocation/get")
      .then((res) => res.json())
      .then((data) => {
        // ✅ จัดกลุ่มข้อมูลตาม budget_id
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
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  // ✅ ฟังก์ชันการแก้ไขค่า allocation_percentage หรือ max_recipients
  const handleEdit = (budgetId, index, field, value) => {
    setEditedAllocations((prev) => ({
      ...prev,
      [`${budgetId}-${index}`]: {
        ...prev[`${budgetId}-${index}`],
        [field]: value,
      },
    }));
  };

  const handleSave = (budgetId, index) => {
    const targetGroupId =
      allocations[budgetId]?.allocations[index]?.target_group_id;

    console.log("Saving data for:", { budgetId, targetGroupId });

    if (!targetGroupId) {
      console.error("❌ target_group_id is missing!");
      return;
    }

    let allocationPercentage =
      Number(
        editedAllocations[`${budgetId}-${index}`]?.allocation_percentage
      ) ||
      Number(allocations[budgetId].allocations[index].allocation_percentage);

    let maxRecipients =
      Number(editedAllocations[`${budgetId}-${index}`]?.max_recipients) ||
      Number(allocations[budgetId].allocations[index].max_recipients);

    const totalPercentage = allocations[budgetId].allocations.reduce(
      (sum, item, i) => {
        const itemPercentage =
          i === index
            ? allocationPercentage
            : Number(item.allocation_percentage);
        return sum + itemPercentage;
      },
      0
    );

    if (totalPercentage > 100) {
      alert(`❌ การจัดสรรงบประมาณเกิน 100%! (ปัจจุบัน ${totalPercentage}%)`);
      return;
    }

    if (isNaN(allocationPercentage) || isNaN(maxRecipients)) {
      console.error("❌ มีค่า NaN หรือ undefined");
      return;
    }

    const updatedData = {
      budget_id: Number(budgetId),
      target_group_id: Number(targetGroupId),
      allocation_percentage: allocationPercentage,
      max_recipients: maxRecipients,
    };

    fetch("http://localhost:5000/allocation/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Update Success:", data);
        setAllocations((prev) => {
          const newAllocations = { ...prev };
          newAllocations[budgetId].allocations[index] = {
            ...newAllocations[budgetId].allocations[index],
            allocation_percentage: updatedData.allocation_percentage,
            max_recipients: updatedData.max_recipients,
          };
          return newAllocations;
        });

        setEditedAllocations((prev) => {
          const newEdited = { ...prev };
          delete newEdited[`${budgetId}-${index}`];
          return newEdited;
        });

        setTimeout(() => {
          window.location.reload();
        }, 500);
      })
      .catch((err) => console.error("❌ Error updating data:", err));
  };

  // ✅ ฟังก์ชันการเพิ่ม allocation ใหม่
  const handleAddAllocation = () => {
    const { budget_id, target_group, allocation_percentage, max_recipients } = newAllocation;

    if (!budget_id || !target_group || !allocation_percentage || !max_recipients) {
      alert("❌ กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const newAllocationData = {
      budget_id: Number(budget_id),
      target_group,
      allocation_percentage: Number(allocation_percentage),
      max_recipients: Number(max_recipients),
    };

    fetch("http://localhost:5000/allocation/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAllocationData),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Allocation Added:", data);

        // เพิ่มการจัดสรรใหม่เข้าไปใน state
        setAllocations((prev) => {
          const updatedAllocations = { ...prev };
          if (!updatedAllocations[newAllocationData.budget_id]) {
            updatedAllocations[newAllocationData.budget_id] = {
              allocations: [],
            };
          }
          updatedAllocations[newAllocationData.budget_id].allocations.push(data);
          return updatedAllocations;
        });

        // รีเซ็ตค่า input ของฟอร์ม
        setNewAllocation({
          budget_id: '',
          target_group: '',
          allocation_percentage: '',
          max_recipients: '',
        });
      })
      .catch((err) => {
        console.error("❌ Error adding allocation:", err);
      });
  };

  return (
    <div className="p-6 bg-gray-100">
      <ProtectedRoute>
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">
          การแบ่งงบประมาณ
        </h2>

        {/* Add New Allocation Form */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            เพิ่มการจัดสรรงบประมาณ
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-600 mb-1">Budget ID</label>
              <input
                type="number"
                value={newAllocation.budget_id}
                onChange={(e) =>
                  setNewAllocation({ ...newAllocation, budget_id: e.target.value })
                }
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">กลุ่มเป้าหมาย</label>
              <input
                type="text"
                value={newAllocation.target_group}
                onChange={(e) =>
                  setNewAllocation({ ...newAllocation, target_group: e.target.value })
                }
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">การแบ่งสัดส่วน (%)</label>
              <input
                type="number"
                value={newAllocation.allocation_percentage}
                onChange={(e) =>
                  setNewAllocation({ ...newAllocation, allocation_percentage: e.target.value })
                }
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">จำกัดผู้รับสิทธิ์ (คน)</label>
              <input
                type="number"
                value={newAllocation.max_recipients}
                onChange={(e) =>
                  setNewAllocation({ ...newAllocation, max_recipients: e.target.value })
                }
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <button
              onClick={handleAddAllocation}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
              เพิ่มการจัดสรร
            </button>
          </div>
        </div>

        {/* Display Allocations */}
        {Object.keys(allocations).map((budgetId) => (
          <div key={budgetId} className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              โครงการ: {allocations[budgetId].project_name}
            </h3>
            <table className="min-w-full table-auto bg-white shadow-md rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-blue-500 text-white">
                  <th className="py-2 px-4 text-left">กลุ่มเป้าหมาย</th>
                  <th className="py-2 px-4 text-left">การแบ่งสัดส่วน (%)</th>
                  <th className="py-2 px-4 text-left">เป็นเงินทั้งหมด</th>
                  <th className="py-2 px-4 text-left">จำกัดผู้รับสิทธิ์ (คน)</th>
                  <th className="py-2 px-4 text-left">เงินที่ได้รับ (ต่อคน)</th>
                  <th className="py-2 px-4 text-left">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {allocations[budgetId].allocations.map((allocation, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="py-2 px-4">{allocation.target_group}</td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={
                          editedAllocations[`${budgetId}-${index}`]
                            ?.allocation_percentage ??
                          allocation.allocation_percentage
                        }
                        onChange={(e) =>
                          handleEdit(
                            budgetId,
                            index,
                            "allocation_percentage",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td className="py-2 px-4">
                      {isNaN(allocation.allocation_percentage)
                        ? "0"
                        : (allocation.allocation_percentage * allocation.budget_amount) / 100}
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={
                          editedAllocations[`${budgetId}-${index}`]?.max_recipients ??
                          allocation.max_recipients
                        }
                        onChange={(e) =>
                          handleEdit(budgetId, index, "max_recipients", e.target.value)
                        }
                      />
                    </td>
                    <td className="py-2 px-4">
                      {isNaN(allocation.allocation_percentage)
                        ? "0"
                        : (allocation.allocation_percentage * allocation.budget_amount) / 100}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <button
                        onClick={() => handleSave(budgetId, index)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                      >
                        บันทึก
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </ProtectedRoute>
    </div>
  );
}
