import { NextResponse } from "next/server";

export function middleware(req) {
    const token = req.cookies.get("token")?.value || "";

    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url)); // ถ้าไม่มี Token ให้ Redirect ไปหน้า Login
    }

    try {
        const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT (ง่าย ๆ ไม่ต้องใช้ไลบรารี)
        
        if (payload.role !== "admin") { 
            return NextResponse.redirect(new URL("/unauthorized", req.url)); // ถ้าไม่ใช่ Admin ให้ Redirect
        }
    } catch (error) {
        return NextResponse.redirect(new URL("/login", req.url)); // Token ผิดพลาด
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"], // Middleware ใช้กับเส้นทาง Dashboard เท่านั้น
};
