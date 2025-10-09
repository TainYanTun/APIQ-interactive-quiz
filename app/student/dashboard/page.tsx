import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function StudentDashboard() {
  const user = await getSession();
  if (!user) {
    return redirect("/join");
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold">Welcome, {user.studentId}</h1>
        <p className="text-gray-700 mt-2">
          You have successfully joined the session.
        </p>
        <p className="text-gray-600">
          Quiz Session ID:{" "}
          <span className="font-mono bg-gray-200 px-2 py-1 rounded">
            {user.quizSessionId}
          </span>
        </p>
      </div>
    </div>
  );
}
