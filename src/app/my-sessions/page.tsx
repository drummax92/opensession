import MySessionsGrid from "@/components/explore/MySessionsGrid";
import SiteNav from "@/components/SiteNav";

export default function MySessionsPage() {
  return (
    <div className="flex-1 bg-[var(--os-bg)] text-[var(--os-text)]">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-xl font-semibold">My sessions</h1>
        <p className="mt-1 text-sm text-[var(--os-muted)]">
          Draft cards saved in this browser. Visibility controls their appearance in your local Explore view; audio is opened separately through Upload.
        </p>
        <MySessionsGrid />
      </main>
    </div>
  );
}
