import fs from 'fs';
import path from 'path';
import os from 'os';

export function getStorageDir(): string {
  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT ||
    process.env.NETLIFY
  );

  if (isServerless) {
    const tmpDataDir = path.join(os.tmpdir(), 'quickpostly_data');
    try {
      if (!fs.existsSync(tmpDataDir)) {
        fs.mkdirSync(tmpDataDir, { recursive: true });
      }
    } catch {
      // Ignore
    }
    return tmpDataDir;
  }

  const localDir = path.join(process.cwd(), '.data');
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    return localDir;
  } catch {
    // If process.cwd() is read-only, fallback to os.tmpdir()
    const tmpFallback = path.join(os.tmpdir(), 'quickpostly_data');
    try {
      if (!fs.existsSync(tmpFallback)) fs.mkdirSync(tmpFallback, { recursive: true });
      return tmpFallback;
    } catch {
      return localDir;
    }
  }
}

export function getStoreFilePath(fileName: string): string {
  const dir = getStorageDir();
  const targetPath = path.join(dir, fileName);

  // If in serverless and file does not yet exist in tmp directory, copy from bundled .data if available
  const defaultLocalFile = path.join(process.cwd(), '.data', fileName);
  if (targetPath !== defaultLocalFile && !fs.existsSync(targetPath)) {
    try {
      if (fs.existsSync(defaultLocalFile)) {
        const content = fs.readFileSync(defaultLocalFile, 'utf-8');
        fs.writeFileSync(targetPath, content, 'utf-8');
      }
    } catch {
      // Fallback
    }
  }

  return targetPath;
}

export function safeWriteJson(filePath: string, data: unknown): void {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tempFile = `${filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, filePath);
  } catch {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch {
      // Memory store remains updated even if disk write is not allowed
    }
  }
}
