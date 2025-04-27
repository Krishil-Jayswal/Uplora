import Navbar from "@/components/Navbar";
import NewProjectForm from "@/components/NewProjectForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NewProject = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 p-6 relative">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px] -z-10" />
        <div className="absolute -z-10 inset-0">
          <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary/5 to-transparent" />
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="mb-6 animate-fade-in">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Dashboard
            </Button>
          </div>
          <div
            className="mb-8 animate-fade-in"
            style={{ animationDelay: "100ms" }}
          >
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Deploy New Project
            </h1>
            <p className="text-muted-foreground mt-3 text-lg">
              Add your GitHub repository to start deploying. We'll handle the
              rest.
            </p>
          </div>
          <NewProjectForm />
        </div>
      </main>
    </div>
  );
};

export default NewProject;
