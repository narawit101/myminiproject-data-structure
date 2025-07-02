import React from "react";
import Register from "../components/Register";
import Nav from "../components/Nav";

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* เมนูนำทาง */}
      <Nav />
      
      <main className="flex-1 flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-center text-gray-900">
            ลงทะเบียนบัญชีใหม่
          </h2>
          <Register />
        </div>
      </main>
      
      {/* Footer หรือ อะไรก็ตาม */}
      <footer className="bg-gray-800 text-white py-4 text-center">
        <p>© 2025 Your Company. All rights reserved.</p>
      </footer>
    </div>
  );
}
