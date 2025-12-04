import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import authService from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, MapPin } from "lucide-react";

export default function CompleteRegistration() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setToken, setUser } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [city, setCity] = useState("");

  const tempToken = searchParams.get("token");
  const name = searchParams.get("name");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!tempToken || !name || !email) {
      toast.error("Erro", {
        description: "Link inválido ou expirado",
      });
      navigate("/login");
    }
  }, [tempToken, name, email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tempToken) return;

    setIsLoading(true);

    try {
      const response = await authService.completeGoogleRegistration({
        tempToken,
        city,
      });

      // Salvar token PRIMEIRO
      setToken(response.access_token);

      // Depois salvar user
      setUser(response.user);
      localStorage.setItem("user", JSON.stringify(response.user));

      toast("Cadastro completado!", {
        description: "Bem-vindo ao Weather Dashboard!",
      });

      // Pequeno delay para garantir que o state foi atualizado
      setTimeout(() => {
        navigate("/dashboard");
      }, 100);
    } catch (error: any) {
      toast("Erro ao completar cadastro", {
        description: error.response?.data?.message || "Tente novamente",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo, {name}! 👋</CardTitle>
            <CardDescription>
              Para completar seu cadastro, informe sua localização
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Email:</p>
                <p className="font-medium">{email}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Cidade
                </Label>
                <Input
                  id="city"
                  placeholder="São Paulo"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  minLength={2}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Usaremos sua cidade para coletar dados climáticos
                  personalizados
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Finalizar Cadastro
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
