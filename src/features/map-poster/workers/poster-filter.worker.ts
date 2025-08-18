// Web Worker for filtering poster boards
type PosterBoard = {
  id: string;
  status: string;
  lat: number | null;
  long: number | null;
  [key: string]: unknown;
};

type FilterMessage = {
  type: "filter";
  boards: PosterBoard[];
  selectedStatuses: string[];
  showOnlyMine: boolean;
  userEditedBoardIds: string[];
  currentUserId?: string;
};

type ResultMessage = {
  type: "result";
  filteredBoards: PosterBoard[];
};

self.addEventListener("message", (event: MessageEvent<FilterMessage>) => {
  const {
    boards,
    selectedStatuses,
    showOnlyMine,
    userEditedBoardIds,
    currentUserId,
  } = event.data;

  // Convert array to Set for faster lookup
  const statusSet = new Set(selectedStatuses);
  const editedBoardSet = new Set(userEditedBoardIds);

  const filteredBoards = boards.filter((board) => {
    // Check if the board's status is enabled
    if (!statusSet.has(board.status)) {
      return false;
    }

    // If "show only mine" is enabled, filter by edited boards
    if (showOnlyMine && currentUserId) {
      if (editedBoardSet.size === 0) {
        return false;
      }
      // Check if user has edited this board
      if (!editedBoardSet.has(board.id)) {
        return false;
      }
    }

    return true;
  });

  const response: ResultMessage = {
    type: "result",
    filteredBoards,
  };

  self.postMessage(response);
});
