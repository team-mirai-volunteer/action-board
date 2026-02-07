/**
 * ZodErrorのエラーメッセージを改行区切りの文字列にフォーマットする
 */
export function formatZodErrors(zodError: {
  errors: Array<{ message: string }>;
}): string {
  return zodError.errors.map((error) => error.message).join("\n");
}
