export default function Unauthorized() {
    return (
        <div className="text-center">
            <h1 className="text-red-500 text-3xl font-bold">Access Denied</h1>
            <p>You do not have permission to access this page.</p>
            <a href="/login" className="text-blue-500 underline">Go to Login</a>
        </div>
    );
}
