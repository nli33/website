import type { Metadata } from "next";
import { Lora, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["500", "600", "700"],
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600"],
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
    <html lang="en" className={`${lora.variable} ${sourceSans.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-paper text-ink">
        <header className="border-b border-line bg-paper">
          <nav className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
            <a href="/" className="font-serif text-lg font-semibold text-ink">Neng Li</a>
            <div className="flex items-center gap-6">
              <a href="/writing" className="font-serif text-lg font-semibold text-ink/80 hover:text-accent-600">Writing</a>
              <a href="/photos" className="font-serif text-lg font-semibold text-ink/80 hover:text-accent-600">Photos</a>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
