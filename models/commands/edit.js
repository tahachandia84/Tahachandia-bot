const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// 🌐 Pollinations OpenAI Image API
const POLLINATIONS_API = "https://text.pollinations.ai/openai";

module.exports = {
  config: {
    name: "edit",
    aliases: ["editimage", "imgedit"],
    version: "1.1.0",
    credits: "ARIF BABU",
    premium: true,
    countDown: 5,
    hasPermssion: 0,
    shortDescription: "AI Image Generator / Editor",
    longDescription:
      "Generate or edit images using Bangla or English prompt. Reply image supported.",
    commandCategory: "AI",
    usages:
      ".edit <prompt> → Generate AI image\n" +
      "Reply image + .edit → Edit existing image\n\n" +
      "Examples:\n" +
      ".edit a beautiful anime girl\n" +
      "Reply image + .edit make this anime style"
  },

  run: async function ({ api, event, args }) {
    const { threadID, messageReply } = event;
    const repliedImage = messageReply?.attachments?.[0];
    const prompt = args.join(" ").trim();

    if (!prompt) {
      return api.sendMessage(
        "❌ Please provide a prompt.\nExample:\n.edit a beautiful anime girl",
        threadID
      );
    }

    const processingMsg = await api.sendMessage(
`╭─────────────────╮
│ ⏳ PROCESSING │
├─────────────────┤
│ 🎨 AI generating image...
│ ✨ Please wait...
╰────OWNER TAHA─────────╯`,
      threadID
    );

    const imgPath = path.join(__dirname, "cache", `${Date.now()}_edit.png`);

    try {
      let apiURL;

      // 🖼️ Image edit (reply image)
      if (repliedImage && repliedImage.type === "photo") {
        apiURL =
          `${POLLINATIONS_API}?prompt=${encodeURIComponent(prompt)}` +
          `&image=${encodeURIComponent(repliedImage.url)}` +
          `&model=image`;
      }
      // 🖼️ Text → Image
      else {
        apiURL =
          `${POLLINATIONS_API}?prompt=${encodeURIComponent(prompt)}` +
          `&model=image`;
      }

      const res = await axios.get(apiURL, {
        responseType: "arraybuffer",
        timeout: 180000
      });

      await fs.ensureDir(path.dirname(imgPath));
      await fs.writeFile(imgPath, Buffer.from(res.data));

      await api.unsendMessage(processingMsg.messageID);

      await api.sendMessage(
        {
          body: repliedImage
            ? `🖌 TAHA BABU NA IMAGE EDITED\n📝 Prompt: ${prompt}`
            : `🖼 TAHA BABU NA IMAGE GENERATED\n📝 Prompt: ${prompt}`,
          attachment: fs.createReadStream(imgPath)
        },
        threadID
      );

    } catch (err) {
      console.error("IMAGE ERROR:", err?.response?.data || err.message);
      await api.unsendMessage(processingMsg.messageID);
      api.sendMessage(
        "❌ Image generate nahi ho paya.\nPlease try again later.",
        threadID
      );
    } finally {
      if (fs.existsSync(imgPath)) await fs.remove(imgPath);
    }
  }
};
