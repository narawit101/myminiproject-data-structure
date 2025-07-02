"use client";
import { useState } from "react";

export default function UpdateCitizen() {
    const [nationalId, setNationalId] = useState("");
    const [citizenData, setCitizenData] = useState(null);
    const [fname, setFname] = useState("");
    const [lname, setLname] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [income, setIncome] = useState("");
    const [occupation, setOccupation] = useState("");

    const handleSearch = async () => {
        try {
            const response = await fetch(`http://localhost:5000/admin/getByNationalId/${nationalId}`);
            if (response.ok) {
                const data = await response.json();
                setCitizenData(data);
                setFname(data.fname);
                setLname(data.lname);
                setBirthDate(data.birth_date);
                setIncome(data.income);
                setOccupation(data.occupation);
            } else {
                alert("ไม่พบข้อมูลประชาชน");
            }
        } catch (error) {
            console.error("Error fetching citizen data:", error);
            alert("เกิดข้อผิดพลาดในการค้นหาข้อมูล");
        }
    };

    const handleUpdate = async () => {
        const updatedData = {
            fname,
            lname,
            national_id: nationalId,
            birth_date: birthDate,
            income,
            occupation,
        };

        try {
            const response = await fetch(`http://localhost:5000/admin/update/${nationalId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedData),
            });

            if (response.ok) {
                const result = await response.json();
                alert(result.message);
            } else {
                alert("ไม่สามารถอัปเดตข้อมูลได้");
            }
        } catch (error) {
            console.error("Error updating citizen data:", error);
            alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Update Citizen Information</h1>

            {/* ฟอร์มกรอกเลขบัตรประชาชน */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="กรอกเลขบัตรประชาชน"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    className="p-2 border rounded"
                />
                <button
                    onClick={handleSearch}
                    className="bg-blue-500 text-white px-3 py-1 rounded ml-2"
                >
                    ค้นหา
                </button>
            </div>

            {/* แสดงข้อมูลที่สามารถแก้ไขได้ */}
            {citizenData && (
                <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-600 mb-4">ข้อมูลประชาชน</h2>

                    <div className="mb-4">
                        <label>ชื่อ:</label>
                        <input
                            type="text"
                            value={fname}
                            onChange={(e) => setFname(e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div className="mb-4">
                        <label>นามสกุล:</label>
                        <input
                            type="text"
                            value={lname}
                            onChange={(e) => setLname(e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div className="mb-4">
                        <label>วันเกิด:</label>
                        <input
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div className="mb-4">
                        <label>รายได้:</label>
                        <input
                            type="number"
                            value={income}
                            onChange={(e) => setIncome(e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div className="mb-4">
                        <label>อาชีพ:</label>
                        <input
                            type="text"
                            value={occupation}
                            onChange={(e) => setOccupation(e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <button
                        onClick={handleUpdate}
                        className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                        อัปเดตข้อมูล
                    </button>
                </div>
            )}
        </div>
    );
}
