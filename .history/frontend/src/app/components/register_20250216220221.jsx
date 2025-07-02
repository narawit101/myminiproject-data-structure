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
      };
  return (
    <div>Hello World</div>

  )
}
