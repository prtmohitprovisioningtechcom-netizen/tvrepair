import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth/session";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionFromCookies();
  if (!user) redirect("/admin/login");
  return <AdminShell user={user}>{children}</AdminShell>;
}
