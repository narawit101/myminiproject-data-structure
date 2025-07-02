'use client'
import { useEffect, useState } from "react";

const AllocationDetails = ({ budgetId }) => {
  const [allocations, setAllocations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllocations = async () => {
      try {
        const response = await fetch(`http://localhost:5000/allocations/get/${budgetId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch allocation data");
        }
        const data = await response.json();
        setAllocations(data.allocations); // Assuming the response has a "allocations" key
      } catch (err) {
        setError(err.message);
      }
    };

    if (budgetId) {
      fetchAllocations();
    }
  }, [budgetId]);

  return (
    <div>
      <h2>Allocation Details for Budget ID: {budgetId}</h2>
      {error && <div className="error">{error}</div>}
      <table className="table">
        <thead>
          <tr>
            <th>Target Group</th>
            <th>Allocation Percentage</th>
            <th>Allocated Amount</th>
            <th>Remaining Budget</th>
          </tr>
        </thead>
        <tbody>
          {allocations.map((allocation) => (
            <tr key={allocation.target_group}>
              <td>{allocation.target_group}</td>
              <td>{allocation.allocation_percentage}%</td>
              <td>{allocation.allocated_amount}</td>
              <td>{allocation.remaining_budget}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllocationDetails;
