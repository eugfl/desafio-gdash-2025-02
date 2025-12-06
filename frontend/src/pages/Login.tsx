import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { LoginForm } from "@/components/Auth/LoginForm";
import { RegisterForm } from "@/components/Auth/RegisterForm";
import { GoogleButton } from "@/components/Auth/GoogleButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Cloud } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Cloud className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Weather Dashboard
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Dados climáticos com IA + Pokémons
          </p>
        </div>

        {/* Tabs de Login/Registro */}
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger className="cursor-pointer" value="login">
              Login
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="register">
              Registrar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <LoginForm />

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Ou continue com
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <GoogleButton />
              </div>
            </div>
            <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
              <p>
                <a
                  href="/reset-password"
                  className="text-primary hover:underline"
                >
                  Esqueci minha senha
                </a>
              </p>
            </div>
          </TabsContent>

          <TabsContent value="register">
            <RegisterForm />

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Ou continue com
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <GoogleButton />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
