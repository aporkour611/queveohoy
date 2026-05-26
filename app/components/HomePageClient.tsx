"use client";

import dynamic from "next/dynamic";

function HomeLoadingShell() {
  return (
    <div className="fh-body">
      <main className="fh-content">
        <div className="fh-container fh-main">
          <div className="fh-empty fh-loading" style={{ minHeight: "40vh" }}>
            <div className="qvh-spinner" aria-hidden />
            <p>Cargando agenda…</p>
          </div>
        </div>
      </main>
    </div>
  );
}

const HomePage = dynamic(
  () => import("./HomePage").then((mod) => mod.HomePage),
  {
    ssr: false,
    loading: HomeLoadingShell,
  }
);

export function HomePageClient() {
  return <HomePage />;
}
