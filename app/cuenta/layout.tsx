import { redirect } from "next/navigation";
import { AccountShell } from "../components/AccountShell";
import { createClient } from "../lib/supabase/server";

export default async function CuentaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar?next=/cuenta");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    profile?.display_name ??
    user.user_metadata?.display_name ??
    user.email?.split("@")[0] ??
    "Usuario";

  return (
    <AccountShell displayName={displayName} email={user.email}>
      {children}
    </AccountShell>
  );
}
