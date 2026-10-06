import { getCollection } from "astro:content";
import { FEATURES } from "@site";

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  date: string | Date;
  demoURL?: string;
  repoURL?: string;
  websiteURL?: string;
  tags?: string[];
}

/** Every project, newest first. */
export async function getProjects(): Promise<ProjectItem[]> {
  if (!FEATURES.projects) return [];
  const entries = await getCollection("projects");
  return entries
    .map((entry) => ({ id: entry.id, ...entry.data }))
    .sort((a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf());
}
