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
  if (lower.includes("database error saving new user")) {
    return "Error al crear la cuenta en la base de datos. Falta ejecutar la migración de perfiles en Supabase.";
  }
  if (
    lower.includes("error sending confirmation email") ||
    lower.includes("over_email_send_rate_limit") ||
    lower.includes("email rate limit")
  ) {
    return "No se pudo enviar el correo de confirmación. Espera unos minutos e inténtalo de nuevo.";
  }
  if (lower.includes("signup") && lower.includes("disabled")) {
    return "El registro está desactivado en este momento.";
  }
  if (lower.includes("redirect") && lower.includes("url")) {
    return "Configuración de registro incorrecta (URL de retorno). Revisa Supabase → Authentication → URL Configuration.";
  }

  return `No se pudo completar la operación. (${message})`;
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

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { error: authErrorMessage(error.message) };
    }
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? authErrorMessage(error.message)
          : "No se pudo iniciar sesión.",
    };
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

  let redirectTo: string | null = null;

  try {
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
      redirectTo = "/cuenta";
    } else {
      return {
        success:
          "Cuenta creada. Revisa tu correo para confirmar el registro e inicia sesión.",
      };
    }
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? authErrorMessage(error.message)
          : "No se pudo crear la cuenta.",
    };
  }

  if (redirectTo) redirect(redirectTo);
  return { error: "No se pudo crear la cuenta." };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
