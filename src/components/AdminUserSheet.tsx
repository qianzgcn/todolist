"use client";

import React, { useState, useCallback } from "react";
import { Users, KeyRound, Check, RefreshCw, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { getUsersAction, adminResetPasswordAction } from "@/app/actions/authActions";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface UserItem {
  id: string;
  username: string;
  role: string;
  createdAt: string;
}

interface AdminUserSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminUserSheet({ open, onOpenChange }: AdminUserSheetProps) {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 重置密码弹窗状态
  const [resetTarget, setResetTarget] = useState<UserItem | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getUsersAction();
      setUsers(data);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "获取用户列表失败");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSheetOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (nextOpen) void fetchUsers();
  };

  const handleOpenResetModal = (user: UserItem) => {
    setResetTarget(user);
    setNewPassword("");
    setResetError(null);
    setResetSuccess(null);
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;

    setResetError(null);
    setResetSuccess(null);
    setIsResetting(true);

    try {
      await adminResetPasswordAction(resetTarget.id, newPassword);
      setResetSuccess(`成功将用户 “${resetTarget.username}” 的密码重置为新密码！`);
    } catch (error: unknown) {
      setResetError(error instanceof Error ? error.message : "密码重置失败");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
        <Sheet open={open} onOpenChange={handleSheetOpenChange}>
        <SheetContent side="right" showCloseButton={true} className="w-full sm:max-w-md p-6 flex flex-col h-full">
          <SheetHeader className="pb-4 border-b border-slate-200 dark:border-slate-800">
            <SheetTitle className="flex items-center gap-2 text-lg font-bold">
              <Users className="size-5 text-blue-600 dark:text-blue-400" />
              <span>用户管理中心</span>
            </SheetTitle>
            <SheetDescription className="text-xs text-slate-500">
              管理员专属功能：查看系统用户列表并协助重置密码
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">用户列表 ({users.length})</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchUsers}
                disabled={isLoading}
                className="h-7 text-xs gap-1 cursor-pointer"
              >
                <RefreshCw className={`size-3 ${isLoading ? "animate-spin" : ""}`} />
                <span>刷新</span>
              </Button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
                {error}
              </div>
            )}

            {users.map((user) => (
              <div
                key={user.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {user.username}
                    </span>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] px-1.5 py-0 border-0 ${
                        user.role === "ADMIN"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 font-medium"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300"
                      }`}
                    >
                      {user.role === "ADMIN" ? "管理员" : "普通用户"}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    注册于 {format(new Date(user.createdAt), "yyyy-MM-dd HH:mm")}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenResetModal(user)}
                  className="h-8 px-2.5 text-xs text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-950/50 shrink-0 cursor-pointer"
                >
                  <KeyRound className="size-3.5 mr-1" />
                  <span>重置密码</span>
                </Button>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* 🔑 重置密码 Dialog */}
      <Dialog open={!!resetTarget} onOpenChange={(v) => !v && setResetTarget(null)}>
        <DialogContent showCloseButton={true}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <KeyRound className="size-5 text-blue-600" />
              <span>重置用户密码</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              正在为用户 <strong className="text-slate-900 dark:text-slate-100">{resetTarget?.username}</strong> 设置新密码
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmResetPassword} className="space-y-4 pt-2">
            {resetError && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
                {resetError}
              </div>
            )}

            {resetSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs border border-emerald-200 flex items-center gap-1.5">
                <Check className="size-4 shrink-0" />
                <span>{resetSuccess}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="new-password">新密码</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="请输入新密码（至少 6 位）"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title={showNewPassword ? "隐藏密码" : "显示明文密码"}
                >
                  {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button type="button" variant="outline" onClick={() => setResetTarget(null)}>
                取消
              </Button>
              <Button type="submit" disabled={isResetting || !newPassword.trim()}>
                {isResetting ? "重置中..." : "确认重置"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
