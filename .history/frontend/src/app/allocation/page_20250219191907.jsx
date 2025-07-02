"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute"; // Import ProtectedRoute

export default function BudgetAllocation() {
  const [allocations, setAllocations] = useState({}); // Group by budget_id
  const [editedAllocations, setEditedAllocations] = useState({});

  // ✅ Fetch all data from the API
  useEffect(() => {
    fetch("http://localhost:5000/allocation/get")
      .then((res) => res.json())
      .then((data) => {
        // ✅ Group data by budget_id
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

  // ✅ Edit allocation_percentage or max_recipients
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

    // ✅ Retrieve allocation_percentage and max_recipients
    let allocationPercentage =
      Number(
        editedAllocations[`${budgetId}-${index}`]?.allocation_percentage
      ) ||
      Number(allocations[budgetId].allocations[index].allocation_percentage);

    let maxRecipients =
      Number(editedAllocations[`${budgetId}-${index}`]?.max_recipients) ||
      Number(allocations[budgetId].allocations[index].max_recipients);

    // 🔴 Check if the total allocation_percentage exceeds 100%
    const totalPercentage = allocations[budgetId].allocations.reduce(
      (sum, item, i) => {
        const itemPercentage =
          i === index
            ? allocationPercentage // Use the edited value
            : Number(item.allocation_percentage); // Use the current value
        return sum + itemPercentage;
      },
      0
    );

    if (totalPercentage > 100) {
      alert(
        `❌ Total allocation percentage exceeds 100%! (Currently ${totalPercentage}%)\nPlease adjust the values.`
      );
      return;
    }

    // ✅ Check for NaN or Undefined values
    if (isNaN(allocationPercentage) || isNaN(maxRecipients)) {
      console.error("❌ NaN or undefined value detected");
      return;
    }

    const updatedData = {
      budget_id: Number(budgetId), // ✅ Convert to number
      target_group_id: Number(targetGroupId), // ✅ Convert to number
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

        // ✅ Reload the page to fetch the latest data
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
          Budget Allocation
        </h2>
        {Object.keys(allocations).map((budgetId) => (
          <div key={budgetId} className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Project: {allocations[budgetId].project_name}
            </h3>
            <table className="min-w-full table-auto bg-white shadow-md rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-blue-500 text-white">
                  <th className="py-2 px-4 text-left">Target Group</th>
                  <th className="py-2 px-4 text-left">Allocation (%)</th>
                  <th className="py-2 px-4 text-left">Total Amount</th>
                  <th className="py-2 px-4 text-left">Max Recipients</th>
                  <th className="py-2 px-4 text-left">Amount Per Person</th>
                  <th className="py-2 px-4 text-left">Manage</th>
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
                      {isNaN(Number(allocation.allocated_amount))
                        ? "-"
                        : `${Number(
                            allocation.allocated_amount
                          ).toLocaleString()} Baht`}{" "}
                      {/* Add "Baht" currency */}
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
                    <td className="py-2 px-4">
                      {isNaN(Number(allocation.amount_per_person))
                        ? "-"
                        : `${Number(
                            allocation.amount_per_person
                          ).toLocaleString()} Baht`}{" "}
                      {/* Add "Baht" currency */}
                    </td>
                    <td className="py-2 px-4">
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                        onClick={() => handleSave(budgetId, index)}
                      >
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
