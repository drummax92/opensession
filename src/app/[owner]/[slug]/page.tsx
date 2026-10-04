import { notFound } from "next/navigation";
import SessionViewer from "@/components/session/SessionViewer";
import SiteNav from "@/components/SiteNav";
import { projects } from "@/lib/projects";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ owner: string; slug: string }>;
}) {
  const { owner, slug } = await params;
  const project = projects.find(
    (p) => p.owner.toLowerCase() === owner.toLowerCase() && p.slug === slug,
  );
  if (!project) notFound();
  return (
    <div className="flex h-screen flex-col">
      <SiteNav />
      <div className="min-h-0 flex-1">
        <SessionViewer project={project} />
      </div>
    </div>
  );
}
