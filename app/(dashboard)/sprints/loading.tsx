import { Card, CardContent } from "@/components/ui/card";

export default function SprintsLoading() {
  return (
    <div className="p-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="h-9 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>

      {/* Active Sprints Heading */}
      <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>

      {/* Active Sprints Grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Planned Sprints Heading */}
      <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>

      {/* Planned Sprints Card */}
      <Card className="animate-pulse mb-8">
        <CardContent className="h-24 flex items-center justify-center">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
        </CardContent>
      </Card>

      {/* Completed Sprints Heading */}
      <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>

      {/* Completed Sprints Grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-gray-50">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
