import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import userService from "@/services/user.service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, User as UserIcon, Lock } from "lucide-react";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Form de perfil
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    city: user?.city || "",
  });

  // Form de senha
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name,
        city: user.city,
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const oldCity = user?.city;
    const cityChanged = oldCity !== profileForm.city;

    try {
      const updatedUser = await userService.updateProfile(profileForm);

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      onOpenChange(false);

      if (cityChanged) {
        toast("Perfil atualizado! 🌤️", {
          description: "Coletando dados climáticos da nova cidade...",
          duration: 3000,
        });

        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        toast("Perfil atualizado!", {
          description: "Suas informações foram atualizadas com sucesso",
        });
      }
    } catch (error: any) {
      toast("Erro ao atualizar perfil", {
        description: error.response?.data?.message || "Tente novamente",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar senhas
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast("Erro", {
        description: "As senhas não coincidem",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast("Erro", {
        description: "A nova senha deve ter no mínimo 6 caracteres",
      });
      return;
    }

    setIsLoading(true);

    try {
      await userService.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      toast("Senha atualizada!", {
        description: "Sua senha foi alterada com sucesso",
      });

      // Limpar formulário
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast("Erro ao atualizar senha", {
        description: error.response?.data?.message || "Senha atual incorreta",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Meu Perfil</DialogTitle>
          <DialogDescription>
            Gerencie suas informações pessoais e segurança
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="cursor-pointer">
              <UserIcon className="h-4 w-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="password" className="cursor-pointer">
              <Lock className="h-4 w-4 mr-2" />
              Senha
            </TabsTrigger>
          </TabsList>

          {/* Tab Perfil */}
          <TabsContent value="profile">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  required
                  minLength={2}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  O email não pode ser alterado
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={profileForm.city}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, city: e.target.value })
                  }
                  required
                  minLength={2}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Alterar a cidade atualizará os dados climáticos coletados
                </p>
              </div>

              <div className="space-y-2">
                <Label>Provider</Label>
                <Input
                  value={user?.provider === "local" ? "Email/Senha" : "Google"}
                  disabled
                  className="bg-muted capitalize"
                />
              </div>

              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </form>
          </TabsContent>

          {/* Tab Senha */}
          <TabsContent value="password">
            {user?.provider === "google" ? (
              <div className="text-center py-8">
                <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Você está logado com Google OAuth.
                  <br />
                  Não é possível alterar a senha.
                </p>
              </div>
            ) : (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Senha Atual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Alterar Senha
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
