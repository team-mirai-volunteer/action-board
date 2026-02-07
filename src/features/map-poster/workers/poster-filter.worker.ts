// Web Worker for filtering poster boards
// NOTE: Workers cannot use path aliases (@/), so we use a relative import
import { filterPosterBoards } from "../utils/poster-filter-logic";

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

  const filteredBoards = filterPosterBoards(
    boards,
    statusSet,
    showOnlyMine,
    editedBoardSet,
    currentUserId,
  );

  const response: ResultMessage = {
    type: "result",
    filteredBoards,
  };

  self.postMessage(response);
});
