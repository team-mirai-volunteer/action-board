import { render, screen } from "@testing-library/react";
import React from "react";
import Events from "./events";

describe("Events", () => {
  describe("基本的な表示", () => {
    it("コンポーネントが正しくレンダリングされる", async () => {
      const result = await Events();
      render(result);

      expect(result).toBeDefined();
    });

    it("Supabaseクライアントが呼び出される", async () => {
      await Events();

      expect(require("@/lib/supabase/client").createClient).toHaveBeenCalled();
    });
  });
});
