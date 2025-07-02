"use client";
import { useEffect, useState } from "react";


export default function Dashboard() {
    const [budgets, setBudgets] = useState([]);

    useEffect(() => {
        const fetchBudgets = async () => {
            try {
                const response = await fetch("http://localhost:5000/budget/get", {
                    headers: {
                        Authorization: "Bearer 042545", // ใช้ token เหมือนใน Postman
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                console.log("Budget Data:", data); // ตรวจสอบข้อมูล API
                setBudgets(data);
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
                        <th>Year</th>
                        <th>Project Name</th>
                        <th>Total Budget</th>
                    </tr>
                </thead>
                <tbody>
                    {budgets.map((budget) => (
                        <tr key={budget.id}>
                            <td>{budget.year}</td>
                            <td>{budget.project_name}</td>
                            <td>{new Date(budget.updated_at).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
