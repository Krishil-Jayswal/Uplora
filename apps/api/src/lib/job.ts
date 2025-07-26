import { Project } from "@repo/db";
import { Job } from "@repo/validation";
export const createDeploymentJob = (
  project: Project,
  installationId: string,
): Job => {
  return {
    id: project.id,
    name: project.name,
    metadata: JSON.parse(project.metadata),
    repoUrl: project.repoUrl,
    slug: project.slug,
    installationId,
  };
};
