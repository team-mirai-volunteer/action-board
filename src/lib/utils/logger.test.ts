describe("logger", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  let logSpy: jest.SpyInstance;
  let infoSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    infoSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
    jest.resetModules();
    Object.defineProperty(process.env, "NODE_ENV", {
      value: originalNodeEnv,
      configurable: true,
    });
  });

  describe("開発環境", () => {
    beforeEach(() => {
      jest.resetModules();
      Object.defineProperty(process.env, "NODE_ENV", {
        value: "development",
        configurable: true,
      });
    });

    it("debugはコンソールに[DEBUG]プレフィックス付きで出力する", () => {
      const { logger } = require("./logger");
      logger.debug("hello", 42);
      expect(logSpy).toHaveBeenCalledWith("[DEBUG]", "hello", 42);
    });

    it("infoはコンソールに[INFO]プレフィックス付きで出力する", () => {
      const { logger } = require("./logger");
      logger.info("msg", { a: 1 });
      expect(infoSpy).toHaveBeenCalledWith("[INFO]", "msg", { a: 1 });
    });

    it("warnはコンソールに[WARN]プレフィックス付きで出力する", () => {
      const { logger } = require("./logger");
      logger.warn("warning");
      expect(warnSpy).toHaveBeenCalledWith("[WARN]", "warning");
    });

    it("errorはコンソールに[ERROR]プレフィックス付きで出力する", () => {
      const { logger } = require("./logger");
      logger.error("oops");
      expect(errorSpy).toHaveBeenCalledWith("[ERROR]", "oops");
    });
  });

  describe("本番環境", () => {
    beforeEach(() => {
      jest.resetModules();
      Object.defineProperty(process.env, "NODE_ENV", {
        value: "production",
        configurable: true,
      });
    });

    it("debugは出力しない", () => {
      const { logger } = require("./logger");
      logger.debug("suppressed");
      expect(logSpy).not.toHaveBeenCalled();
    });

    it("infoは出力しない", () => {
      const { logger } = require("./logger");
      logger.info("suppressed");
      expect(infoSpy).not.toHaveBeenCalled();
    });

    it("warnは本番でも出力する", () => {
      const { logger } = require("./logger");
      logger.warn("prod warning");
      expect(warnSpy).toHaveBeenCalledWith("[WARN]", "prod warning");
    });

    it("errorは本番でも出力する", () => {
      const { logger } = require("./logger");
      logger.error("prod error");
      expect(errorSpy).toHaveBeenCalledWith("[ERROR]", "prod error");
    });
  });
});
