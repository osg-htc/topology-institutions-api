import type { Metadata } from 'next';
import { Suspense } from 'react';
import localFont from 'next/font/local';
import './styles/globals.css';
import NavBar from '@/app/components/NavBar';
import { InstitutionProvider } from '@/app/context/InstitutionContext';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Topology Institution API',
  description: 'Topology Institution API',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <InstitutionProvider>
          <NavBar />
          <Suspense>{children}</Suspense>
        </InstitutionProvider>
      </body>
    </html>
  );
}
