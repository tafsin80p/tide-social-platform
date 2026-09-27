import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "react-hot-toast";
import { OneSignalProvider } from "@/components/OneSignalProvider";
import { getUserSession } from "@/actions/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#2664EC",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "TIDO - More Than Just Messaging",
  description: "A premium next-generation messaging and calling application.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TIDO",
  },
  icons: {
    apple: "https://res.cloudinary.com/mum1nwin/image/upload/w_180,h_180,c_fill,f_png/v1790515216/tido_logo.png",
  },
  formatDetection: {
    telephone: false,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getUserSession();
  
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="antialiased min-h-screen flex flex-col bg-background text-text-primary overflow-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-center" />
          <OneSignalProvider userId={session?.id} />
        </ThemeProvider>
      </body>
    </html>
  );
}
