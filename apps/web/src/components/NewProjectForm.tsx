import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProject } from "@/hooks/useProject";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Github, Loader } from "lucide-react";
import { axiosError } from "@/lib/api-client";

const NewProjectForm = () => {
  const [githubUrl, setGithubUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { deployProject } = useProject();

  const isValidGithubUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return (
        urlObj.hostname === "github.com" &&
        urlObj.pathname.split("/").length >= 3
      );
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidGithubUrl(githubUrl)) {
      toast.error("Invalid GitHub URL", {
        description: "Please enter a valid GitHub repository URL",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { projectId } = await deployProject.mutateAsync(githubUrl);
      toast.success("Project Created", {
        description: "Your project is being deployed...",
      });
      navigate(`/project/${projectId}`);
    } catch (error) {
      const message = error instanceof axiosError ? error.response?.data.message : "Error";
      toast.error(message, {
        description: "Failed to create project. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      className="animate-fade-in shadow-lg border-border/50 backdrop-blur-sm bg-card/50"
      style={{ animationDelay: "200ms" }}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          GitHub Repository
        </CardTitle>
        <CardDescription>
          Enter your repository URL to start the deployment process
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Input
                type="url"
                placeholder="https://github.com/username/repository"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="pl-4 h-12 bg-background/50 transition-all border-border/50 focus:border-primary/50 focus:ring-primary/20"
                pattern="https://github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+"
                title="Please enter a valid GitHub repository URL"
                required
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !githubUrl}
              className="h-12 font-medium transition-all"
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Creating Project...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewProjectForm;
