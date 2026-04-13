import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Toaster } from "sonner";
import { auth } from "@/auth";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fishing Space",
  description: "Відстежуйте свої рибальські сесії та результати",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased bg-n-bg text-n-text font-sans">
        <Toaster position="bottom-right" expand={false} richColors theme="dark" />
        <Header session={session} />
        <div className="flex h-[calc(100vh-65px)] overflow-hidden">
          {isLoggedIn && <Sidebar />}
          <main className="flex-1 overflow-y-auto notion-scrollbar">
            <div className="w-full px-4 md:px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
