import SiteNav from "@/components/SiteNav";
import UploadShell from "@/components/upload/UploadShell";

export default function UploadPage() {
  return (
    <div className="flex-1 bg-[#0d1117] text-[#e6edf3]">
      <SiteNav />
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="text-xl font-semibold">Upload</h1>
        <p className="mb-6 mt-1 text-sm text-[#8b949e]">
          Imported sessions open in your browser and disappear when you refresh.
        </p>
        <UploadShell />
      </main>
    </div>
  );
}
