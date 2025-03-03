//app/(dashboard)/layout.tsx

import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">ScrumbanPro</span>
          </div>
          <nav className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900"
            >
              Dashboard
            </Link>
            <Link href="/boards" className="text-gray-600 hover:text-gray-900">
              Quadros
            </Link>
            <Link href="/teams" className="text-gray-600 hover:text-gray-900">
              Equipes
            </Link>
            <Link href="/sprints" className="text-gray-600 hover:text-gray-900">
              Sprints
            </Link>
            <Link href="/users" className="text-gray-600 hover:text-gray-900">
              Usuários
            </Link>
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium">US</span>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
