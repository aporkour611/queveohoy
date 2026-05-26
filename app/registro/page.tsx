import type { Metadata } from "next";
import { AuthPageShell } from "../components/AuthPageShell";
import { SignUpForm } from "../components/SignUpForm";

export const metadata: Metadata = {
  title: "Registro",
  description: "Crea tu cuenta en queveohoy.es",
  robots: { index: false, follow: false },
};

export default function RegistroPage() {
  return (
    <AuthPageShell title="Crear cuenta">
      <p className="fh-auth-lead">
        Regístrate gratis para guardar eventos en favoritos y verlos siempre en
        Destacados.
      </p>
      <SignUpForm />
    </AuthPageShell>
  );
}
