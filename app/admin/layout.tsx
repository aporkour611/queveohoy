import type { Metadata } from "next"
import { privateAreaMetadata } from "@/app/lib/private-metadata"

export const metadata: Metadata = privateAreaMetadata("Admin — QueveoHoy")

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
