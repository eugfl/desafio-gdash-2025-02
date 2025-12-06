import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Cloud, LogOut, User, RefreshCw, Users, Sun, Moon } from "lucide-react";
import { ProfileDialog } from "@/components/Profile/ProfileDialog";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  onRefresh?: () => void;
}

export function Navbar({ onRefresh }: NavbarProps) {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    const stored = sessionStorage.getItem("darkmode");
    const isDark = stored === "true";
    if (isDark) document.documentElement.classList.add("dark");
    return isDark;
  });

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      sessionStorage.setItem("darkmode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      sessionStorage.setItem("darkmode", "false");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <nav className="border-b bg-background transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div>
              <a className="flex items-center gap-2" href="/dashboard">
                <Cloud className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-xl font-bold">Weather Dashboard</h1>
                  <p className="text-xs text-muted-foreground">
                    {user?.city || "Carregando..."}
                  </p>
                </div>
              </a>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <Button
                className="cursor-pointer"
                variant="outline"
                size="icon"
                onClick={toggleDarkMode}
                title="Alternar tema"
              >
                {darkMode ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>

              {/* Refresh Button */}
              {onRefresh && (
                <Button
                  className="cursor-pointer"
                  variant="outline"
                  size="icon"
                  onClick={onRefresh}
                  title="Atualizar dados"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full cursor-pointer"
                  >
                    <Avatar>
                      <AvatarImage src={user?.picture} alt={user?.name} />
                      <AvatarFallback>
                        {user?.name ? getInitials(user.name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setProfileOpen(true)}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Meu Perfil</span>
                  </DropdownMenuItem>

                  {user?.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => navigate("/users")}
                        className="cursor-pointer"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        <span>Gerenciar Usuários</span>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
}
