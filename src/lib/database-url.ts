if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile();
  } catch {
    // Ignore if .env file is missing
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL 未配置");
}

export const databaseUrl = process.env.DATABASE_URL;
const url = new URL(databaseUrl);

if (url.protocol !== "mysql:") {
  throw new Error("DATABASE_URL 必须使用 mysql:// 协议");
}

export const databaseAdapterConfig = {
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: decodeURIComponent(url.pathname.slice(1)),
  connectTimeout: 10_000,
  // ponytail: encrypt public traffic; enable strict verification after installing a hostname-valid certificate.
  ssl: { rejectUnauthorized: false },
};
