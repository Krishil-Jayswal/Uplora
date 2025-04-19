import Navbar from "../components/Navbar";
import AuthForm from "../components/AuthForm";
import Footer from "../components/Footer";
import { useAuthStore } from "@/stores/authStore";

const Signup = () => {
  const { signup, isSigningUp } = useAuthStore();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center pb-16 pt-16">
        <div className="w-full max-w-md animate-fade-in">
          <AuthForm type="signup" onSuccess={signup} isLoading={isSigningUp} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Signup;
