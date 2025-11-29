import { getTasks } from "@/lib/actions/tasks";
import { TaskList } from "@/components/task-list";

export default async function TasksPage() {
  const result = await getTasks();
  const tasks = result.success ? result.data || [] : [];

  return <TaskList tasks={tasks} />;
}

