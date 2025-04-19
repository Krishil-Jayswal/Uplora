import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { LoginProps, SignupProps } from "@repo/validation";

type AuthFormProps =
  | {
      type: "login";
      onSuccess: (email: string, password: string) => Promise<void>;
      isLoading: boolean;
    }
  | {
      type: "signup";
      onSuccess: (
        name: string,
        email: string,
        password: string
      ) => Promise<void>;
      isLoading: boolean;
    };

const loginIntialState: LoginProps = { email: "", password: "" };
const signupInitialState: SignupProps = { name: "", email: "", password: "" };

const AuthForm = ({ type, onSuccess, isLoading = false }: AuthFormProps) => {
  const [formProps, setFormProps] = useState<LoginProps | SignupProps>(
    type === "login" ? loginIntialState : signupInitialState
  );
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setFormProps(type === "login" ? loginIntialState : signupInitialState);
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (type === "login") {
      const { email, password } = formProps as LoginProps;
      if (!email || !password) {
        toast("Missing information", {
          description: "Please fill in all required fields",
        });
        return;
      }
      onSuccess(email, password);
    }

    if (type === "signup") {
      const { name, email, password } = formProps as SignupProps;
      if (!name || !email || !password) {
        toast("Missing information", {
          description: "Please fill in all required fields",
        });
        return;
      }
      onSuccess(name, email, password);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-8 px-4">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-foreground">
          {type === "login" ? "Sign in to your account" : "Create your account"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {type === "login" ? (
            <>
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-primary hover:text-primary/80"
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-primary hover:text-primary/80"
              >
                Sign in
              </Link>
            </>
          )}
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4 rounded-md shadow-2xs">
          {type === "signup" && (
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={(formProps as SignupProps).name}
                onChange={(e) =>
                  setFormProps({ ...formProps, name: e.target.value })
                }
                placeholder="Your name"
                className="mt-1"
                disabled={isLoading}
              />
            </div>
          )}
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formProps.email}
              onChange={(e) =>
                setFormProps({ ...formProps, email: e.target.value })
              }
              placeholder="you@example.com"
              className="mt-1"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={
                  type === "login" ? "current-password" : "new-password"
                }
                required
                value={formProps.password}
                onChange={(e) =>
                  setFormProps({ ...formProps, password: e.target.value })
                }
                placeholder="••••••••"
                className="mt-1"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[calc(50%+2px)] -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {type === "login" && (
          <div className="flex items-center justify-end">
            <div className="text-sm">
              <Link
                to="#"
                className="font-medium text-primary hover:text-primary/80"
              >
                Forgot your password?
              </Link>
            </div>
          </div>
        )}

        <div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </span>
            ) : type === "login" ? (
              "Sign in"
            ) : (
              "Create account"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
