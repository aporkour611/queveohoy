import "../futbolhoy-shell.css";
import "../destacados.css";
import "../champions-week.css";

const feedCriticalCss = `
.qvh-spotlight-visual{position:relative;height:132px;overflow:hidden}
.qvh-destacados-stack{min-height:200px}
.qvh-home-feed-slot{min-height:420px}
`.trim();

export default function FeedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: feedCriticalCss }} />
      {children}
    </>
  );
}
