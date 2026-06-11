/** CSS crítico above-the-fold (home): primer pintado antes del bundle completo. */

export const FEED_CRITICAL_CSS = `

html{overflow-anchor:none;background:#0a0a10}

.fh-body{font-family:Arial,Helvetica,sans-serif;font-size:16px;background:#0a0a10;color:#fff;margin:0;min-height:100vh}

.fh-content{background-color:#0a0a10;padding:var(--qvh-navbar-h,60px) 0 0;min-height:100vh;display:flex;flex-direction:column}

.fh-header-shell{position:sticky;top:0;z-index:40}

.fh-navbar{display:flex;align-items:center;min-height:var(--qvh-navbar-content-h,60px);background:#14141c;border-bottom:1px solid #2a2a38}

.fh-navbar-inner{display:flex;align-items:center;justify-content:space-between;width:100%;max-width:950px;margin:0 auto;padding:0 var(--qvh-layout-gutter,20px);gap:12px}

.fh-container{max-width:950px;margin:0 auto;padding:0 var(--qvh-layout-gutter,20px);width:100%;box-sizing:border-box}

.qvh-spotlight-visual{position:relative;flex-shrink:0;height:132px;min-height:132px;max-height:132px;overflow:hidden;background:#101015}

.qvh-spotlight-cover{position:absolute;inset:0;overflow:hidden}

.qvh-spotlight-cover-poster .qvh-spotlight-cover-img,.qvh-spotlight-cover-poster .qvh-remote-poster-img{width:100%;height:100%;object-fit:cover;object-position:center top;display:block}

.qvh-media-card-poster{position:relative;aspect-ratio:2/3;overflow:hidden}

.qvh-media-card-poster-spotlight{aspect-ratio:auto;height:132px}

.qvh-destacados-stack{min-height:200px}

.qvh-cl-week-shell{min-height:0;max-width:100%;min-width:0}

.qvh-ufc-week-shell{min-height:0;max-width:100%;min-width:0;border-radius:14px}

.qvh-ufc-week-layout{display:grid;grid-template-columns:minmax(56px,17%) minmax(0,1fr) minmax(56px,17%)}

.qvh-ufc-week-showcase{display:flex;flex-direction:column;align-items:center;padding:10px 8px}

.qvh-home-feed-slot{min-height:420px}

.qvh-spotlight-card{display:block;color:inherit;text-decoration:none}

.qvh-destacados-page-static{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;touch-action:pan-x;padding-bottom:8px;scroll-padding-inline:var(--qvh-layout-gutter,20px);margin-inline:calc(-1 * var(--qvh-layout-gutter,20px));padding-inline:var(--qvh-layout-gutter,20px)}

.qvh-destacados-page-static::-webkit-scrollbar{display:none}

.qvh-destacados-page-static .qvh-spotlight-card{flex:0 0 min(240px,82vw);max-width:none;scroll-snap-align:start;align-self:start}

.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}

@media (min-width:1024px){

.qvh-destacados-page-static{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));align-items:start;overflow-x:visible;scroll-snap-type:none;touch-action:auto;padding-bottom:0;margin-inline:0;padding-inline:0}

.qvh-destacados-page-static .qvh-spotlight-card{flex:initial;scroll-snap-align:none}

}

@media (max-width:767px){

.qvh-cl-week-matchup,.qvh-cl-week-hero-detail{display:none}

.qvh-cl-week-hero-titleline{flex-wrap:nowrap;align-items:baseline}

.qvh-cl-week-kicker,.qvh-cl-week-headline{white-space:nowrap}

.qvh-ufc-week-headline{font-size:clamp(1.1rem,5vw,1.35rem)}

.qvh-ufc-week-bout-name{font-size:.62rem}

}

`.trim()

