import { AuthPageShell } from "../components/AuthPageShell";
import { SignInForm } from "../components/SignInForm";

export const metadata = {
  title: "Entrar — queveohoy.es",
  description: "Inicia sesión en tu cuenta de queveohoy.es",
};

type Props = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function EntrarPage({ searchParams }: Props) {
  const params = await searchParams;
  const nextPath = params.next?.startsWith("/") ? params.next : "/cuenta";
  const authError = params.error === "auth";

  return (
    <AuthPageShell title="Entrar">
      <p className="fh-auth-lead">
        Accede a tu cuenta para guardar favoritos y personalizar tu experiencia.
      </p>
      {authError ? (
        <p className="fh-auth-message fh-auth-message-error" role="alert">
          No se pudo completar el acceso. Inténtalo de nuevo.
        </p>
      ) : null}
      <SignInForm nextPath={nextPath} />
    </AuthPageShell>
  );
}
