import ExploreGrid from "@/components/explore/ExploreGrid";
import SiteNav from "@/components/SiteNav";
import { projects } from "@/lib/projects";

export default function ExplorePage() {
  return (
    <div className="flex-1 bg-[var(--os-bg)] text-[var(--os-text)]">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-xl font-semibold">Explore</h1>
        <p className="mt-1 text-sm text-[var(--os-muted)]">
          Public sessions. Open one to inspect its tracks, effects and plugin settings.
        </p>
        <ExploreGrid projects={projects} />
      </main>
    </div>
  );
}
