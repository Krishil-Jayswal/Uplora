import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useProject } from "@/hooks/useProject";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ArrowLeft, ExternalLink, Clock, GitFork } from "lucide-react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { project, isLoading, error, isPolling } = useProject(projectId);

  // Function to format dates
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm:ss a");
    } catch {
      return dateString;
    }
  };

  // Function to determine if we should show the processing animation
  const isDeploymentInProgress = () => {
    if (!project) return false;

    // Only show animation for in-progress statuses and when we're actually polling
    // Status from backend is lowercase
    return (
      isPolling && project.status !== "deployed" && project.status !== "failed"
    );
  };

  // Function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "deployed":
        return <Badge className="bg-green-500">Live</Badge>;
      case "failed":
        return <Badge className="bg-destructive">Failed</Badge>;
      default:
        return (
          <Badge className="bg-amber-500">
            <span className="flex items-center gap-2">
              {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
              {isDeploymentInProgress() && (
                <span className="flex space-x-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-background animate-[pulse_1.5s_ease-in-out_infinite]"></span>
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-background animate-[pulse_1.5s_ease-in-out_0.5s_infinite]"></span>
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-background animate-[pulse_1.5s_ease-in-out_1s_infinite]"></span>
                </span>
              )}
            </span>
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex animate-pulse space-y-8">
              <div className="space-y-6 w-full">
                <div className="h-10 w-3/4 bg-secondary rounded"></div>
                <div className="h-40 bg-secondary rounded"></div>
                <div className="h-60 bg-secondary rounded"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-red-500">Error</CardTitle>
                <CardDescription>
                  Failed to load project information. Please try again later.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => navigate(-1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Project Not Found</CardTitle>
                <CardDescription>
                  The project you're looking for doesn't exist or you don't have
                  permission to view it.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  const deployUrl = `http://${project.slug}.localhost:5002`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto animate-fade-in">
          <div className="mb-6">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          <ResizablePanelGroup
            direction="horizontal"
            className="min-h-[600px] border rounded-lg"
          >
            {/* Project Metadata Panel */}
            <ResizablePanel defaultSize={40} minSize={30}>
              <div className="h-full p-6">
                <div className="space-y-6">
                  {/* Project Header */}
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl font-bold">{project.name}</h1>
                      {getStatusBadge(project.status)}
                    </div>
                    <div className="mt-4 space-y-4">
                      {/* GitHub Link */}
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
                      >
                        <GitFork className="h-4 w-4" />
                        <span className="text-sm group-hover:underline">
                          {project.github_url.replace(
                            "https://github.com/",
                            ""
                          )}
                        </span>
                      </a>

                      {/* Creation Date */}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">
                          Created {formatDate(project.createdAt)}
                        </span>
                      </div>

                      {/* Visit Site Button */}
                      {project.status === "deployed" && (
                        <Button
                          variant="outline"
                          className="w-full transition-all hover:bg-primary hover:text-primary-foreground duration-300 group"
                          asChild
                        >
                          <a
                            href={deployUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center"
                          >
                            Visit site
                            <ExternalLink className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Logs Panel */}
            <ResizablePanel defaultSize={60}>
              <div className="h-full p-6">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-xl">Deployment Logs</CardTitle>
                    <CardDescription>
                      {isDeploymentInProgress() ? (
                        <span className="flex items-center gap-2">
                          Processing deployment
                          <span className="flex space-x-1">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-[pulse_1.5s_ease-in-out_infinite]"></span>
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-[pulse_1.5s_ease-in-out_0.5s_infinite]"></span>
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-[pulse_1.5s_ease-in-out_1s_infinite]"></span>
                          </span>
                        </span>
                      ) : project.status === "deployed" ? (
                        "Deployment completed successfully"
                      ) : project.status === "failed" ? (
                        "Deployment failed"
                      ) : (
                        "Log of deployment activities"
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] rounded-md border p-4 bg-secondary/30">
                      {project.logs && project.logs.length > 0 ? (
                        <div className="space-y-3">
                          {project.logs.map((log, index) => (
                            <div
                              key={index}
                              className="border-b border-border pb-2 last:border-0"
                            >
                              <div className="flex justify-between items-start gap-4">
                                <pre
                                  className="text-sm whitespace-pre-wrap font-mono"
                                  dangerouslySetInnerHTML={{
                                    __html: log.message
                                      .replace(
                                        /\[32m/g,
                                        '<span class="text-green-500">'
                                      )
                                      .replace(
                                        /\[36m/g,
                                        '<span class="text-cyan-500">'
                                      )
                                      .replace(
                                        /\[35m/g,
                                        '<span class="text-purple-500">'
                                      )
                                      .replace(/\[39m/g, "</span>")
                                      .replace(
                                        /\[1m/g,
                                        '<span class="font-bold">'
                                      )
                                      .replace(/\[22m/g, "</span>")
                                      .replace(
                                        /\[2m/g,
                                        '<span class="opacity-70">'
                                      ),
                                  }}
                                />
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatDate(log.createdAt)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground py-8">
                          No logs available
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetail;
