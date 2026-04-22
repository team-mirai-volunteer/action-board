// Mock mailgun.js before importing the service
const mockCreate = jest.fn();
const mockClient = jest.fn(() => ({
  messages: { create: mockCreate },
}));
const mockMailgunConstructor = jest.fn().mockImplementation(() => ({
  client: mockClient,
}));

jest.mock("mailgun.js", () => ({
  __esModule: true,
  default: mockMailgunConstructor,
}));

// Mock fs for welcome mail
jest.mock("node:fs/promises", () => ({
  __esModule: true,
  default: { readFile: jest.fn() },
  readFile: jest.fn(),
}));

// Required env vars (checked at module load)
process.env.MAILGUN_API_KEY = "test-api-key";
process.env.MAILGUN_DOMAIN = "example.com";

import fs from "node:fs/promises";

describe("mail service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("sendMail", () => {
    it("mailgun.messages.createを正しい引数で呼ぶ", async () => {
      mockCreate.mockResolvedValue({ id: "msg-1" });
      const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

      const { sendMail } = require("./mail");
      await sendMail({
        to: "user@example.com",
        subject: "Hello",
        html: "<p>Hi</p>",
      });

      expect(mockCreate).toHaveBeenCalledWith("example.com", {
        from: '"チームみらい" <noreply@example.com>',
        to: "user@example.com",
        subject: "Hello",
        html: "<p>Hi</p>",
      });
      expect(logSpy).toHaveBeenCalledWith("Mailgun response:", { id: "msg-1" });

      logSpy.mockRestore();
    });

    it("送信失敗時はエラーをログして再スローする", async () => {
      const err = new Error("network");
      mockCreate.mockRejectedValue(err);
      const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      const { sendMail } = require("./mail");

      await expect(
        sendMail({
          to: "user@example.com",
          subject: "x",
          html: "y",
        }),
      ).rejects.toThrow("network");

      expect(errSpy).toHaveBeenCalledWith("Mailgun error:", err);
      errSpy.mockRestore();
    });
  });

  describe("sendWelcomeMail", () => {
    it("テンプレートを読み込んでウェルカムメールを送信する", async () => {
      (fs.readFile as jest.Mock).mockResolvedValue("<html>welcome</html>");
      mockCreate.mockResolvedValue({ id: "msg-welcome" });
      const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

      const { sendWelcomeMail } = require("./mail");
      await sendWelcomeMail("new@example.com");

      expect(fs.readFile).toHaveBeenCalledWith(
        expect.stringContaining("public/welcome.html"),
        "utf8",
      );
      expect(mockCreate).toHaveBeenCalledWith(
        "example.com",
        expect.objectContaining({
          to: "new@example.com",
          subject:
            "「チームみらい」アクションボードに登録いただきありがとうございます",
          html: "<html>welcome</html>",
        }),
      );

      logSpy.mockRestore();
    });

    it("テンプレート読み込み失敗時はエラーを投げる", async () => {
      (fs.readFile as jest.Mock).mockRejectedValue(new Error("ENOENT"));
      const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      const { sendWelcomeMail } = require("./mail");

      await expect(sendWelcomeMail("new@example.com")).rejects.toThrow(
        "メールテンプレートが見つかりません",
      );
      expect(mockCreate).not.toHaveBeenCalled();
      expect(errSpy).toHaveBeenCalled();

      errSpy.mockRestore();
    });
  });
});
