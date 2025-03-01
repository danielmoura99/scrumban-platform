//app/(dashboard)/dashboard/_components/RecentActivity.tsx

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Activity = {
  id: string;
  description: string;
  timestamp: string;
};

type RecentActivityProps = {
  activities: Activity[];
};

export default function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="border-b pb-2">
              <div className="font-medium">{activity.description}</div>
              <div className="text-sm text-gray-500">{activity.timestamp}</div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            Nenhuma atividade recente
          </div>
        )}
      </CardContent>
    </Card>
  );
}
