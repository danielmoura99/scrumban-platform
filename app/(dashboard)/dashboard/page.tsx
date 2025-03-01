//app/(dashboard)/dashboard/page.tsx

import DashboardStats from "./_components/DashboardStats";
import RecentActivity from "./_components/RecentActivity";
import RecentBoards from "./_components/RecentBoards";
import {
  getDashboardStats,
  getRecentActivities,
  getRecentBoards,
} from "./_actions/dashboard-actions";

export default async function DashboardPage() {
  const { boardCount, taskCount, sprintCount } = await getDashboardStats();
  const activities = await getRecentActivities();
  const boards = await getRecentBoards();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <DashboardStats
        boardCount={boardCount}
        taskCount={taskCount}
        sprintCount={sprintCount}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentActivity activities={activities} />
        <RecentBoards boards={boards} />
      </div>
    </div>
  );
}
