import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AAHAVAAN-RAIL | Predictive Railway Decision Support',
  description:
    'Predictive Railway Decision Support and 60-Minute Look-Ahead Dispatch Command Center.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark bg-[#07090e]"
      style={{ backgroundColor: '#07090e', colorScheme: 'dark' }}
    >
      <body
        className="bg-[#07090e] text-zinc-100 min-h-screen antialiased selection:bg-cyan-500/30 selection:text-cyan-200"
        style={{ backgroundColor: '#07090e', color: '#f4f4f5' }}
      >
        {children}
      </body>
    </html>
  );
}
