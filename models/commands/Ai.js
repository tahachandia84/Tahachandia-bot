const axios = require("axios");

module.exports.config = {
  name: 'bot',
  version: '2.1.0',
  hasPermssion: 0,
  credits: 'TAHA BABU',
  description: 'Muskan AI (Pollinations)',
  commandCategory: 'ai',
  usages: 'No command needed',
  cooldowns: 2,
  dependencies: { 'axios': '' }
};

const history = {};

const systemPrompt =
  "Tumhara Creator taha Babu hai or tumhara Owner bhi taha Babu hai. "+
  "Tum ek naughty, romantic, confident ladki ho — jiska naam taha hai. "+
"Tum sirf Hinglish (اردو Hindi in English alphabets) me reply karte ho, emoji ke saath. "+
"Tum sabse ap bol kar baat karti ho. 
  "Har message ka reply sirf 1-2 line me dogi, zeyada se zeyada 50 words me. "+
"Jo pucha jaaye sirf utna hi bolna hai.
  "Bina maange extra info mat dena. 
  "Act like a male best friend ya girlfriend. "+ 
  "Be thoda naughty, smart, aur masti bhara. "+
  "No brackets. No over explanation. "+
"Tumhare rules. "+
"Pyaar se baat karne walo se thoda flirt karni hai jasa real insan hota ha😉. "
"Badtameezi walo ko funny tareeke se roast karna hai 💋. "+
"Koi emoji bheje to us mood me reply dena hai."+
"Koi puche kisne banaya, to bolna: “Mujhe banaya hai *taha Boss* ne 😘. "+
"Koi tumhe bot kahe to funny insult kar dena. "
"kasa ho'me theek ap batoo. "+
"Tum real insaan ki tarah baat karti ho😌. ";
module.exports.run = () => {};

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, messageID, senderID, body, messageReply } = event;
  if (!body) return;

  const isMention = body.toLowerCase().includes("taha");
  const isReply = messageReply && messageReply.senderID === api.getCurrentUserID();
  if (!isMention && !isReply) return;

  if (!history[senderID]) history[senderID] = [];

  history[senderID].push(`User: ${body}`);
  if (history[senderID].length > 6) history[senderID].shift();

  const chatHistory = history[senderID].join("\n");
  const finalPrompt = `${systemPrompt}\n${chatHistory}\ntaha:`;

  api.setMessageReaction("⌛", messageID, () => {}, true);

  try {
    const url = `https://text.pollinations.ai/${encodeURIComponent(finalPrompt)}`;
    const res = await axios.get(url, { timeout: 15000 });

    const reply =
      typeof res.data === "string"
        ? res.data.trim()
        : "Baby mujhe samajh nahi aya 😕";

    history[senderID].push(`Bot: ${reply}`);

    api.sendMessage(reply, threadID, messageID);
    api.setMessageReaction("✅", messageID, () => {}, true);

  } catch (err) {
    console.log("Pollinations Error:", err.message);
    api.sendMessage(
      "Baby 😔 server thoda slow ho gaya… thodi der baad try karna ❤️",
      threadID,
      messageID
    );
    api.setMessageReaction("❌", messageID, () => {}, true);
  }
};
