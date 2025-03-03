//app/(dashboard)/users/loading.tsx

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function UsersLoading() {
  return (
    <div className="p-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="h-9 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>

      <Card className="mb-6 animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-48"></div>
        </CardHeader>
        <CardContent>
          {/* Search Box Skeleton */}
          <div className="h-9 bg-gray-200 rounded w-full mb-4"></div>

          {/* Table Skeleton */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </TableHead>
                  <TableHead className="w-[300px]">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </TableHead>
                  <TableHead>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-40"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-200 rounded w-48"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-5 bg-gray-200 rounded w-16"></div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="h-8 w-8 bg-gray-200 rounded ml-auto"></div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
