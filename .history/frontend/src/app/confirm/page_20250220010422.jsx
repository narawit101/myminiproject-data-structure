import React from "react";
import Navbar from "../components/Nav";
import ProtectedRoute from "../components/ProtectedRoute";

export default function page() {
  return (
    <>
      <ProtectedRoute>
        <Navbar />
      </ProtectedRoute>
    </>
  );
}
