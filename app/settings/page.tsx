import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground mt-1">
          Gérez les préférences de votre espace de travail.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Bientôt disponible
          </CardTitle>
          <CardDescription>
            Les paramètres et préférences seront disponibles dans une future mise à jour.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Cette page inclura des options pour personnaliser votre espace de travail,
            gérer les notifications et configurer les paramètres de votre compte.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

