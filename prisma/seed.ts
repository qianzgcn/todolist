import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { databaseUrl } from "../src/lib/database-url";
import { resetDatabase } from "../src/lib/seed-data";

const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
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
