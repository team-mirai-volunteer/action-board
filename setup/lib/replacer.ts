// ファイル置換

import { readFile, writeFile } from "node:fs/promises";

/**
 * ファイル内の文字列を置換
 */
export async function replaceInFile(
  filePath: string,
  replacements: Record<string, string>,
): Promise<void> {
  let content = await readFile(filePath, "utf-8");

  for (const [search, replace] of Object.entries(replacements)) {
    content = content.replace(new RegExp(search, "g"), replace);
  }

  await writeFile(filePath, content, "utf-8");
}

/**
 * 複数ファイルの置換
 */
export async function replaceInFiles(
  filePaths: string[],
  replacements: Record<string, string>,
): Promise<void> {
  await Promise.all(filePaths.map((path) => replaceInFile(path, replacements)));
}
