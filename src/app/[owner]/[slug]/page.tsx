import { notFound } from "next/navigation";
import SessionViewer from "@/components/session/SessionViewer";
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
  return <SessionViewer project={project} />;
}
