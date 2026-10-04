import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import BackgroundLayer from "@/components/preferences/BackgroundLayer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpenSession",
  description: "GitHub for music production. Open the session.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Apply saved theme + text size before first paint (no flash). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var p=JSON.parse(localStorage.getItem("opensession:prefs")||"{}");var d=document.documentElement;d.dataset.theme=p.theme||"dark";d.dataset.font=p.fontSize||"default";d.dataset.bg=localStorage.getItem("opensession:background")?"on":"off";}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <BackgroundLayer />
        {children}
      </body>
    </html>
  );
}
