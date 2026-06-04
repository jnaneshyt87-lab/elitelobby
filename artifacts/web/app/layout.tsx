import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { NotificationsProvider } from "@/lib/notifications-context";
import { NotificationToastContainer } from "@/components/ui/notification-toast";
import { RoomIdProvider } from "@/lib/room-id-context";
import { WalletProvider } from "@/lib/wallet-context";
import { ClerkProvider } from "@clerk/nextjs";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { LiveTicker } from "@/components/ui/live-ticker";
import { TickerProvider } from "@/lib/ticker-context";
import { BottomNav } from "@/components/layout/bottom-nav";

export const metadata: Metadata = {
  title: "EliteLobby — Esports Tournament Platform",
  description: "Join paid tournaments, compete against the best, and win real cash prizes. India's #1 esports tournament platform.",
  keywords: ["esports", "tournament", "BGMI", "Free Fire", "Valorant", "online gaming", "cash prizes"],
  openGraph: {
    title: "EliteLobby",
    description: "Compete. Win. Dominate.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      signInUrl="/auth/login"
      signUpUrl="/auth/signup"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/profile-setup"
    >
      <html lang="en" suppressHydrationWarning>
        <body className="font-body antialiased">
          <NotificationsProvider>
            <WalletProvider>
              <RoomIdProvider>
                <TickerProvider>
                <div className="grid-bg" />
                <LiveTicker />
                <Navbar />
                <main className="relative z-10 min-h-screen pb-16 md:pb-0">
                  {children}
                </main>
                <Footer />
                <BottomNav />
                <NotificationToastContainer />
                <WhatsAppButton />
                </TickerProvider>
              </RoomIdProvider>
            </WalletProvider>
          </NotificationsProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
