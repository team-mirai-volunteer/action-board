/**
 * ページネーション用のURL文字列を生成する。
 * page=1 のときは page パラメータを削除する。
 */
export function createPaginationUrl(
  pathname: string,
  searchParams: URLSearchParams,
  page: number,
): string {
  const params = new URLSearchParams(searchParams.toString());
  if (page === 1) {
    params.delete("page");
  } else {
    params.set("page", page.toString());
  }
  const query = params.toString();
  return `${pathname}${query ? `?${query}` : ""}`;
}
