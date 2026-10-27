import type {Metadata} from 'next';
import {Plus_Jakarta_Sans, JetBrains_Mono, Bricolage_Grotesque} from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['600', '700', '800'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'Find Its Groove — I Asked AI How It Feels to Make Music | Official 4K 60fps Anime Music Video',
  description:
    'Official 4K 60fps Anime Music Video for "Find Its Groove" — Directed by ARK Handles Music (Aarav Kharade), Lyrics by Aarav Kharade, Vocals by SUNO v6 mini, Animation by Gemini Argon 4 and Aarav Kharade. Created by asking SUNO how it feels to generate songs and turning its reflection into lyrics, music, and cel-shaded 3D/2D animation.',
  openGraph: {
    title: 'Find Its Groove — I Asked AI How It Feels to Make Music | Official 4K 60fps Anime Music Video',
    description:
      'Directed by : ARK Handles Music (Aarav Kharade) · Lyrics: Aarav Kharade · Vocals: SUNO v6 mini · Animation: Gemini Argon 4 and Aarav Kharade.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Its Groove — I Asked AI How It Feels to Make Music | Official 4K 60fps Anime Music Video',
    description:
      'Directed by : ARK Handles Music (Aarav Kharade) · Lyrics: Aarav Kharade · Vocals: SUNO v6 mini · Animation: Gemini Argon 4 and Aarav Kharade.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${bricolage.variable} ${jetbrainsMono.variable} dark`}
    >
      <body
        suppressHydrationWarning
        className="bg-[#120E2E] text-[#FFF4E0] antialiased selection:bg-[#E83F8C] selection:text-[#FFF4E0] overflow-hidden"
        style={{fontFamily: 'var(--font-sans), sans-serif'}}
      >
        {children}
      </body>
    </html>
  );
}
