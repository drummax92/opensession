import Link from "next/link";

export default function SiteNav() {
  return (
    <nav className="flex h-12 items-center gap-6 border-b border-[#30363d] bg-[#161b22] px-6">
      <Link href="/" className="text-sm font-semibold text-[#e6edf3]">
        OpenSession
      </Link>
      <Link href="/" className="text-sm text-[#8b949e] hover:text-[#e6edf3]">
        Explore
      </Link>
    </nav>
  );
}
