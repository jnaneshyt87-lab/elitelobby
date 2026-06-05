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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  console.log(
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:",
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  );

  return (
    <ClerkProvider
  publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
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
                {/* Static blurred background image — zero JS cost */}
                <div
                  style={{
                    position: "fixed", inset: 0, zIndex: -1,
                    backgroundImage: "url(/bg-eye.jpg)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "blur(50px) brightness(0.15) saturate(1.4)",
                    transform: "scale(1.1)",
                    pointerEvents: "none",
                  }}
                />
                <div className="grid-bg" />
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
