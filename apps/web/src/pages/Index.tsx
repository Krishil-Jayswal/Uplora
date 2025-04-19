import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />

        {/* CTA section */}
        <div className="relative py-24 sm:py-32">
          <div className="absolute inset-0 bg-linear-to-b from-background via-secondary/50 to-background -z-10" />
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-xl text-center">
              <h2 className="text-lg font-semibold leading-8 text-accent">
                Ready to deploy?
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Start deploying your React projects in minutes
              </p>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Join thousands of developers who trust Uplora for their
                deployment needs.
              </p>
              <div className="mt-10">
                <Button
                  asChild
                  size="lg"
                  className="group transition-all duration-300 hover:scale-105"
                >
                  <Link to="/signup">
                    Get Started Now
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
