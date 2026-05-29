import "../futbolhoy-shell.css";
import "../destacados.css";
import "../champions-week.css";
import "../roland-garros.css";
import "../basket-duel.css";
import "../home-feed-ssr.css";
import "../event-stamp.css";
const feedCriticalCss = `
.qvh-spotlight-visual{position:relative;height:132px;overflow:hidden}
.qvh-spotlight-cover{position:absolute;inset:0;overflow:hidden}
.qvh-spotlight-cover-poster .qvh-spotlight-cover-img,.qvh-spotlight-cover-poster .qvh-remote-poster-img{width:100%;height:100%;object-fit:cover;object-position:center top;display:block}
.qvh-media-card-poster{position:relative;aspect-ratio:2/3;overflow:hidden}
.qvh-media-card-poster-spotlight{aspect-ratio:auto;height:132px}
.qvh-destacados-stack{min-height:200px}
.qvh-cl-week-shell{min-height:min(720px,88vh)}
@media (min-width:768px){.qvh-cl-week-shell{min-height:480px}}
@media (max-width:767px){
.qvh-cl-week-shell{display:flex;flex-direction:column}
.qvh-cl-week-hero{order:2}
.qvh-destacados-static.qvh-cl-week-destacados{order:1}
.qvh-cl-week-matchup,.qvh-cl-week-hero-detail{display:none}
}
.qvh-home-feed-slot{min-height:420px}
.qvh-spotlight-card{display:block;color:inherit;text-decoration:none}
.qvh-destacados-page-static{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
@media (max-width:768px){.qvh-destacados-page-static{grid-template-columns:1fr}}
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
