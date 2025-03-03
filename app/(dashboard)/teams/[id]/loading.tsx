//app/(dashboard)/teams/[id]/loading.tsx

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TeamDetailLoading() {
  return (
    <div className="p-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="h-9 w-16 bg-gray-200 rounded mr-2 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-9 w-9 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Description Skeleton */}
      <div className="mb-6 bg-gray-50 p-4 rounded-md">
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mt-2 animate-pulse"></div>
      </div>

      {/* Tabs Skeleton */}
      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview" className="animate-pulse">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="members" className="animate-pulse">
            Membros
          </TabsTrigger>
          <TabsTrigger value="boards" className="animate-pulse">
            Quadros
          </TabsTrigger>
        </TabsList>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Stats Card Skeleton */}
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="h-6 w-6 bg-gray-200 rounded-full mx-auto mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
              </div>
              <div className="bg-green-50 p-4 rounded-md">
                <div className="h-6 w-6 bg-gray-200 rounded-full mx-auto mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
              </div>
            </CardContent>
          </Card>

          {/* Info Card Skeleton */}
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-1"></div>
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-1"></div>
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  );
}
