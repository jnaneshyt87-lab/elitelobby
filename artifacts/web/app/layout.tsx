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
import { CursorSpotlight } from "@/components/ui/cursor-spotlight";
import { ClerkBannerRemover } from "@/components/ui/clerk-banner-remover";
import { ParticleBackground } from "@/components/ui/particle-background";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { LiquidRevealBg } from "@/components/ui/liquid-reveal-bg";

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
      appearance={{
        elements: {
          developmentModeContainer: { display: "none" },
          developmentModePopoverTrigger: { display: "none" },
          developmentModePopoverCard: { display: "none" },
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className="font-body antialiased">
          <NotificationsProvider>
            <WalletProvider>
              <RoomIdProvider>
                <TickerProvider>
                <LiquidRevealBg />
                <div className="grid-bg" />
                <div className="cursor-reveal-overlay" style={{ opacity: 0 }} />
                <ParticleBackground />
                <CursorSpotlight />
                <LoadingScreen />
                <LiveTicker />
                <Navbar />
                <main className="relative z-10 min-h-screen pb-16 md:pb-0">
                  {children}
                </main>
                <Footer />
                <BottomNav />
                <NotificationToastContainer />
                <WhatsAppButton />
                <ClerkBannerRemover />
                </TickerProvider>
              </RoomIdProvider>
            </WalletProvider>
          </NotificationsProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
