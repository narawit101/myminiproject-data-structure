"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute"; // Import ProtectedRoute

export default function BudgetAllocation() {
  const [allocations, setAllocations] = useState({}); // จัดกลุ่มตาม budget_id
  const [editedAllocations, setEditedAllocations] = useState({});

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

  const handleSave = (budgetId, index) => {
    const targetGroupId =
      allocations[budgetId]?.allocations[index]?.target_group_id;

    console.log("Saving data for:", { budgetId, targetGroupId });

    if (!targetGroupId) {
      console.error("❌ target_group_id is missing!");
      return;
    }

    // ✅ ดึงค่า allocation_percentage และ max_recipients อย่างแน่นอน
    let allocationPercentage =
      Number(
        editedAllocations[`${budgetId}-${index}`]?.allocation_percentage
      ) ||
      Number(allocations[budgetId].allocations[index].allocation_percentage);

    let maxRecipients =
      Number(editedAllocations[`${budgetId}-${index}`]?.max_recipients) ||
      Number(allocations[budgetId].allocations[index].max_recipients);

    // 🔴 เช็คว่า allocation_percentage รวมกันเกิน 100% หรือไม่
    const totalPercentage = allocations[budgetId].allocations.reduce(
      (sum, item, i) => {
        const itemPercentage =
          i === index
            ? allocationPercentage // ใช้ค่าที่ถูกแก้ไข
            : Number(item.allocation_percentage); // ใช้ค่าปัจจุบัน
        return sum + itemPercentage;
      },
      0
    );

    if (totalPercentage > 100) {
      alert(
        `❌ การจัดสรรงบประมาณเกิน 100%! (ปัจจุบัน ${totalPercentage}%)\nโปรดปรับค่าใหม่`
      );
      return;
    }

    // ✅ ตรวจสอบว่าไม่มีค่าไหนเป็น NaN หรือ Undefined
    if (isNaN(allocationPercentage) || isNaN(maxRecipients)) {
      console.error("❌ มีค่า NaN หรือ undefined");
      return;
    }

    const updatedData = {
      budget_id: Number(budgetId), // ✅ แปลงเป็นตัวเลข
      target_group_id: Number(targetGroupId), // ✅ แปลงเป็นตัวเลข
      allocation_percentage: allocationPercentage,
      max_recipients: maxRecipients,
    };

    console.log("📤 Sending updatedData:", updatedData);

    fetch("http://localhost:5000/allocation/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errData) => {
            console.error("❌ API Error:", errData);
            throw new Error("Failed to update");
          });
        }
        return res.json();
      })
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

        // ✅ รีหน้าใหม่เพื่อโหลดข้อมูลล่าสุด
        setTimeout(() => {
          window.location.reload();
        }, 500);
      })
      .catch((err) => console.error("❌ Error updating data:", err));
  };

  return (
    <div>
      <ProtectedRoute>
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
                        } // Ensure handleEdit is defined
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
                        } // Ensure handleEdit is defined
                      />
                    </td>
                    <td>
                      {isNaN(Number(allocation.amount_per_person))
                        ? "-"
                        : Number(allocation.amount_per_person).toFixed(2)}
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
      </ProtectedRoute>
    </div>
  );
}
