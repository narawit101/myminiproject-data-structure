"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
    const [budgets, setBudgets] = useState([]);
    const [editProject, setEditProject] = useState(null);
    const [newProjectName, setNewProjectName] = useState("");
    const [newTotalBudget, setNewTotalBudget] = useState("");

    useEffect(() => {
        fetchBudgets();
    }, []);

    const fetchBudgets = async () => {
        try {
            const response = await fetch("http://localhost:5000/budget/get", {
                headers: { Authorization: "Bearer 042545" },
            });

            const data = await response.json();
            console.log("🔹 Budget Data After Update:", data);
            setBudgets(data);
        } catch (error) {
            console.error("❌ Error fetching budget data:", error);
        }
    };

    const handleEdit = async (id) => {
        if (!newProjectName.trim() || newTotalBudget === undefined) return;

        console.log("🔹 Sending Update Request:", {
            id,
            project_name: newProjectName,
            total_budget: newTotalBudget,
        });

        try {
            const response = await fetch(`http://localhost:5000/budget/update/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer 042545",
                },
                body: JSON.stringify({ 
                    project_name: newProjectName, 
                    total_budget: parseFloat(newTotalBudget) 
                }),
            });

            const result = await response.json();
            console.log("✅ Update Response:", result);

            if (!response.ok) {
                throw new Error(result.message || "Failed to update project");
            }

            setEditProject(null);
            setNewProjectName("");
            setNewTotalBudget("");
            fetchBudgets();
        } catch (error) {
            console.error("❌ Error updating project:", error);
            alert(error.message);
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
                            <td>
                                {editProject === budget.id ? (
                                    <input
                                        type="number"
                                        value={newTotalBudget}
                                        onChange={(e) => setNewTotalBudget(e.target.value)}
                                    />
                                ) : (
                                    budget.total_budget
                                )}
                            </td>
                            <td>
                                {editProject === budget.id ? (
                                    <button onClick={() => handleEdit(budget.id)}>Save</button>
                                ) : (
                                    <button onClick={() => {
                                        setEditProject(budget.id);
                                        setNewProjectName(budget.project_name);
                                        setNewTotalBudget(budget.total_budget);
                                    }}>Edit</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
