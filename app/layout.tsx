import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Permutas Docentes Brown",
  description: "Encontrá permutas docentes por código PID en la Provincia de Buenos Aires.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
