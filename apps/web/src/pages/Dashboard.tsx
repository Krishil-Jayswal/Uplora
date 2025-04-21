import { useState } from "react";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";
import ProjectCardSkeleton from "../components/ProjectCardSkeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search } from "lucide-react";
import { useProjects } from "../hooks/useProjects";
import { toast } from "sonner";

type StatusTab =
  | "all"
  | "cloning"
  | "cloned"
  | "deploying"
  | "deployed"
  | "failed";

function mapStatus(status: string): StatusTab {
  const lookup: Record<string, StatusTab> = {
    CLONING: "cloning",
    CLONED: "cloned",
    DEPLOYING: "deploying",
    DEPLOYED: "deployed",
    FAILED: "failed",
  };
  return lookup[status.toUpperCase()] ?? "all";
}

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const { projects, isLoading, error } = useProjects();
  console.log(projects);
  let filteredProjects = projects || [];
  if (searchQuery) {
    filteredProjects = filteredProjects.filter((project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  if (activeTab !== "all") {
    filteredProjects = filteredProjects.filter(
      (project) => mapStatus(project.status) === activeTab
    );
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value as StatusTab);
  };

  const handleNewProject = () => {
    toast.info("New project feature coming soon!");
  };

  const skeletonArray = Array(6).fill(0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div className="animate-fade-in">
              <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
              <p className="text-muted-foreground mt-1">
                Deploy and manage your React applications
              </p>
            </div>
            <Button
              className="flex items-center group transition-all duration-300 hover:scale-105"
              onClick={handleNewProject}
            >
              <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90 duration-300" />
              New Project
            </Button>
          </div>
          <div className="flex flex-col space-y-4">
            <div
              className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in"
              style={{ animationDelay: "100ms" }}
            >
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search projects..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Tabs
                defaultValue="all"
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full sm:w-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="cloning">Cloning</TabsTrigger>
                  <TabsTrigger value="cloned">Cloned</TabsTrigger>
                  <TabsTrigger value="deploying">Deploying</TabsTrigger>
                  <TabsTrigger value="deployed">Live</TabsTrigger>
                  <TabsTrigger value="failed">Failed</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            {isLoading ? (
              <div
                className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in"
                style={{ animationDelay: "200ms" }}
              >
                {skeletonArray.map((_, index) => (
                  <ProjectCardSkeleton key={index} />
                ))}
              </div>
            ) : error ? (
              <Card
                className="mt-4 animate-fade-in"
                style={{ animationDelay: "200ms" }}
              >
                <CardHeader>
                  <CardTitle>Error loading projects</CardTitle>
                  <CardDescription>
                    {(error as Error).message || "Could not fetch projects."}
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : filteredProjects.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project, index) => (
                  <div
                    key={project.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${200 + index * 50}ms` }}
                  >
                    <ProjectCard
                      id={project.id}
                      name={project.name}
                      status={
                        mapStatus(project.status) === "deployed"
                          ? "live"
                          : mapStatus(project.status) === "deploying"
                            ? "building"
                            : mapStatus(project.status) === "failed"
                              ? "failed"
                              : "building"
                      }
                      slug={project.slug}
                      github_url={project.github_url}
                      createdAt={project.createdAt}
                      updatedAt={project.updatedAt || project.createdAt}
                      userId={project.userId}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card
                className="mt-4 animate-fade-in"
                style={{ animationDelay: "200ms" }}
              >
                <CardHeader>
                  <CardTitle>No projects found</CardTitle>
                  <CardDescription>
                    {searchQuery
                      ? "Try adjusting your search query."
                      : "Get started by creating your first project."}
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button onClick={handleNewProject}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create a new project
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
