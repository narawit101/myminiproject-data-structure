"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Budget from "../budget/page";

export default function Dashboard() {
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token"); // ดึง Token จาก LocalStorage
        if (!token) {
            router.push("/login"); // ถ้าไม่มี Token ให้ Redirect ไป Login
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT
            if (payload.role === "admin") {
                setIsAdmin(true); // เป็น Admin ให้แสดง Dashboard
            } else {
                router.push("/Redirect"); // ไม่ใช่ Admin ให้ Redirect
            }
        } catch (error) {
            router.push("/login"); // Token ผิดพลาด ให้ Redirect ไป Login
        }
    }, []);

    if (!isAdmin) return null; // รอเช็ก Token ก่อนโหลดหน้า

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <Budget />
        </div>
    );
}
