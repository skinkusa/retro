import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { VisitorCount } from '@/components/VisitorCount';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Retro Manager',
  description: 'A retro-inspired football management sim built with Next.js and Tailwind.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} font-body antialiased selection:bg-accent selection:text-accent-foreground`}>
        {children}
        <footer className="fixed bottom-2 right-2 pointer-events-none">
          <VisitorCount />
        </footer>
      </body>
    </html>
  );
}
