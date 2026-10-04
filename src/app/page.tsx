import Greeting from "@/components/explore/Greeting";
import HomeSections from "@/components/home/HomeSections";
import StatsStrip from "@/components/home/StatsStrip";
import SiteNav from "@/components/SiteNav";
import { projects } from "@/lib/projects";

export default function Home() {
  return (
    <div className="flex-1 bg-[var(--os-bg)] text-[var(--os-text)]">
      <SiteNav />
      <main className="mx-auto max-w-5xl space-y-10 px-6 py-8">
        <Greeting />
        <StatsStrip />
        <HomeSections projects={projects} />
      </main>
    </div>
  );
}
