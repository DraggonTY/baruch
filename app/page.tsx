import { SiteNav } from "@/components/layout/SiteNav";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Manifesto } from "@/components/sections/Manifesto";
import { TheLab } from "@/components/sections/TheLab";
import { Differentiators } from "@/components/sections/Differentiators";
import { SpaceSections } from "@/components/sections/SpaceSections";
import { About } from "@/components/sections/About";

export default function Home() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <Manifesto />
        <TheLab />
        <Differentiators />
        <SpaceSections />
        <About />
      </main>
      <Footer />
    </>
  );
}
