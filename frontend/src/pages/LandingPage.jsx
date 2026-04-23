import { LandingAbout } from "../components/landing/LandingAbout";
import { LandingCta } from "../components/landing/LandingCta";
import { LandingFeatures } from "../components/landing/LandingFeatures";
import { LandingFooter } from "../components/landing/LandingFooter";
import { LandingHero } from "../components/landing/LandingHero";
import { LandingModules } from "../components/landing/LandingModules";
import { LandingNavbar } from "../components/landing/LandingNavbar";

export default function LandingPage() {
  return (
    <main className="min-h-svh bg-white">
      <LandingNavbar />
      <LandingHero />
      <LandingFeatures />
      <LandingModules />
      <LandingAbout />
      <LandingCta />
      <LandingFooter />
    </main>
  );
}
