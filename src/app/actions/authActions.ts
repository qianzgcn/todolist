"use server";

import { prisma } from "@/lib/prisma";
import {
  comparePassword,
  createAuthToken,
  hashPassword,
  setAuthCookie,
  clearAuthCookie,
  getCurrentUser,
  type UserRole,
} from "@/lib/auth";
import { readRequiredId, readRequiredText } from "@/lib/todo-validation";

type AuthActionFailure = { success: false; error: string };

function toSession(user: {
  id: string;
  username: string;
  role: string;
}) {
  if (user.role !== "ADMIN" && user.role !== "USER") {
    throw new Error("用户角色无效");
  }

  return {
    userId: user.id,
    username: user.username,
    role: user.role as UserRole,
  };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "";
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function loginAction(formData: {
  username?: string;
  password?: string;
}) {
  try {
    const username = readRequiredText(formData.username, "用户名", 50);
    const password = readRequiredText(formData.password, "密码", 100);

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new Error("用户名或密码错误");
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new Error("用户名或密码错误");
    }

    const session = toSession(user);

    const token = await createAuthToken(session);
    await setAuthCookie(token);

    return { success: true, user: session };
  } catch (error: unknown) {
    const message = errorMessage(error);
    if (message === "用户名或密码错误" || message.includes("不能为空")) {
      return { success: false, error: message } satisfies AuthActionFailure;
    }
    // 捕获未预料的系统内部异常，防范敏感堆栈泄露
    console.error("[Login Internal Error]:", error);
    return { success: false, error: "登录失败，请稍后重试" } satisfies AuthActionFailure;
  }
}

export async function registerAction(formData: {
  username?: string;
  password?: string;
  confirmPassword?: string;
}) {
  try {
    const username = readRequiredText(formData.username, "用户名", 50);
    const password = readRequiredText(formData.password, "密码", 100);
    const confirmPassword = readRequiredText(formData.confirmPassword, "确认密码", 100);

    if (username.length < 2) {
      throw new Error("用户名至少需要 2 个字符");
    }

    if (password.length < 6) {
      throw new Error("密码至少需要 6 个字符");
    }

    if (password !== confirmPassword) {
      throw new Error("两次输入的密码不一致");
    }

    const existing = await prisma.user.findUnique({
      where: { username },
    });

    if (existing) {
      throw new Error("用户名已被占用");
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: "USER",
      },
    });

    const session = toSession(user);

    const token = await createAuthToken(session);
    await setAuthCookie(token);

    return { success: true, user: session };
  } catch (error: unknown) {
    const message = errorMessage(error);
    if (
      message === "用户名已被占用" ||
      message === "两次输入的密码不一致" ||
      message.includes("至少需要") ||
      message.includes("不能为空") ||
      isUniqueConstraintError(error)
    ) {
      if (isUniqueConstraintError(error)) {
        return { success: false, error: "用户名已被占用" } satisfies AuthActionFailure;
      }
      return { success: false, error: message } satisfies AuthActionFailure;
    }
    console.error("[Register Internal Error]:", error);
    return { success: false, error: "注册失败，请稍后重试" } satisfies AuthActionFailure;
  }
}

export async function logoutAction() {
  await clearAuthCookie();
  return { success: true };
}

export async function getUsersAction() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    throw new Error("无权访问用户列表");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });

  return users.map((u) => ({
    id: u.id,
    username: u.username,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
  }));
}

export async function adminResetPasswordAction(
  targetUserId: string,
  newPassword?: string
) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    throw new Error("仅管理员可重置密码");
  }

  const userId = readRequiredId(targetUserId);

  const password = readRequiredText(newPassword, "新密码", 100);
  if (password.length < 6) {
    throw new Error("新密码至少需要 6 个字符");
  }

  const hashedPassword = await hashPassword(password);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { success: true };
}
