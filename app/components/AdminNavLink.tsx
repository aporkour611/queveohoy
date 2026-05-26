"use client";

import { useEffect, useState } from "react";

export function AdminNavLink() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((data) => setShow(Boolean(data.admin)))
      .catch(() => setShow(false));
  }, []);

  if (!show) return null;

  return <a href="/admin">Admin</a>;
}
