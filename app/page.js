import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default function Home() {
  return (
    <ProtectedRoute>
      <DashboardShell />
     </ProtectedRoute>
  );
}
