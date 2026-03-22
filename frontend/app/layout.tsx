import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Personal Website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-gray-100 text-gray-900">
        <header className="border-b border-gray-200 bg-white">
          <nav className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
            <a href="/" className="text-lg font-semibold">Neng Li</a>
            <div className="flex items-center gap-6 text-sm font-medium">
              <a href="/" className="text-gray-700 hover:text-gray-900">Home</a>
              <a href="/writing" className="text-gray-700 hover:text-gray-900">Writing</a>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
