"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  signUpAction,
  type AuthActionState,
} from "../lib/auth-actions";

const initialState: AuthActionState = {};

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  return (
    <form className="fh-auth-form" action={formAction}>
      <label className="fh-auth-field">
        <span>Nombre (opcional)</span>
        <input
          type="text"
          name="displayName"
          autoComplete="name"
          placeholder="Cómo te llamamos"
        />
      </label>

      <label className="fh-auth-field">
        <span>Correo electrónico</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="tu@correo.com"
        />
      </label>

      <label className="fh-auth-field">
        <span>Contraseña</span>
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={6}
        />
      </label>

      <label className="fh-auth-field">
        <span>Repetir contraseña</span>
        <input
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          required
          minLength={6}
        />
      </label>

      {state.error ? (
        <p className="fh-auth-message fh-auth-message-error" role="alert">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="fh-auth-message fh-auth-message-success" role="status">
          {state.success}
        </p>
      ) : null}

      <button
        type="submit"
        className="fh-btn fh-btn-primary fh-auth-submit"
        disabled={pending}
      >
        {pending ? "Creando cuenta…" : "Crear cuenta"}
      </button>

      <p className="fh-auth-switch">
        Al crear la cuenta aceptas la{" "}
        <Link href="/privacidad">política de privacidad</Link> y la{" "}
        <Link href="/cookies">política de cookies</Link>.
      </p>

      <p className="fh-auth-switch">
        ¿Ya tienes cuenta? <Link href="/entrar">Entra aquí</Link>
      </p>
    </form>
  );
}
