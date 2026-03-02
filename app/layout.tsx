import type { Metadata } from "next";
import { Syne, DM_Mono, ABeeZee } from "next/font/google";
import "./globals.css";

const abeezee = ABeeZee({
  variable: "--font-abeezee",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Project Timeline — FSZA WORKS",
  description: "Dashboard de cronograma de projetos para clientes da FSZA WORKS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${abeezee.variable} ${syne.variable} ${dmMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
