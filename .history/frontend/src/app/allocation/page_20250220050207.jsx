"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute"; // Import ProtectedRoute

export default function BudgetAllocation() {
  const [allocations, setAllocations] = useState({});
  const [editedAllocations, setEditedAllocations] = useState({});

  // ✅ ดึงข้อมูลทั้งหมดจาก API
  useEffect(() => {
    fetch("http://localhost:5000/allocation/get")
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Data from API:", data);

        // ตรวจสอบว่า data เป็นอาร์เรย์
        if (!Array.isArray(data)) {
          console.error("❌ Error: API response is not an array", data);
          return;
        }

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
      .catch((err) => console.error("❌ Error fetching data:", err));
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

  // ✅ บันทึกข้อมูลที่แก้ไข
  const handleSave = (budgetId, index) => {
    const targetGroupId =
      allocations[budgetId]?.allocations[index]?.target_group_id;

    if (!targetGroupId) {
      console.error("❌ target_group_id is missing!");
      return;
    }

    // ✅ ดึงค่าที่แก้ไข หรือใช้ค่าปัจจุบัน
    let allocationPercentage =
      Number(
        editedAllocations[`${budgetId}-${index}`]?.allocation_percentage
      ) ||
      Number(allocations[budgetId].allocations[index].allocation_percentage);

    let maxRecipients =
      Number(editedAllocations[`${budgetId}-${index}`]?.max_recipients) ||
      Number(allocations[budgetId].allocations[index].max_recipients);

    // ✅ ตรวจสอบว่าสัดส่วนรวมไม่เกิน 100%
    const totalPercentage = allocations[budgetId].allocations.reduce(
      (sum, item, i) =>
        sum +
        (i === index
          ? allocationPercentage
          : Number(item.allocation_percentage)),
      0
    );

    if (totalPercentage > 100) {
      alert(`❌ การจัดสรรงบประมาณเกิน 100%! (ปัจจุบัน ${totalPercentage}%)`);
      return;
    }

    // ✅ ตรวจสอบค่าไม่เป็น NaN
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
    <div className="p-6 bg-gray-100">
      <ProtectedRoute>
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">
          การแบ่งงบประมาณ
        </h2>
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
                  <th className="py-2 px-4 text-left">
                    จำกัดผู้รับสิทธิ์ (คน)
                  </th>
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
                      {allocation.allocated_amount?.toLocaleString()} บาท
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                    <td className="py-2 px-4">{allocation.amount_per_person?.toLocaleString()} บาท</td>
                    <td className="py-2 px-4">
                      <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600" onClick={() => handleSave(budgetId, index)}>
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
