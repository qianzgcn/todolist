"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, User, AlertCircle, Eye, EyeOff } from "lucide-react";
import { registerAction } from "@/app/actions/authActions";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    setIsSubmitting(true);

    try {
      await registerAction({ username, password, confirmPassword });
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "注册失败，请重新尝试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 overflow-hidden p-4 select-none">
      {/*  苹果风沉浸式背景柔光 */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[500px] rounded-full bg-gradient-to-tr from-emerald-400/20 via-teal-300/15 to-blue-300/10 dark:from-emerald-600/15 dark:via-teal-600/10 dark:to-blue-600/5 blur-[120px] pointer-events-none" />

      {/*  平台标题：纯粹苹果极简风 */}
      <div className="relative z-10 text-center mb-10 sm:mb-12">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 font-sans">
          todoList
        </h1>
      </div>

      {/*  沉浸式苹果风毛玻璃卡片 */}
      <div className="relative z-10 w-full max-w-sm bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl backdrop-saturate-150 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            注册账号
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-50/80 dark:bg-red-950/40 text-red-600 dark:text-red-300 text-xs">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
              <input
                type="text"
                autoComplete="off"
                placeholder="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 border-none outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500/40 transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-10 rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 border-none outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500/40 transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title={showPassword ? "隐藏密码" : "显示明文密码"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="确认密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-10 rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 border-none outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500/40 transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title={showConfirmPassword ? "隐藏密码" : "显示明文密码"}
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-medium text-sm rounded-2xl shadow-lg shadow-emerald-500/25 transition-all duration-200 cursor-pointer mt-2"
          >
            {isSubmitting ? "注册中..." : "注册"}
          </Button>

          <div className="text-center pt-2 text-xs text-slate-500 dark:text-slate-400">
            已有账号？{" "}
            <Link
              href="/login"
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
            >
              返回登录
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
