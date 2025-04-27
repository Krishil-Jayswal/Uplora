import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { httpApi, projectApi } from "@/lib/api-client";
import { ProjectSchema } from "./useProject";
import { Status } from "@repo/validation";

const getAuthToken = () => localStorage.getItem("user-token") ?? "";

export function useProjects() {
  const queryClient = useQueryClient();
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await httpApi.get<{ projects: ProjectSchema[] }>(
        "/api/v1/project/all",
        {
          headers: {
            Authorization: getAuthToken(),
          },
        },
      );

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
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const fetchProjectStatus = useCallback(
    async (projectId: string) => {
      try {
        const resp = await projectApi.getStatus(projectId);

        queryClient.setQueryData<ProjectSchema[]>(
          ["projects"],
          (oldProjects = []) =>
            oldProjects.map((p) =>
              p.id === projectId ? { ...p, status: resp.data.status } : p,
            ),
        );

        return resp.data.status;
      } catch (e) {
        console.error(`Error fetching status for project ${projectId}:`, e);
        return null;
      }
    },
    [queryClient],
  );

  useEffect(() => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }

    if (!data) return;

    const projectsToUpdate = data.filter(
      (p) => p.status !== Status.DEPLOYED && p.status !== Status.FAILED,
    );

    if (projectsToUpdate.length === 0) return;

    const pollProjects = async () => {
      const stillNeedPolling: ProjectSchema[] = [];

      for (const project of projectsToUpdate) {
        const status = await fetchProjectStatus(project.id);
        if (status && status !== Status.DEPLOYED && status !== Status.FAILED) {
          stillNeedPolling.push(project);
        }
      }

      if (stillNeedPolling.length > 0) {
        pollingTimeoutRef.current = setTimeout(pollProjects, 3000);
      }
    };

    pollingTimeoutRef.current = setTimeout(pollProjects, 3000);

    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
    };
  }, [data, fetchProjectStatus]);

  return {
    projects: data,
    isLoading,
    error,
  };
}
