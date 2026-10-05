import { DM_Sans, Instrument_Serif, Ribeye, Smokum } from "next/font/google";

export const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const ribeye = Ribeye({
  variable: "--font-ribeye-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const smokum = Smokum({
  variable: "--font-smokum",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const fontVariables = `${dmSans.variable} ${instrumentSerif.variable} ${ribeye.variable} ${smokum.variable}`;
