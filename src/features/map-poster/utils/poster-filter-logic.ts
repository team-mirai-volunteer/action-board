/**
 * ポスター掲示板のフィルタリングに必要な最小限のボード情報
 */
interface FilterableBoard {
  id: string;
  status: string;
}

/**
 * ポスター掲示板をステータスとユーザー編集履歴でフィルタリングする
 *
 * Worker と Hook の両方から利用される共通フィルタロジック
 */
export function filterPosterBoards<T extends FilterableBoard>(
  boards: T[],
  statusSet: Set<string>,
  showOnlyMine: boolean,
  editedBoardSet: Set<string>,
  currentUserId?: string,
): T[] {
  return boards.filter((board) => {
    if (!statusSet.has(board.status)) {
      return false;
    }

    if (showOnlyMine && currentUserId) {
      if (editedBoardSet.size === 0) {
        return false;
      }
      if (!editedBoardSet.has(board.id)) {
        return false;
      }
    }

    return true;
  });
}
