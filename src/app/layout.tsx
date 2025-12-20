import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils"; // (เดี๋ยวไฟล์นี้จะมาตอนลง shadcn)

export const metadata: Metadata = {
  title: "ระบบรับสมัครโครงการต่างประเทศ",
  description: "โรงเรียนสาธิตมหาวิทยาลัยศิลปากร",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        {/* Google Sans Font Setup */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap" rel="stylesheet" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased"
        )}
      >
        {children}
      </body>
    </html>
  );
}