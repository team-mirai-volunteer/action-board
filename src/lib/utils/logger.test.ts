describe("logger", () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe("development環境", () => {
    it("debug が console.log を呼ぶ", async () => {
      process.env.NODE_ENV = "development";
      const { logger } = await import("./logger");
      const spy = jest.spyOn(console, "log").mockImplementation();
      logger.debug("test message");
      expect(spy).toHaveBeenCalledWith("[DEBUG]", "test message");
    });

    it("info が console.info を呼ぶ", async () => {
      process.env.NODE_ENV = "development";
      const { logger } = await import("./logger");
      const spy = jest.spyOn(console, "info").mockImplementation();
      logger.info("info message");
      expect(spy).toHaveBeenCalledWith("[INFO]", "info message");
    });
  });

  describe("production環境（test環境）", () => {
    it("debug が console.log を呼ばない", async () => {
      process.env.NODE_ENV = "test";
      const { logger } = await import("./logger");
      const spy = jest.spyOn(console, "log").mockImplementation();
      logger.debug("should not appear");
      expect(spy).not.toHaveBeenCalled();
    });

    it("info が console.info を呼ばない", async () => {
      process.env.NODE_ENV = "test";
      const { logger } = await import("./logger");
      const spy = jest.spyOn(console, "info").mockImplementation();
      logger.info("should not appear");
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe("全環境共通", () => {
    it("warn が console.warn を呼ぶ", async () => {
      process.env.NODE_ENV = "test";
      const { logger } = await import("./logger");
      const spy = jest.spyOn(console, "warn").mockImplementation();
      logger.warn("warning message");
      expect(spy).toHaveBeenCalledWith("[WARN]", "warning message");
    });

    it("error が console.error を呼ぶ", async () => {
      process.env.NODE_ENV = "test";
      const { logger } = await import("./logger");
      const spy = jest.spyOn(console, "error").mockImplementation();
      logger.error("error message");
      expect(spy).toHaveBeenCalledWith("[ERROR]", "error message");
    });
  });

  describe("複数引数", () => {
    it("debug に複数引数を渡せる", async () => {
      process.env.NODE_ENV = "development";
      const { logger } = await import("./logger");
      const spy = jest.spyOn(console, "log").mockImplementation();
      logger.debug("a", "b", 123);
      expect(spy).toHaveBeenCalledWith("[DEBUG]", "a", "b", 123);
    });

    it("info に複数引数を渡せる", async () => {
      process.env.NODE_ENV = "development";
      const { logger } = await import("./logger");
      const spy = jest.spyOn(console, "info").mockImplementation();
      logger.info("x", { key: "value" });
      expect(spy).toHaveBeenCalledWith("[INFO]", "x", { key: "value" });
    });

    it("warn に複数引数を渡せる", async () => {
      process.env.NODE_ENV = "test";
      const { logger } = await import("./logger");
      const spy = jest.spyOn(console, "warn").mockImplementation();
      logger.warn("w1", "w2", 456);
      expect(spy).toHaveBeenCalledWith("[WARN]", "w1", "w2", 456);
    });

    it("error に複数引数を渡せる", async () => {
      process.env.NODE_ENV = "test";
      const { logger } = await import("./logger");
      const spy = jest.spyOn(console, "error").mockImplementation();
      logger.error("e1", new Error("test error"));
      expect(spy).toHaveBeenCalledWith(
        "[ERROR]",
        "e1",
        new Error("test error"),
      );
    });
  });
});
