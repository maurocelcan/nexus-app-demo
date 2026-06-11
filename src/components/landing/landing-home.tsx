"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { useAuthStore } from "@/stores/auth-store";
import { CommercialBrainPreview } from "./commercial-brain-preview";
import { HomeAccessPanel } from "./home-access-panel";
import { InitialLoader } from "./initial-loader";
import { radialGlow } from "./landing-style";

export function LandingHome() {
  const [ready, setReady] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { isAuthenticated, isOnboarded } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const updatePreview = () => setShowPreview(mediaQuery.matches);

    updatePreview();
    mediaQuery.addEventListener("change", updatePreview);
    return () => mediaQuery.removeEventListener("change", updatePreview);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(isOnboarded ? ROUTES.WORKSPACE : ROUTES.ONBOARDING);
    }
  }, [isAuthenticated, isOnboarded, router]);

  if (isAuthenticated) return null;

  return (
    <>
      {!ready && <InitialLoader onComplete={() => setReady(true)} />}

      <main
        className="relative flex h-screen w-full overflow-hidden bg-background transition-opacity duration-slow"
        style={{ opacity: ready ? 1 : 0 }}
      >
        <div className="noise-overlay" />

        <div
          className="pointer-events-none absolute inset-0 md:hidden"
          style={{ background: radialGlow("primary", 0.07) }}
        />

        <div className="relative z-10 flex h-full w-full shrink-0 flex-col md:w-auto">
          <div className="hidden h-full flex-col md:flex md:w-[clamp(240px,26vw,340px)]">
            <HomeAccessPanel />
          </div>
          <div className="flex h-full w-full flex-col md:hidden">
            <HomeAccessPanel />
          </div>
        </div>

        {showPreview && (
          <div className="relative z-10 hidden flex-1 overflow-hidden md:flex">
            <CommercialBrainPreview />
          </div>
        )}
      </main>
    </>
  );
}
