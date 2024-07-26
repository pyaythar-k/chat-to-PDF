import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Chat To PDF',
  description: 'Built by IK',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`min-h-screen h-screen overflow-hidden flex flex-col ${inter.className}`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
