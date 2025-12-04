import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const { user, handleLogout } = useAuth();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Bem-vindo, {user?.name}!</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Sair
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Nome:</strong> {user?.name}
              </p>
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
              <p>
                <strong>Cidade:</strong> {user?.city}
              </p>
              <p>
                <strong>Provider:</strong> {user?.provider}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Em breve</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Dados climáticos...</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Em breve</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Pokémons sugeridos...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
