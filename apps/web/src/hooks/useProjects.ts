import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { api } from "@/lib/api-client";

export type ProjectStatus =
  | "CLONING"
  | "CLONED"
  | "DEPLOYING"
  | "DEPLOYED"
  | "FAILED";

export interface Project {
  id: string;
  name: string;
  github_url: string;
  status: ProjectStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
  logs?: {
    createdAt: string;
    message: string;
  }[];
}

type ProjectsResponse = { projects: Project[] };

const getAuthToken = () => localStorage.getItem("user-token") ?? "";

export function useProjects() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await api.get<ProjectsResponse>("/project/all", {
        headers: {
          Authorization: getAuthToken(),
        },
      });

      return (
        response.data.projects?.map((proj) => ({
          ...proj,
          createdAt: new Date(proj.createdAt).toISOString(),
          updatedAt: new Date(proj.updatedAt).toISOString(),
          logs:
            proj.logs?.map((log) => ({
              ...log,
              createdAt: new Date(log.createdAt).toISOString(),
            })) || [],
        })) || []
      );
    },
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });

  const updateStatusForProjects = useCallback(
    async (projects: Project[]) => {
      const updating = projects.filter(
        (p) => p.status !== "DEPLOYED" && p.status !== "FAILED",
      );
      await Promise.all(
        updating.map(async (project) => {
          try {
            const resp = await api.get<{
              projectId: string;
              status: ProjectStatus;
            }>(`/project/status/${project.id}`, {
              headers: {
                Authorization: getAuthToken(),
              },
            });

            queryClient.setQueryData<Project[]>(
              ["projects"],
              (oldProjects = []) =>
                oldProjects.map((p) =>
                  p.id === resp.data.projectId
                    ? { ...p, status: resp.data.status }
                    : p,
                ),
            );
          } catch (e) {
            console.error("Error updating project status: ", e);
          }
        }),
      );
    },
    [queryClient],
  );

  useEffect(() => {
    if (!data) return;
    const updating = data.filter(
      (p) => p.status !== "DEPLOYED" && p.status !== "FAILED",
    );
    if (updating.length === 0) return;
    const polling = setInterval(() => {
      updateStatusForProjects(data);
    }, 3000);
    return () => clearInterval(polling);
  }, [data, updateStatusForProjects]);

  return {
    projects: data,
    isLoading,
    error,
  };
}
