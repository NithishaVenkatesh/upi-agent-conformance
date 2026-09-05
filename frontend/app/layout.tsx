import "./globals.css";
import { IBM_Plex_Sans, IBM_Plex_Mono, Newsreader } from "next/font/google";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

const doc = Newsreader({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
});

export const metadata = {
  title: "in.razorpay.upi — Payment Gate",
  description: "Regulatory compliance for UPI payment blocks",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} ${doc.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
