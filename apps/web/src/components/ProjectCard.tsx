import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, ExternalLink, Clock, Github } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Project } from "@repo/validation";

type ProjectCardProps = Omit<Project, "createdAt" | "githubUrl" | "status"> & {
  createdAt: string;
  updatedAt: string;
  github_url?: string;
  status: "live" | "building" | "failed";
};

const ProjectCard = (project: ProjectCardProps) => {
  const getStatusBadge = () => {
    switch (project.status) {
      case "live":
        return <Badge className="bg-green-500">Live</Badge>;
      case "building":
        return (
          <Badge className="bg-amber-500">
            <span className="flex items-center">
              Building
              <span className="ml-1 flex space-x-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-background animate-[pulse_1.5s_ease-in-out_infinite]"></span>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-background animate-[pulse_1.5s_ease-in-out_0.5s_infinite]"></span>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-background animate-[pulse_1.5s_ease-in-out_1s_infinite]"></span>
              </span>
            </span>
          </Badge>
        );
      case "failed":
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return null;
    }
  };

  const formattedDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM d, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateStr;
    }
  };

  const deployUrl =
    import.meta.env.MODE === "development"
      ? `http://${project.slug}.localhost:5002`
      : `https://${project.slug}.uplora-app.metaops.fun`;

  const handleDropdownAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info(`${action} action will be implemented soon!`);
  };

  const handleDropdownTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleExternalLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md hover:shadow-accent/5 hover:scale-[1.02] duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <div className="font-bold">{project.name}</div>
          {getStatusBadge()}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={handleDropdownTriggerClick}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem
              onClick={(e) => handleDropdownAction("Settings", e)}
            >
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => handleDropdownAction("Rebuild", e)}
            >
              Rebuild
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500"
              onClick={(e) => handleDropdownAction("Delete", e)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="pb-2">
        {project.github_url && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-1 group">
            <Github className="h-3.5 w-3.5 group-hover:text-foreground transition-colors" />
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground truncate max-w-[200px] transition-colors"
              onClick={handleExternalLinkClick}
            >
              {project.github_url.replace("https://github.com/", "")}
            </a>
          </div>
        )}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1 group">
          <Clock className="h-3.5 w-3.5 group-hover:text-foreground transition-colors" />
          <span className="group-hover:text-foreground transition-colors">
            Updated {formattedDate(project.updatedAt)}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        {project.status === "live" && (
          <Button
            variant="outline"
            size="sm"
            className="w-full transition-all hover:bg-primary hover:text-primary-foreground duration-300 group"
            asChild
            onClick={handleExternalLinkClick}
          >
            <a
              href={deployUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center"
            >
              <span>Visit site</span>
              <ExternalLink className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </Button>
        )}
        {project.status !== "live" && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            disabled={true}
          >
            {project.status === "building" ? "Building..." : "Not available"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
