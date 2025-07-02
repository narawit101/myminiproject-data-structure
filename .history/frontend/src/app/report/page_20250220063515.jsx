import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from the API on page load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/get");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{`Error: ${error}`}</p>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-semibold mb-6">Budget Allocation Report</h1>

      {/* Total Budget Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Total Budget Information</h2>
        <p>
          <span className="font-bold">Total Budget:</span>{" "}
          <span>{data.total_budget}</span>
        </p>
        <p>
          <span className="font-bold">Remaining Budget:</span>{" "}
          <span>{data.total_remaining_budget}</span>
        </p>
      </div>

      {/* Allocation Table */}
      <h2 className="text-2xl font-semibold mb-4">Allocation Details</h2>
      <table className="min-w-full table-auto border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 border-b">Budget ID</th>
            <th className="px-4 py-2 border-b">Budget Name</th>
            <th className="px-4 py-2 border-b">Group Name</th>
            <th className="px-4 py-2 border-b">Allocated Amount</th>
            <th className="px-4 py-2 border-b">Remaining Budget</th>
            <th className="px-4 py-2 border-b">Received Count</th>
            <th className="px-4 py-2 border-b">Pending Count</th>
            <th className="px-4 py-2 border-b">Total Citizens</th>
          </tr>
        </thead>
        <tbody>
          {data.groups.map((group, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-2 border-b">{group.budget_id}</td>
              <td className="px-4 py-2 border-b">{group.budget_name}</td>
              <td className="px-4 py-2 border-b">{group.group_name}</td>
              <td className="px-4 py-2 border-b">{parseFloat(group.allocated_amount).toFixed(2)}</td>
              <td className="px-4 py-2 border-b">{parseFloat(group.remaining_budget).toFixed(2)}</td>
              <td className="px-4 py-2 border-b">{group.received_count}</td>
              <td className="px-4 py-2 border-b">{group.pending_count}</td>
              <td className="px-4 py-2 border-b">{group.total_citizens}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
