import { headers } from "next/headers";

export function getSiteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;

  const headerList = headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") || "http";
  if (!host) return "";
  return `${proto}://${host}`;
}
