import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, Instrument_Serif, Inter } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/lib/store';
import { ToastProvider } from '@/components/ui/Toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://taxfillr.pages.dev'),
  title: {
    default: 'TaxFillr, tax records and FBR notices for Pakistani taxpayers',
    template: '%s | TaxFillr',
  },
  description:
    'Scan receipts, salary slips and FBR notices. TaxFillr reads them, keeps your records in order, estimates what you owe and drafts replies to notices. Runs in your browser with your own Ollama key.',
  keywords: [
    'Pakistan tax',
    'FBR',
    'income tax return',
    'IRIS',
    'NTN',
    'tax calculator Pakistan',
    'FBR notice reply',
  ],
  openGraph: {
    title: 'TaxFillr, tax records and FBR notices for Pakistani taxpayers',
    description:
      'Scan a receipt or an FBR notice, get structured records, an estimate of what you owe and a reply you can send.',
    type: 'website',
    locale: 'en_PK',
  },
};

export const viewport: Viewport = {
  themeColor: '#07231B',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${serif.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-paper font-sans">
        <StoreProvider>
          <ToastProvider>{children}</ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
