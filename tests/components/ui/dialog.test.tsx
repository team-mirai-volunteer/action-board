import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

describe("Dialog", () => {
  it("ダイアログコンポーネント存在確認", () => {
    expect(typeof Dialog).toBe("function");
    expect(typeof DialogContent).toBe("object");
  });

  it("ダイアログヘッダー存在確認", () => {
    expect(typeof DialogHeader).toBe("function");
    expect(typeof DialogTitle).toBe("object");
  });
});
