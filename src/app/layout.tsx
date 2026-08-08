import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "todoList",
  description: "基于 Next.js, Prisma 7 与 SQLite 构建的个人任务清单应用",
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
