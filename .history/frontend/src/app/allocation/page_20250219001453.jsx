"use client";
import { useEffect, useState } from "react";

export default function BudgetAllocation() {
  const [allocations, setAllocations] = useState({}); // จัดกลุ่มตาม budget_id
  const [editedAllocations, setEditedAllocations] = useState({});

  // ✅ ดึงข้อมูลทั้งหมดจาก API
  useEffect(() => {
    fetch("http://localhost:5000/allocation/get") // เรียก API ดึงข้อมูลทุกโครงการ
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

  // ✅ แก้ไขค่า allocation_percentage หรือ max_recipients
  const handleEdit = (budgetId, index, field, value) => {
    setEditedAllocations((prev) => ({
      ...prev,
      [`${budgetId}-${index}`]: {
        ...prev[`${budgetId}-${index}`],
        [field]: value,
      },
    }));
  };

  // ✅ บันทึกข้อมูลที่แก้ไข (ส่ง API ไปอัปเดต)
  const handleSave = (budgetId, index) => {
    const updatedData = {
      ...allocations[budgetId].allocations[index],
      ...editedAllocations[`${budgetId}-${index}`],
    };

    fetch("http://localhost:5000/allocation/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    })
      .then((res) => res.json())
      .then(() => {
        // ✅ อัปเดต state หลังจากบันทึกสำเร็จ
        setAllocations((prev) => {
          const newAllocations = { ...prev };
          newAllocations[budgetId].allocations[index] = updatedData;
          return newAllocations;
        });

        // ✅ ล้างค่าใน editedAllocations
        setEditedAllocations((prev) => {
          const newEdited = { ...prev };
          delete newEdited[`${budgetId}-${index}`];
          return newEdited;
        });
      })
      .catch((err) => console.error("Error updating data:", err));
  };

  return (
    <div>
      <h2>Budget Allocation</h2>
      {Object.keys(allocations).map((budgetId) => (
        <div key={budgetId}>
          <h3>โครงการ: {allocations[budgetId].project_name}</h3>
          <table border="1">
            <thead>
              <tr>
                <th>Target Group</th>
                <th>Allocation (%)</th>
                <th>Allocated Amount</th>
                <th>Max Recipients</th>
                <th>Amount per Person</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allocations[budgetId].allocations.map((allocation, index) => (
                <tr key={index}>
                  <td>{allocation.target_group}</td>
                  <td>
                    <input
                      type="number"
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
                  <td>
                    {isNaN(Number(allocation.allocated_amount))
                      ? "-"
                      : Number(allocation.allocated_amount).toFixed(2)}
                  </td>

                  <td>
                    <input
                      type="number"
                      value={
                        editedAllocations[`${budgetId}-${index}`]
                          ?.max_recipients ?? allocation.max_recipients
                      }
                      onChange={(e) =>
                        handleEdit(
                          budgetId,
                          index,
                          "max_recipients",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td>
                    {allocation.amount_per_person
                      ? allocation.amount_per_person.toFixed(2)
                      : "-"}
                  </td>
                  <td>
                    <button onClick={() => handleSave(budgetId, index)}>
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
