import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";

const inter = Inter({ subsets: ["latin"] });

const latoBold = localFont({
  src: "../assets/fonts/Lato-Bold.ttf",
  variable: "--font-lato-bold",
  weight: "700",
});

const latoSemiBold = localFont({
  src: "../assets/fonts/Lato-Semibold.ttf",
  variable: "--font-lato-semi-bold",
  weight: "600",
});

const latoMedium = localFont({
  src: "../assets/fonts/Lato-Medium.ttf",
  variable: "--font-lato-medium",
  weight: "500",
});

const latoRegular = localFont({
  src: "../assets/fonts/Lato-Regular.ttf",
  variable: "--font-lato-regular",
  weight: "400",
});

const latoLight = localFont({
  src: "../assets/fonts/Lato-Light.ttf",
  variable: "--font-lato-light",
  weight: "300",
});

const interFont = localFont({
  src: "../assets/fonts/Inter-VariableFont_opsz,wght.ttf",
  variable: "--font-inter-font",
});

export const metadata: Metadata = {
  title: "Planör Portal - Property Asset Management",
  description:
    "Secure, full-stack property asset management portal for managing properties, buildings, maintenance plans, and document workflows.",
  keywords:
    "property management, asset management, maintenance plans, building management",
  authors: [{ name: "Planör Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${latoBold.variable} ${latoSemiBold.variable} ${latoMedium.variable} ${latoRegular.variable} ${latoLight.variable} ${interFont.variable}`}
      >
        {/* <AzureAuthProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline /> */}
        {children}
        {/* </ThemeProvider>
        </AzureAuthProvider> */}
      </body>
    </html>
  );
}
