'use client';
import React, { useState } from 'react';

export default function Register() {
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    national_id: "",
    birth_date: "",
    age: "",
    income: "",
    occupation: "",
    target_group_id: ""
  });

  // ฟังก์ชันอัปเดตค่าในฟอร์ม
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ฟังก์ชันส่งข้อมูลไปยัง API
  const onSubmit = async (e) => {
    e.preventDefault();

    // ตรวจสอบค่า และแปลงค่าให้ถูกต้อง
    const dataToSend = {
      ...formData,
      age: Number(formData.age),
      income: Number(formData.income),
      target_group_id: Number(formData.target_group_id),
    };

    try {
      const res = await fetch("http://localhost:5000/citizens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      const result = await res.json();

      if (res.ok) {
        console.log("เพิ่มข้อมูลสำเร็จ", result);
        alert("เพิ่มข้อมูลสำเร็จ!");
      } else {
        console.error("เกิดข้อผิดพลาด:", result);
        alert("เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
      }
    } catch (err) {
      console.error("เกิดข้อผิดพลาด", err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ API");
    }
  };
  setFormData({
    fname: "",
    lname: "",
    national_id: "",
    birth_date: "",
    age: "",
    income: "",
    occupation: "",
    target_group_id: ""
  });

  return (
    <div>
      <h2>เพิ่มข้อมูลประชาชน</h2>
      <form onSubmit={onSubmit}>
        <div><input type="text" name="fname" placeholder="ชื่อ" onChange={onChange} required /></div>
        <div><input type="text" name="lname" placeholder="นามสกุล" onChange={onChange} required /></div>
        <div><input type="text" name="national_id" placeholder="เลขบัตรประชาชน" onChange={onChange} required /></div>
        <div><input type="date" name="birth_date" onChange={onChange} required /></div>
        <div><input type="number" name="age" placeholder="อายุ" onChange={onChange} required /></div>
        <div><input type="number" name="income" placeholder="รายได้" onChange={onChange} required /></div>
        <div><input type="text" name="occupation" placeholder="อาชีพ" onChange={onChange} required /></div>
        <div><input type="number" name="target_group_id" placeholder="กลุ่มเป้าหมาย" onChange={onChange} required /></div>
        <button type="submit">เพิ่มข้อมูล</button>
      </form>
    </div>
  );
}
