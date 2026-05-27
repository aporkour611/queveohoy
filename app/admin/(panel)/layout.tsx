import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isAdminCookieValid } from "@/app/lib/admin-auth";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jar = await cookies();
  const cookie = jar.get(ADMIN_COOKIE)?.value;

  if (!isAdminCookieValid(cookie)) {
    redirect("/admin/login");
  }

  return children;
}
