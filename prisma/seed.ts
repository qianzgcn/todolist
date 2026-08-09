import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { databaseUrl } from "../src/lib/database-url";
import { resetDatabase } from "../src/lib/seed-data";

const adapter = new PrismaMariaDb(databaseUrl);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$transaction((transaction) => resetDatabase(transaction));

  console.log("数据库 Seed 初始化成功，已预置 10 条示例任务与分类！");
}

main()
  .catch((e) => {
    console.error("Seed 脚本运行失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
