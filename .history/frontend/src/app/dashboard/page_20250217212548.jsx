"use client";
import Navbar from "../components/Nav";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Budget from "../budget/page";
import Edit from "../edit/page";

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Budget />
      <div className="container mx-auto px-4 py-6 flex flex-col">
        <Edit />
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white p-2 rounded-md"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
