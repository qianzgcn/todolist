import { connection } from "next/server";
import { TodoApp } from "@/components/TodoApp";
import { getTodoData } from "@/lib/todo-data";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  await connection();
  const user = await getCurrentUser();
  const initialData = await getTodoData();

  return <TodoApp user={user} initialData={initialData} />;
}
