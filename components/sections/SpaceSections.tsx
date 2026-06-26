import { SpaceField } from "@/components/ui/SpaceField";
import { ComingSoon } from "@/components/sections/ComingSoon";
import { JoinCommunity } from "@/components/sections/JoinCommunity";

export function SpaceSections() {
  return (
    <div data-nav-section="space" className="section-space relative overflow-hidden text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,#1a1f3c_0%,#06060f_45%,#020208_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 80%, rgba(88,120,200,0.12), transparent 70%)",
        }}
        aria-hidden="true"
      />
      <SpaceField />
      <ComingSoon />
      <JoinCommunity />
    </div>
  );
}
