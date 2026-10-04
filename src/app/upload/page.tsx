import SiteNav from "@/components/SiteNav";
import UploadShell from "@/components/upload/UploadShell";

export default function UploadPage() {
  return (
    <div className="flex-1 bg-[var(--os-bg)] text-[var(--os-text)]">
      <SiteNav />
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="text-xl font-semibold">Upload</h1>
        <p className="mb-6 mt-1 text-sm text-[var(--os-muted)]">
          Imported sessions open in your browser and disappear when you refresh.
        </p>
        <UploadShell />
      </main>
    </div>
  );
}
