import SiteNav from "@/components/SiteNav";
import ImportSession from "@/components/upload/ImportSession";

export default function UploadPage() {
  return (
    <div className="flex h-screen flex-col bg-[var(--os-bg)] text-[var(--os-text)]">
      <SiteNav />
      <ImportSession />
    </div>
  );
}
