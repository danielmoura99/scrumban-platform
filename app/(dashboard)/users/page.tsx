// app/(dashboard)/users/page.tsx
import { getAllUsers } from "./_actions/user-actions";
import UsersClient from "./_components/UsersClient";

export default async function UsersPage() {
  // Carregar dados diretamente no servidor
  const users = await getAllUsers();

  return (
    <div className="p-6">
      <UsersClient users={users} />
    </div>
  );
}
