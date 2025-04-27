import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import {
  httpApi,
  deployApi,
  projectApi,
  serializedLog,
} from "@/lib/api-client";
import { Project, Status } from "@repo/validation";

export type ProjectSchema = Omit<Project, "createdAt" | "githubUrl"> & {
  logs?: serializedLog[];
  github_url: string;
  createdAt: string;
  updatedAt: string;
};

export const useProject = (projectId?: string) => {
  const queryClient = useQueryClient();
  const [isPolling, setIsPolling] = useState(false);

  const {
    data: project,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      if (!projectId) return null;

      const response = await httpApi.get<{ project: ProjectSchema }>(
        `/api/v1/project/${projectId}`,
      );

      return {
        ...response.data.project,
        createdAt: new Date(response.data.project.createdAt).toISOString(),
        updatedAt: new Date(response.data.project.updatedAt).toISOString(),
        logs:
          response.data.project.logs?.map((log) => ({
            ...log,
            createdAt: new Date(log.createdAt).toISOString(),
          })) || [],
      };
    },
    enabled: !!projectId,
    staleTime: 5000,
    refetchOnWindowFocus: false,
  });

  const fetchProjectLogs = useCallback(async () => {
    if (!projectId) return;
    try {
      const logsResponse = await projectApi.getLogs(projectId);
      const logs = logsResponse.data.logs.map((log) => ({
        ...log,
        createdAt: new Date(log.createdAt).toISOString(),
      }));

      queryClient.setQueryData<ProjectSchema | null>(
        ["project", projectId],
        (oldProject) => {
          if (!oldProject) return null;
          return {
            ...oldProject,
            logs: logs,
          };
        },
      );
    } catch (error) {
      console.error("Error fetching project logs:", error);
    }
  }, [projectId, queryClient]);

  const fetchProjectStatus = useCallback(async () => {
    if (!projectId) return;
    try {
      const statusResponse = await projectApi.getStatus(projectId);
      const status = statusResponse.data.status;

      queryClient.setQueryData<ProjectSchema | null>(
        ["project", projectId],
        (oldProject) => {
          if (!oldProject) return null;
          return {
            ...oldProject,
            status: status,
          };
        },
      );

      if (status === Status.DEPLOYED || status === Status.FAILED) {
        await fetchProjectLogs();
        setIsPolling(false);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error fetching project status:", error);
      return false;
    }
  }, [fetchProjectLogs, projectId, queryClient]);

  const deployProject = useMutation({
    mutationFn: async (githubUrl: string) => {
      const response = await deployApi.post<{ projectId: string }>(
        "/api/v1/deploy",
        { githubUrl },
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      return data.projectId;
    },
  });

  useEffect(() => {
    if (
      !project ||
      !projectId ||
      project.status === Status.DEPLOYED ||
      project.status === Status.FAILED
    ) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);
    let isActive = true;

    const pollData = async () => {
      if (!isActive) return;

      const shouldContinue = await fetchProjectStatus();

      if (shouldContinue && isActive) {
        await fetchProjectLogs();

        if (isActive) {
          setTimeout(pollData, 3000);
        }
      }
    };

    pollData();

    return () => {
      isActive = false;
      setIsPolling(false);
    };
  }, [project, projectId, fetchProjectLogs, fetchProjectStatus]);

  return {
    project,
    isLoading,
    error,
    deployProject,
    isPolling,
  };
};
