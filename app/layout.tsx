import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Banna Capital — Investment Platform",
  description:
    "Invest smartly with Banna Capital. Manage your investments, track profits, and explore new opportunities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#18181b",
              color: "#fafafa",
              border: "1px solid rgba(255,255,255,0.08)",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#10b981", secondary: "#18181b" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#18181b" },
            },
          }}
        />
      </body>
    </html>
  );
}
