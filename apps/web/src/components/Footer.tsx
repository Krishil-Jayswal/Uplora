import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">
            <span className="sr-only">GitHub</span>
            <Github className="h-5 w-5" />
          </Link>
          <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">
            <span className="sr-only">Twitter</span>
            <Twitter className="h-5 w-5" />
          </Link>
          <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">
            <span className="sr-only">LinkedIn</span>
            <Linkedin className="h-5 w-5" />
          </Link>
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <div className="flex justify-center space-x-6 mb-4">
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link to="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Documentation
            </Link>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
          </div>
          <p className="text-center text-xs leading-5 text-muted-foreground">
            &copy; 2025 Uplora, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
