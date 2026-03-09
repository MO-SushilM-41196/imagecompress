import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata = {
  title: 'Sushil Mishra Developer | Free Online Image Compressor',
  description: 'Compress PNG, JPG, and WebP images instantly without losing quality.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased bg-zinc-50 text-zinc-900" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
