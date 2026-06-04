"use client";
import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Zap } from "lucide-react";

const clerkAppearance = {
  variables: {
    colorPrimary: "#7c3aed",
    colorForeground: "#f1f5f9",
    colorMutedForeground: "#94a3b8",
    colorDanger: "#ef4444",
    colorBackground: "#0a0a14",
    colorInput: "#0f0f1e",
    colorInputForeground: "#f1f5f9",
    colorNeutral: "#7c3aed",
    fontFamily: "'Inter', sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: { width: "100%" },
    cardBox: {
      background: "rgba(10, 10, 20, 0.85)",
      border: "1px solid rgba(124, 58, 237, 0.25)",
      borderRadius: "1rem",
      backdropFilter: "blur(20px)",
      width: "100%",
      maxWidth: "100%",
      boxShadow: "0 0 40px rgba(124, 58, 237, 0.08)",
    },
    card: {
      background: "transparent",
      boxShadow: "none",
      border: "none",
    },
    footer: {
      background: "transparent",
      boxShadow: "none",
      border: "none",
    },
    headerTitle: {
      color: "#f1f5f9",
      fontFamily: "'Orbitron', monospace",
      letterSpacing: "0.05em",
    },
    headerSubtitle: { color: "#94a3b8" },
    socialButtonsBlockButtonText: { color: "#f1f5f9" },
    socialButtonsBlockButton: {
      background: "#0f0f1e",
      border: "1px solid rgba(124, 58, 237, 0.25)",
      color: "#f1f5f9",
    },
    formFieldLabel: { color: "#94a3b8", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase" as const },
    formFieldInput: {
      background: "#0f0f1e",
      border: "1px solid rgba(124, 58, 237, 0.25)",
      color: "#f1f5f9",
    },
    formButtonPrimary: {
      background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
      color: "#ffffff",
      fontFamily: "'Rajdhani', sans-serif",
      fontWeight: "700",
      letterSpacing: "0.1em",
      textTransform: "uppercase" as const,
    },
    footerActionLink: { color: "#a855f7" },
    footerActionText: { color: "#94a3b8" },
    dividerText: { color: "#475569" },
    dividerLine: { background: "rgba(124, 58, 237, 0.2)" },
    identityPreviewEditButton: { color: "#a855f7" },
    formFieldSuccessText: { color: "#22c55e" },
    alertText: { color: "#f87171" },
    alert: {
      background: "rgba(239, 68, 68, 0.08)",
      border: "1px solid rgba(239, 68, 68, 0.3)",
    },
    otpCodeFieldInput: {
      background: "#0f0f1e",
      border: "1px solid rgba(124, 58, 237, 0.25)",
      color: "#f1f5f9",
    },
    logoBox: { display: "none" },
  },
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-1/3 right-1/3 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }}
        />
        <div
          className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-xl flex items-center justify-center" style={{ boxShadow: "0 0 20px rgba(124, 58, 237, 0.5)" }}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl" style={{ background: "linear-gradient(135deg, #a855f7, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              ELITELOBBY
            </span>
          </Link>
          <h1 className="font-display font-bold text-2xl text-white mb-1">JOIN THE BATTLE</h1>
          <p className="text-slate-400 text-sm">Create your player account and start competing</p>
        </div>

        <SignUp
          routing="path"
          path="/auth/signup"
          signInUrl="/auth/login"
          fallbackRedirectUrl="/profile-setup"
          appearance={clerkAppearance}
        />

        <p className="text-center text-xs text-slate-500 mt-6">
          By signing up, you agree to our{" "}
          <Link href="/support" className="text-purple-400 hover:underline">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/support" className="text-purple-400 hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
