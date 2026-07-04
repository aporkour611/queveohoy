import "../site-shell.css";
import "../v5-features.css";
import { LayoutClientShell } from "../components/LayoutClientShell";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div id="site-shell">
      {children}
      <LayoutClientShell />
    </div>
  );
}
