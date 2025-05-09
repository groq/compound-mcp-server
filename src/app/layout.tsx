import type { Metadata } from 'next';
import './globals.css'; // Optional: if you want to add global styles

export const metadata: Metadata = {
  title: 'MCP Server',
  description: 'MCP Server hosted on Vercel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
} 