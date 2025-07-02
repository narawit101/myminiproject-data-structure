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
    <div>Hello World</div>

  )
}
