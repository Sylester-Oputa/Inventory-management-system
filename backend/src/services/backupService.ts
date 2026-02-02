import { promisify } from "node:util";
import { execFile } from "node:child_process";
import fs from "fs-extra";
import path from "path";
import { env } from "../config/env";
import { buildError } from "../utils/errors";

const execFileAsync = promisify(execFile);

// Try to find pg_dump in common locations
function getPgDumpPath(): string {
  const possiblePaths = [
    "pg_dump", // If in PATH
    "C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe",
    "C:\\Program Files\\PostgreSQL\\15\\bin\\pg_dump.exe",
    "C:\\Program Files\\PostgreSQL\\14\\bin\\pg_dump.exe",
    "C:\\PostgreSQL\\bin\\pg_dump.exe",
  ];

  // For now, just return the first one (from PATH)
  // In production, you'd check which one exists
  return "pg_dump";
}

export async function runBackup() {
  try {
    await fs.ensureDir(env.BACKUP_DIR);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const target = path.join(env.BACKUP_DIR, `backup-${timestamp}.sql`);

    const pgDumpPath = getPgDumpPath();

    try {
      await execFileAsync(pgDumpPath, [
        "--dbname",
        env.DATABASE_URL,
        "--file",
        target,
      ]);
    } catch (execError: any) {
      console.error("pg_dump error:", execError);
      throw buildError(
        500,
        `Backup failed: ${execError.message}. Make sure PostgreSQL tools (pg_dump) are installed and in PATH.`,
      );
    }

    return { path: target };
  } catch (error: any) {
    if (error.statusCode) throw error; // Re-throw if already a structured error
    console.error("Backup error:", error);
    throw buildError(500, `Backup failed: ${error.message}`);
  }
}

async function findLatestBackup() {
  if (!(await fs.pathExists(env.BACKUP_DIR))) {
    return null;
  }
  const files = await fs.readdir(env.BACKUP_DIR);
  const sqlFiles = files
    .filter((file): file is string => file.endsWith(".sql"))
    .map((file) => path.join(env.BACKUP_DIR, file));
  if (!sqlFiles.length) {
    return null;
  }
  const sorted = await Promise.all(
    sqlFiles.map(async (filePath) => ({
      filePath,
      mtime: (await fs.stat(filePath)).mtime.getTime(),
    })),
  );
  sorted.sort((a, b) => b.mtime - a.mtime);
  return sorted[0].filePath;
}

export async function exportBackup(targetDir: string, sourcePath?: string) {
  const resolvedTargetDir = path.resolve(targetDir);
  const source = sourcePath
    ? path.resolve(sourcePath)
    : await findLatestBackup();
  if (!source) {
    throw buildError(404, "backup-not-found");
  }
  if (!(await fs.pathExists(source))) {
    throw buildError(404, "backup-not-found");
  }
  const targetExists = await fs.pathExists(resolvedTargetDir);
  if (!targetExists) {
    throw buildError(400, "target-path-not-found");
  }
  const destination = path.join(resolvedTargetDir, path.basename(source));
  await fs.copyFile(source, destination);
  return { path: destination };
}

export async function restoreBackup(backupPath: string, confirmation: boolean) {
  try {
    if (!confirmation) {
      throw buildError(400, "confirmation-required");
    }
    const resolvedPath = path.resolve(backupPath);
    if (!(await fs.pathExists(resolvedPath))) {
      throw buildError(404, "backup-not-found");
    }

    try {
      await execFileAsync("psql", [
        "--dbname",
        env.DATABASE_URL,
        "--file",
        resolvedPath,
      ]);
    } catch (execError: any) {
      console.error("psql error:", execError);
      throw buildError(
        500,
        `Restore failed: ${execError.message}. Make sure PostgreSQL tools (psql) are installed and in PATH.`,
      );
    }

    return { restored: true, path: resolvedPath };
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error("Restore error:", error);
    throw buildError(500, `Restore failed: ${error.message}`);
  }
}
