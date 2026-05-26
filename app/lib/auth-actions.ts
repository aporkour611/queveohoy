"use server";

import { redirect } from "next/navigation";
import { notifyAdminNewSignup } from "./admin-notify";
import { createClient } from "./supabase/server";

export type AuthActionState = {
  error?: string;
  success?: string;
};

function siteOrigin() {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://queveohoy.es";
}

function authErrorMessage(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "Correo o contraseña incorrectos.";
  }
  if (lower.includes("user already registered")) {
    return "Ya existe una cuenta con ese correo.";
  }
  if (lower.includes("password should be at least")) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }
  if (lower.includes("unable to validate email")) {
    return "Introduce un correo válido.";
  }
  return "No se pudo completar la operación. Inténtalo de nuevo.";
}

export async function signInAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = String(formData.get("next") ?? "/cuenta").trim() || "/cuenta";

  if (!email || !password) {
    return { error: "Introduce correo y contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: authErrorMessage(error.message) };
  }

  redirect(nextPath.startsWith("/") ? nextPath : "/cuenta");
}

export async function signUpAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const displayName = String(formData.get("displayName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!email || !password) {
    return { error: "Introduce correo y contraseña." };
  }
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }
  if (password !== confirm) {
    return { error: "Las contraseñas no coinciden." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName || email.split("@")[0],
      },
      emailRedirectTo: `${siteOrigin()}/auth/callback?next=/cuenta`,
    },
  });

  if (error) {
    return { error: authErrorMessage(error.message) };
  }

  const display = displayName || email.split("@")[0];
  void notifyAdminNewSignup({
    email,
    displayName: display,
    confirmedImmediately: Boolean(data.session),
  });

  if (data.session) {
    redirect("/cuenta");
  }

  return {
    success:
      "Cuenta creada. Revisa tu correo para confirmar el registro e inicia sesión.",
  };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
