import { connection } from "next/server";
import { TodoApp } from "@/components/TodoApp";
import { getTodoData } from "@/lib/todo-data";

export default async function HomePage() {
  await connection();
  const initialData = await getTodoData();

  return <TodoApp initialData={initialData} />;
}
