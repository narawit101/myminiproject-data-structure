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
    e.preventDefault(); // ป้องกันรีเฟรชหน้า
    console.log("กำลังส่งข้อมูล:", formData);

    try {
      const res = await fetch("http://localhost:5000/citizens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          age: Number(formData.age),
          income: Number(formData.income),
          target_group_id: Number(formData.target_group_id),
        }),
      });

      if (res.ok) {
        console.log("เพิ่มข้อมูลสำเร็จ");
        alert("เพิ่มข้อมูลสำเร็จ!");

        // ✅ รีเซ็ตค่าในฟอร์ม
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
      } else {
        console.error("เกิดข้อผิดพลาด");
        alert("เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
      }
    } catch (err) {
      console.error("เกิดข้อผิดพลาด", err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ API");
    }
  };

  return (
    <div>
      <h2>เพิ่มข้อมูลประชาชน</h2>
      <form onSubmit={onSubmit}>  {/* ✅ ใช้ `onSubmit` */}
        <div><input type="text" name="fname" placeholder="ชื่อ" value={formData.fname} onChange={onChange} required /></div>
        <div><input type="text" name="lname" placeholder="นามสกุล" value={formData.lname} onChange={onChange} required /></div>
        <div><input type="text" name="national_id" placeholder="เลขบัตรประชาชน" value={formData.national_id} onChange={onChange} required /></div>
        <div><input type="date" name="birth_date" value={formData.birth_date} onChange={onChange} required /></div>
        <div><input type="number" name="age" placeholder="อายุ" value={formData.age} onChange={onChange} required /></div>
        <div><input type="number" name="income" placeholder="รายได้" value={formData.income} onChange={onChange} required /></div>
        <div><input type="text" name="occupation" placeholder="อาชีพ" value={formData.occupation} onChange={onChange} required /></div>
        <div><input type="number" name="target_group_id" placeholder="กลุ่มเป้าหมาย" value={formData.target_group_id} onChange={onChange} required /></div>
        <button type="submit">เพิ่มข้อมูล</button>
      </form>
    </div>
  );
}
