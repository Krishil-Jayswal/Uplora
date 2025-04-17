import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Code, Shield } from "lucide-react";

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-background pb-16 pt-20 sm:pb-24 sm:pt-32">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px] [mask-image:radial-gradient(white,transparent_70%)] -z-10" />
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-7xl overflow-hidden -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-primary/20 rounded-full blur-3xl opacity-20" />
        <div className="absolute top-1/3 right-1/4 w-[25rem] h-[25rem] bg-accent/20 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <h1 className="animate-fade-in text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground sm:text-6xl max-w-3xl">
            Deploy your React apps with <span className="text-gradient bg-clip-text text-transparent bg-linear-to-r from-primary via-accent to-primary inline-block">confidence</span>
          </h1>
          <p className="animate-fade-in-delay-1 mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Ship your React projects to production in seconds. 
            Zero configuration and automatic HTTPS included.
          </p>
          <div className="animate-fade-in-delay-2 mt-10 flex items-center justify-center flex-wrap gap-4">
            <Button asChild size="lg" className="group transition-all duration-300 hover:scale-105 min-w-[160px]">
              <Link to="/signup">
                Get Started 
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="transition-all duration-300 hover:scale-105 min-w-[160px]">
              <Link to="/login">Login</Link>
            </Button>
          </div>
          
          <div className="animate-fade-in-delay-3 mt-8 flex items-center justify-center">
            <div className="flex items-center space-x-2 rounded-full bg-secondary/50 px-4 py-1">
              <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-muted-foreground">2000+ deployments last week</span>
            </div>
          </div>
        </div>
      </div>

      <div className="animate-fade-in-delay-3 mx-auto mt-16 max-w-6xl px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-xl bg-secondary/50 p-8 border border-border shadow-lg transition-all duration-300 hover:shadow-accent/5 hover:border-accent/20 flex flex-col items-center">
            <div className="bg-purple-500/20 text-purple-500 rounded-lg p-4 mb-6">
              <Code className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Zero Configuration</h3>
            <p className="text-center text-muted-foreground">
              No need for complex configuration files or development setup. We automatically detect your React project settings and deploy it instantly.
            </p>
          </div>
          
          <div className="rounded-xl bg-secondary/50 p-8 border border-border shadow-lg transition-all duration-300 hover:shadow-accent/5 hover:border-accent/20 flex flex-col items-center">
            <div className="bg-blue-500/20 text-blue-500 rounded-lg p-4 mb-6">
              <Shield className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Secure by Default</h3>
            <p className="text-center text-muted-foreground">
              All deployments are secured with SSL certificates automatically. HTTPS is enforced to keep your applications and users safe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
