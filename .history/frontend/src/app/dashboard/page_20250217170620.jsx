import Budget from "../budget/page"; // นำเข้า Budget Page

export default function Dashboard() {
    return (
        <div>
            <h1>Dashboard</h1>
            <Budget />  {/* แสดง Budget ที่นำเข้า */}
        </div>
    );
}
