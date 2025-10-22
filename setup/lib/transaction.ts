// トランザクション管理

import { existsSync } from "node:fs";
import { copyFile, rename, unlink } from "node:fs/promises";

interface Transaction {
  files: string[];
  backups: Map<string, string>;
}

/**
 * トランザクション開始
 */
export function beginTransaction(): Transaction {
  return {
    files: [],
    backups: new Map(),
  };
}

/**
 * ファイル作成を記録
 */
export function trackFile(transaction: Transaction, filePath: string) {
  transaction.files.push(filePath);
}

/**
 * 既存ファイルのバックアップ
 */
export async function backupFile(transaction: Transaction, filePath: string) {
  if (existsSync(filePath)) {
    const backupPath = `${filePath}.backup`;
    await copyFile(filePath, backupPath);
    transaction.backups.set(filePath, backupPath);
  }
}

/**
 * トランザクションコミット（バックアップ削除）
 */
export async function commitTransaction(transaction: Transaction) {
  for (const backupPath of transaction.backups.values()) {
    if (existsSync(backupPath)) {
      await unlink(backupPath);
    }
  }
}

/**
 * トランザクションロールバック
 */
export async function rollbackTransaction(transaction: Transaction) {
  // 作成したファイルを削除
  for (const filePath of transaction.files) {
    if (existsSync(filePath)) {
      await unlink(filePath);
    }
  }

  // バックアップから復元
  for (const [originalPath, backupPath] of transaction.backups) {
    if (existsSync(backupPath)) {
      await rename(backupPath, originalPath);
    }
  }
}
