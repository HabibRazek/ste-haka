import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  ListTodo,
  CalendarClock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTaskStats, getTasks } from "@/lib/actions/tasks";
import { Badge } from "@/components/ui/badge";
import { Priority } from "@prisma/client";

interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: Priority;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  memberId: string | null;
  member: {
    id: string;
    name: string;
    email: string;
    role: string | null;
  } | null;
}

export default async function Dashboard() {
  const [statsResult, tasksResult] = await Promise.all([
    getTaskStats(),
    getTasks(),
  ]);

  const stats = statsResult.success ? statsResult.data : null;
  const tasks = tasksResult.success ? tasksResult.data : [];

  // Get recent tasks (last 5)
  const recentTasks: Task[] = tasks?.slice(0, 5) || [];

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Bienvenue! Voici un aperçu de vos tâches.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total tâches</CardTitle>
            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <ListTodo className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-3xl font-bold">{stats?.total || 0}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 truncate">
              Toutes les tâches
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Terminées</CardTitle>
            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-3xl font-bold">
              {stats?.completed || 0}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 truncate">
              {stats?.completionRate || 0}% achèvement
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">En cours</CardTitle>
            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-3xl font-bold">
              {stats?.pending || 0}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 truncate">
              Tâches en attente
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Priorité haute</CardTitle>
            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-3xl font-bold">
              {stats?.highPriority || 0}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 truncate">
              Tâches urgentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Aujourd&apos;hui</CardTitle>
            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <CalendarClock className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-3xl font-bold">
              {stats?.dueToday || 0}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 truncate">
              Tâches à faire
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">En retard</CardTitle>
            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-3xl font-bold">
              {stats?.overdue || 0}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 truncate">
              Tâches en retard
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg font-semibold">Tâches récentes</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          {recentTasks.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-muted-foreground">
              <ListTodo className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 opacity-30" />
              <p className="text-xs sm:text-sm">Aucune tâche. Créez votre première tâche!</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-accent/30 transition-all gap-2"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div
                      className={`h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full shrink-0 ${
                        task.completed
                          ? "bg-primary"
                          : task.priority === "HIGH"
                          ? "bg-foreground"
                          : task.priority === "MEDIUM"
                          ? "bg-muted-foreground"
                          : "bg-border"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm sm:text-base font-medium truncate ${
                          task.completed
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-5 sm:ml-0 shrink-0">
                    <Badge
                      variant={
                        task.priority === "HIGH"
                          ? "default"
                          : "outline"
                      }
                      className="text-[10px] sm:text-xs"
                    >
                      {task.priority === "HIGH" ? "Haute" : task.priority === "MEDIUM" ? "Moyenne" : "Basse"}
                    </Badge>
                    {task.completed && (
                      <Badge variant="outline" className="border-primary text-primary text-[10px] sm:text-xs">Terminée</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
