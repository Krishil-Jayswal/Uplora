
import { Code, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    name: 'Zero Configuration',
    description: 'No need for complex configuration. We automatically detect your React project settings.',
    longDescription: 'Focus on your code, not on deployment configuration. Uplora automatically detects your React project structure and dependencies, then sets up the optimal deployment environment. No configuration files to manage or complicated CLI commands to remember.',
    icon: Code,
    color: 'bg-purple-500/20 text-purple-500',
  },
  {
    name: 'Secure by Default',
    description: 'All deployments are secured with SSL certificates automatically. HTTPS is enforced.',
    longDescription: 'Your applications are secure from day one. Every deployment comes with automatic SSL certificate provisioning and HTTPS enforcement. We handle certificate renewal and security best practices so you don\'t have to worry about it.',
    icon: Shield,
    color: 'bg-blue-500/20 text-blue-500',
  }
];

const Features = () => {
  return (
    <div id="features" className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-accent">Deploy faster</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to deploy your React apps
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Focus on your code, not on your infrastructure. Our platform makes it effortless to deploy, scale, and secure your React applications.
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-6xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {features.map((feature) => (
              <Card 
                key={feature.name}
                className="border border-border transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className={`rounded-lg p-2 w-12 h-12 flex items-center justify-center mb-4 ${feature.color}`}>
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-xl">{feature.name}</CardTitle>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {feature.longDescription}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="mx-auto mt-16 max-w-2xl border border-border rounded-lg p-8 bg-secondary/30">
          <h3 className="text-xl font-semibold mb-4">Getting Started Locally</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">1. Clone the repository</h4>
              <div className="bg-secondary p-3 rounded-md font-mono text-sm overflow-x-auto">
                git clone https://github.com/your-username/uplora.git
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">2. Navigate to the project directory</h4>
              <div className="bg-secondary p-3 rounded-md font-mono text-sm">
                cd uplora
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">3. Install dependencies</h4>
              <div className="bg-secondary p-3 rounded-md font-mono text-sm">
                npm install
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">4. Start the development server</h4>
              <div className="bg-secondary p-3 rounded-md font-mono text-sm">
                npm run dev
              </div>
            </div>
            
            <div className="mt-4 text-muted-foreground">
              Your app will be available at <span className="font-semibold">http://localhost:5173</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
