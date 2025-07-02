"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
    const [admin, setAdmin] = useState({
        fname: "",
        lname: "",
        national_id: "",
        birth_date: "",
        income: "",
        occupation: ""
    });
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        fetchAdminData();
    }, []);

    // ดึงข้อมูล admin จาก API
    const fetchAdminData = async () => {
        try {
            const response = await fetch("http://localhost:5000/admin/get/3", {
                method: "GET",
                headers: {
                    Authorization: "Bearer 042545"
                },
            });

            const data = await response.json();
            setAdmin(data);
        } catch (error) {
            console.error("Error fetching admin data:", error);
        }
    };

    // ส่งข้อมูลที่แก้ไขแล้ว
    const handleUpdate = async () => {
        if (
            !admin.fname.trim() ||
            !admin.lname.trim() ||
            !admin.national_id.trim() ||
            !admin.birth_date.trim() ||
            !admin.income ||
            !admin.occupation.trim()
        ) {
            alert("Please fill in all fields.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/admin/update/3", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer 042545"
                },
                body: JSON.stringify(admin)
            });

            if (response.ok) {
                alert("Data updated successfully");
                setEditMode(false); // ยกเลิกการแก้ไข
                fetchAdminData(); // รีเฟรชข้อมูล
            } else {
                throw new Error("Failed to update data");
            }
        } catch (error) {
            alert(error.message);
        }
    };

    // การจัดการการเปลี่ยนแปลงค่าภายในฟอร์ม
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAdmin((prevAdmin) => ({
            ...prevAdmin,
            [name]: value
        }));
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

            {editMode ? (
                <div className="w-full max-w-md bg-white shadow-md p-6 rounded-lg">
                    <h2 className="text-xl font-semibold text-gray-600 mb-4">Edit Admin Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-700">First Name</label>
                            <input
                                type="text"
                                name="fname"
                                value={admin.fname}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700">Last Name</label>
                            <input
                                type="text"
                                name="lname"
                                value={admin.lname}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700">National ID</label>
                            <input
                                type="text"
                                name="national_id"
                                value={admin.national_id}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700">Birth Date</label>
                            <input
                                type="date"
                                name="birth_date"
                                value={admin.birth_date}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700">Income</label>
                            <input
                                type="number"
                                name="income"
                                value={admin.income}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700">Occupation</label>
                            <input
                                type="text"
                                name="occupation"
                                value={admin.occupation}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div className="mt-4 flex gap-4 justify-center">
                            <button
                                onClick={handleUpdate}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={() => setEditMode(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-md bg-white shadow-md p-6 rounded-lg">
                    <h2 className="text-xl font-semibold text-gray-600 mb-4">Admin Information</h2>
                    <div className="space-y-4">
                        <div>
                            <p><strong>First Name:</strong> {admin.fname}</p>
                            <p><strong>Last Name:</strong> {admin.lname}</p>
                            <p><strong>National ID:</strong> {admin.national_id}</p>
                            <p><strong>Birth Date:</strong> {admin.birth_date}</p>
                            <p><strong>Income:</strong> {admin.income}</p>
                            <p><strong>Occupation:</strong> {admin.occupation}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setEditMode(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4"
                    >
                        Edit Information
                    </button>
                </div>
            )}
        </div>
    );
}
