"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
    const [budgets, setBudgets] = useState([]);
    const [editProject, setEditProject] = useState(null);
    const [newYear, setNewYear] = useState("");
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
            console.log(" Budget Data After Update:", data);
            setBudgets(data);
        } catch (error) {
            console.error(" Error fetching budget data:", error);
        }
    };

    const handleEdit = async (id) => {
        if (!newProjectName.trim() || !newYear.trim() || newTotalBudget === undefined) return;

        console.log(" Sending Update Request:", {
            id,
            year: newYear,
            project_name: newProjectName,
            total_budget: parseFloat(newTotalBudget),
        });

        try {
            const response = await fetch(`http://localhost:5000/budget/update/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer 042545",
                },
                body: JSON.stringify({ 
                    year: parseInt(newYear), 
                    project_name: newProjectName, 
                    total_budget: parseFloat(newTotalBudget) 
                }),
            });

            const result = await response.json();
            console.log("Update Response:", result);

            if (!response.ok) {
                throw new Error(result.message || "Failed to update project");
            }

            setEditProject(null);
            setNewYear("");
            setNewProjectName("");
            setNewTotalBudget("");
            fetchBudgets();
        } catch (error) {
            console.error("Error updating project:", error);
            alert(error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this project?")) return;

        try {
            const response = await fetch(`http://localhost:5000/budget/delete/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: "Bearer 042545",
                },
            });

            const result = await response.json();
            console.log("Delete Response:", result);

            if (!response.ok) {
                throw new Error(result.message || "Failed to delete project");
            }

            fetchBudgets();
        } catch (error) {
            console.error("Error deleting project:", error);
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
                            <td>
                                {editProject === budget.id ? (
                                    <input
                                        type="number"
                                        value={newYear}
                                        onChange={(e) => setNewYear(e.target.value)}
                                    />
                                ) : (
                                    budget.year
                                )}
                            </td>
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
                                    <>
                                        <button onClick={() => handleEdit(budget.id)}>Save</button>
                                        <button onClick={() => setEditProject(null)}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => {
                                            setEditProject(budget.id);
                                            setNewYear(budget.year);
                                            setNewProjectName(budget.project_name);
                                            setNewTotalBudget(budget.total_budget);
                                        }}>Edit</button>
                                        <button onClick={() => handleDelete(budget.id)}>Delete</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
