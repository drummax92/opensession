import Greeting from "@/components/explore/Greeting";
import DraftCards from "@/components/explore/DraftCards";
import ProjectCard from "@/components/explore/ProjectCard";
import SiteNav from "@/components/SiteNav";
import { projects } from "@/lib/projects";

export default function Home() {
  return (
    <div className="flex-1 bg-[var(--os-bg)] text-[var(--os-text)]">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Greeting />
        <h2 className="text-xl font-semibold">Explore sessions</h2>
        <p className="mt-1 text-sm text-[var(--os-muted)]">
          Open a project to inspect its tracks, effects and plugin settings.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
          <DraftCards />
        </div>
      </main>
    </div>
  );
}
