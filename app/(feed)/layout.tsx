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
.qvh-cl-week-shell{min-height:min(720px,88vh);max-width:100%;min-width:0}
@media (min-width:768px){.qvh-cl-week-shell{min-height:480px}}
@media (max-width:767px){
.qvh-cl-week-matchup,.qvh-cl-week-hero-detail{display:none}
.qvh-cl-week-hero-titleline{flex-wrap:nowrap;align-items:baseline}
.qvh-cl-week-kicker,.qvh-cl-week-headline{white-space:nowrap}
}
.qvh-home-feed-slot{min-height:420px}
.qvh-spotlight-card{display:block;color:inherit;text-decoration:none}
.qvh-destacados-page-static{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;touch-action:pan-x;padding-bottom:8px}
.qvh-destacados-page-static::-webkit-scrollbar{display:none}
.qvh-destacados-page-static .qvh-spotlight-card{flex:0 0 min(236px,72vw);scroll-snap-align:start}
@media (min-width:769px){
.qvh-destacados-page-static{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));overflow-x:visible;scroll-snap-type:none;touch-action:auto;padding-bottom:0}
.qvh-destacados-page-static .qvh-spotlight-card{flex:initial;scroll-snap-align:none}
}
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
