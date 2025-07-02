'use client';
import React from 'react'

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
      const onSave = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        const handleSubmit = async (e) => {
            e.preventDefault();
            try {
              const res = await fetch("http://localhost:5000/citizens", formData);
              console.log("เพิ่มข้อมูลสำเร็จ", res.data);
              alert("เพิ่มข้อมูลสำเร็จ");
            } catch (err) {
              console.error("เกิดข้อผิดพลาด", err);
              alert("เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
            }
          };
        
      };
  return (
    <div>
      <h2>เพิ่มข้อมูลประชาชน</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="fname" placeholder="ชื่อ" onChange={handleChange} required />
        <input type="text" name="lname" placeholder="นามสกุล" onChange={handleChange} required />
        <input type="text" name="national_id" placeholder="เลขบัตรประชาชน" onChange={handleChange} required />
        <input type="date" name="birth_date" onChange={handleChange} required />
        <input type="number" name="age" placeholder="อายุ" onChange={handleChange} required />
        <input type="number" name="income" placeholder="รายได้" onChange={handleChange} required />
        <input type="text" name="occupation" placeholder="อาชีพ" onChange={handleChange} required />
        <input type="number" name="target_group_id" placeholder="กลุ่มเป้าหมาย" onChange={handleChange} required />
        <button type="submit">เพิ่มข้อมูล</button>
      </form>
    </div>

  )
}
