"use client";
import React, { useState } from "react";

export default function Register() {
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    national_id: "",
    birth_date: "",
    income: "",
    occupation: "",
  });

  const [age, setAge] = useState("");

  const calculateAge = (birthDate) => {
    if (!birthDate) return "";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "birth_date") {
      setAge(calculateAge(value));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
  
    // 🔍 ดูข้อมูลที่กำลังจะถูกส่ง
    console.log("📤 Sending data:", formData);
  
    try {
      const res = await fetch("http://localhost:5000/citizens/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, income: Number(formData.income) }),
      });
  
      const data = await res.json();
      console.log("📥 API Response:", data);
  
      if (res.ok) {
        alert("เพิ่มข้อมูลสำเร็จ!");
        setFormData({
          fname: "",
          lname: "",
          national_id: "",
          birth_date: "",
          income: "",
          occupation: "",
        });
        setAge("");
      } else {
        alert(`เกิดข้อผิดพลาด: ${data.message || "ไม่สามารถเพิ่มข้อมูลได้"}`);
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ API");
    }
  };
  

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center">ลงทะเบียน</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            name="fname"
            placeholder="ชื่อ"
            value={formData.fname}
            onChange={onChange}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="lname"
            placeholder="นามสกุล"
            value={formData.lname}
            onChange={onChange}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="national_id"
            placeholder="เลขบัตรประชาชน"
            value={formData.national_id}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              if (value.length <= 13) {
                setFormData({ ...formData, national_id: value });
              }
            }}
            maxLength={13}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="date"
            name="birth_date"
            value={formData.birth_date}
            onChange={onChange}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            value={age}
            placeholder="อายุ"
            readOnly
            className="w-full p-2 border rounded bg-gray-200"
          />
          <input
            type="number"
            name="income"
            placeholder="รายได้"
            value={formData.income}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value > 0) {
                setFormData({ ...formData, income: value });
              } else {
                setFormData({ ...formData, income: "" });
              }
            }}
            min="1"
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="occupation"
            placeholder="อาชีพ"
            value={formData.occupation}
            onChange={onChange}
            required
            className="w-full p-2 border rounded"
          />
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            เพิ่มข้อมูล
          </button>
        </form>
      </div>
    </div>
  );
}
