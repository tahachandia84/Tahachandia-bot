module.exports.config = {
  name: "botoff",
  version: "1.0.0",
  hasPermssion: 2, // only admin
  credits: "ARIF BABU",
  description: "Turn Bot OFF",
  commandCategory: "Admin",
  usages: "botoff",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  // 🔐 CREDITS LOCK
  if (module.exports.config.credits !== "ARIF BABU") {
    return api.sendMessage(
      "❌ Credits modified!\nCommand disabled.",
      event.threadID
    );
  }

  api.sendMessage(
    "🛑 Bot is shutting down...\nBye 👋",
    event.threadID,
    () => process.exit(1)
  );
};
