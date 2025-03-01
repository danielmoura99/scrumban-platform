//app/(dashboard)/dashboard/_components/DashboardStats.tsx

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatsProps = {
  boardCount: number;
  taskCount: number;
  sprintCount: number;
};

export default function DashboardStats({
  boardCount,
  taskCount,
  sprintCount,
}: StatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Quadros Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{boardCount}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Tarefas Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{taskCount}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Sprints Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{sprintCount}</div>
        </CardContent>
      </Card>
    </div>
  );
}
