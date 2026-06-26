import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Courier_Prime,
  DM_Sans,
  IBM_Plex_Mono,
  Instrument_Serif,
  Playfair_Display,
  Space_Grotesk,
  Syne,
} from "next/font/google";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { InkDefs } from "@/components/ui/InkDefs";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const courier = Courier_Prime({
  variable: "--font-courier",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "BARUCH — A New Kind of Fragrance House",
  description:
    "Creating scents inspired by impossible ideas, forgotten memories, and unexpected experiences.",
  openGraph: {
    title: "BARUCH — A New Kind of Fragrance House",
    description:
      "Creating scents inspired by impossible ideas, forgotten memories, and unexpected experiences.",
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "BARUCH — A New Kind of Fragrance House",
    description:
      "Creating scents inspired by impossible ideas, forgotten memories, and unexpected experiences.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable} ${courier.variable} ${playfair.variable} ${spaceGrotesk.variable} ${syne.variable} ${instrument.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <InkDefs />
        <CustomCursor />
        <div className="noise-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
