import type { OpenSessionProject } from "@/types/session";
import { stormhacksDemo } from "@/lib/fixtures/stormhacksDemo";

/** All projects the site knows about. Imported sessions can be added here later. */
export const projects: OpenSessionProject[] = [stormhacksDemo];

export const projectHref = (p: OpenSessionProject) =>
  `/${p.owner.toLowerCase()}/${p.slug}`;
