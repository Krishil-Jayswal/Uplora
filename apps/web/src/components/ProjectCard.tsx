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
import { toast } from "sonner";

interface ProjectCardProps {
  id: string;
  name: string;
  status: "live" | "building" | "failed";
  slug: string;
  github_url?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

const ProjectCard = ({
  id,
  name,
  status,
  slug,
  github_url,
  updatedAt,
  createdAt,
}: ProjectCardProps) => {
  const getStatusBadge = () => {
    switch (status) {
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
      return new Date(dateStr).toLocaleString();
    } catch (e) {
      console.error("Error formatting date: ", e);
      return dateStr;
    }
  };

  const deployUrl = `http://${slug}.localhost:5002`;

  const handleDropdownAction = (action: string) => {
    toast.info(`${action} action will be implemented soon!`);
  };

  console.log(id, createdAt);

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md hover:shadow-accent/5 hover:scale-[1.02] duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <div className="font-bold">{name}</div>
          {getStatusBadge()}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem onClick={() => handleDropdownAction("Settings")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDropdownAction("Rebuild")}>
              Rebuild
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500"
              onClick={() => handleDropdownAction("Delete")}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="pb-2">
        {github_url && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-1 group">
            <Github className="h-3.5 w-3.5 group-hover:text-foreground transition-colors" />
            <a
              href={github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground truncate max-w-[200px] transition-colors"
            >
              {github_url.replace("https://github.com/", "")}
            </a>
          </div>
        )}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1 group">
          <Clock className="h-3.5 w-3.5 group-hover:text-foreground transition-colors" />
          <span className="group-hover:text-foreground transition-colors">
            Updated {formattedDate(updatedAt)}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          className="w-full transition-all hover:bg-primary hover:text-primary-foreground duration-300 group"
          asChild
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
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
