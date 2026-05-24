import type { Metadata } from "next";
import { Geist_Mono, Poppins } from "next/font/google";

import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/www/theme-provider";
import { SolanaClientProvider } from "@/providers/solana-client";
import {
  PrivyAsSolanaWalletProvider,
  PrivyConfigProvider,
} from "@/providers/privy-as-solana-wallet";

import "@/app/styles/globals.css";
import { IsAdminViewProvider } from "@/providers/is-admin-view";
import { ProgramAccountsProvider } from "./(navbar)/vote-component/providers/program-accounts";
import { TimeProvider } from "./(navbar)/vote-component/providers/time";
import { HxuiLiteTokenProvider } from "./(navbar)/vote-component/providers/hxui-lite-token";
import { Toaster } from "sonner";
import { Footer } from "@/components/www/footer";

// Fonts
const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

// Metadata
export const metadata: Metadata = {
  metadataBase: new URL("https://www.100xui.com"),
  title: {
    default: "100xUI",
    template: "%s | 100xUI",
  },
  description:
    "Reusable motion components for React. New component every 72 hours!",
  creator: "Yashwant Ostwal",
  twitter: {
    card: "summary_large_image",
  },
  openGraph: {
    title: "100xUI",
    description:
      "Reusable motion components for React. New component every 72 hours!",
    images: [
      {
        url: `/og/default.png`,
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="100xUI" />
      </head>
      <body
        className={cn(
          geistMono.variable,
          poppins.className, // default font
          "bg-layout antialiased"
        )}
      >
        <SolanaClientProvider>
          <PrivyConfigProvider appId="cmjuf6ftn021ml50cszzykcsu">
            <PrivyAsSolanaWalletProvider>
              <TimeProvider>
                <ProgramAccountsProvider>
                  <HxuiLiteTokenProvider>
                    <IsAdminViewProvider>
                      <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                        themes={[
                          "light-perpetuity",
                          "dark-perpetuity",
                          "light",
                          "dark",
                          "light-vercel",
                          "dark-vercel",
                          "light-bubblegum",
                          "dark-bubblegum",
                        ]}
                      >
                        <div className="px-2 lg:px-3">
                          <div className="bg-background text-foreground relative min-h-screen border-x border-dashed">
                            {children}
                            <Footer></Footer>
                          </div>
                        </div>
                        <Toaster
                          // toastOptions={{
                          //   classNames: {
                          //     toast:
                          //       "!bg-background !text-foreground !font-sans !border-border",
                          //   },
                          // }}
                          expand
                          richColors
                          theme="dark"
                        />
                      </ThemeProvider>
                    </IsAdminViewProvider>
                  </HxuiLiteTokenProvider>
                </ProgramAccountsProvider>
              </TimeProvider>
            </PrivyAsSolanaWalletProvider>
          </PrivyConfigProvider>
        </SolanaClientProvider>
      </body>
    </html>
  );
}
