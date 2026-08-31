import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GenoRoot Clinic — Hair & Scalp Medical Intake',
  description: 'Specialized patient-facing clinical hair and scalp evaluation for personalized follicular therapy.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-canvas text-ink-primary antialiased selection:bg-surface-tint-sage selection:text-green-deep">
        {children}
      </body>
    </html>
  );
}
