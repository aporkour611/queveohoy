import { AuthPageShell } from "../components/AuthPageShell";
import { SignUpForm } from "../components/SignUpForm";

export const metadata = {
  title: "Registro — queveohoy.es",
  description: "Crea tu cuenta en queveohoy.es",
};

export default function RegistroPage() {
  return (
    <AuthPageShell title="Crear cuenta">
      <p className="fh-auth-lead">
        Regístrate gratis. Más adelante podrás marcar eventos como favoritos.
      </p>
      <SignUpForm />
    </AuthPageShell>
  );
}
