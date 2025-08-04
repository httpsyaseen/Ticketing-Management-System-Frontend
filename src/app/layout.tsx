import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import ToastProvider from "@/components/toaster";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/sidebar";
import { AppHeader } from "@/components/header";
import { TicketProvider } from "@/context/ticket-context";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"], // Optional: define weights you need
  variable: "--font-space-mono", // optional if you want to use as CSS variable
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ticket Management System (PSBA)",
  description: "Ticket Management System for PSBA developed by Yaseen",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceMono.variable} ${spaceMono.variable} antialiased`}
      >
        <ToastProvider />
        <AuthProvider>
                        <TicketProvider>

          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <AppHeader />
              <main className="flex flex-1 flex-col">{children}</main>
            </SidebarInset>
          </SidebarProvider>
          </TicketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
