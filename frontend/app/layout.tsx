import type { Metadata } from "next";
import { Lora } from "next/font/google";
import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Neng Li",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={lora.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-paper text-ink">
        <header className="border-b border-line bg-paper">
          <nav className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
            <a href="/" className="font-serif text-lg font-semibold text-ink">Neng Li</a>
            <div className="flex items-center gap-6 text-sm font-medium">
              <a href="/" className="text-ink/70 hover:text-accent-600">Home</a>
              <a href="/writing" className="text-ink/70 hover:text-accent-600">Writing</a>
              <a href="/photos" className="text-ink/70 hover:text-accent-600">Photos</a>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
