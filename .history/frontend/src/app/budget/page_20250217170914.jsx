"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
    const [budgets, setBudgets] = useState([]);

    useEffect(() => {
        const fetchBudgets = async () => {
            try {
                const response = await axios.get("http://localhost:5000/budget/get", {
                    headers: {
                        Authorization: "Bearer 042545", // ใช้ token เหมือนใน Postman
                    },
                });
                setBudgets(response.data); // อัปเดต state
            } catch (error) {
                console.error("Error fetching budget data:", error);
            }
        };

        fetchBudgets();
    }, []);

    return (
        <div>
            <h1>Dashboard</h1>
            <h2>Budget Data</h2>
            <table border="1">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Year</th>
                        <th>Project Name</th>
                        <th>Total Budget</th>
                        <th>Updated At</th>
                    </tr>
                </thead>
                <tbody>
                    {budgets.map((budget) => (
                        <tr key={budget.id}>
                            <td>{budget.id}</td>
                            <td>{budget.year}</td>
                            <td>{budget.project_name}</td>
                            <td>{budget.total_budget}</td>
                            <td>{new Date(budget.updated_at).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
