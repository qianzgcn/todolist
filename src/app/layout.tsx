import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TodoCraft - 优雅极简个人任务清单",
  description: "基于 Next.js 15, Prisma 与 SQLite 构建的高效个人 Web 端 ToDoList 应用",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
