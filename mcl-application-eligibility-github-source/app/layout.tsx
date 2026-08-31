import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const base = `${protocol}://${host}`;
  const title = "出願資格シミュレーション｜MCL盛岡医療福祉スポーツ専門学校";
  const description = "社会福祉士・精神保健福祉士通信教育コースの出願資格を質問形式で確認できます。";
  return {
    title, description, icons: { icon: "/favicon.svg" },
    openGraph: { title, description, images: [{ url: `${base}/og.png`, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [`${base}/og.png`] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}
