//app/(dashboard)/teams/loading.tsx

import { Card, CardContent } from "@/components/ui/card";

export default function TeamsLoading() {
  return (
    <div className="p-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="h-9 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card para criar nova equipe */}
        <Card className="h-40 animate-pulse bg-gray-50 border-dashed">
          <CardContent className="flex items-center justify-center h-full">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </CardContent>
        </Card>

        {/* Skeletons para equipes existentes */}
        {[...Array(5)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-5 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
