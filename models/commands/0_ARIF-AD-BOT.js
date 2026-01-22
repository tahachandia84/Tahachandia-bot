module.exports.config = {
  name: "adbot",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "TAHA BABU",
  description: "User, Group & Admin Information",
  commandCategory: "Media",
  usages: "adbot user | adbot box | adbot admin",
  cooldowns: 4,
  dependencies: {
    "fs-extra": "",
    "request": ""
  }
};

/* ================= SYSTEM BOX ================= */

function box(title, text) {
  return `╭─── ${title} ───╮\n${text}\n╰─────────────────╯`;
}

const SYSTEM_BOX = (t) => box("〔 SYSTEM 〕", t);
const GROUP_BOX  = (t) => box("📦 〔 GROUP INFO 〕", t);
const ADMIN_BOX  = (t) => box("🎀 〔 ADMIN INFO 〕", t);
const USER_BOX   = (t) => box("👤 〔 USER INFO 〕", t);

/* ================= RUN ================= */

module.exports.run = async ({ api, event, args }) => {
  const fs = global.nodemodule["fs-extra"];
  const request = global.nodemodule["request"];

  const threadSetting = global.data.threadData.get(event.threadID) || {};
  const prefix = threadSetting.PREFIX || global.config.PREFIX;

  /* ================= HELP ================= */

  if (!args[0]) {
    return api.sendMessage(
      SYSTEM_BOX(
        `${prefix}adbot user\n` +
        `${prefix}adbot user @tag / reply\n` +
        `${prefix}adbot box\n` +
        `${prefix}adbot admin`
      ),
      event.threadID,
      event.messageID
    );
  }

  /* ================= GROUP INFO ================= */

  if (args[0] === "box") {
    const tid = args[1] || event.threadID;
    const info = await api.getThreadInfo(tid);

    let male = 0, female = 0;
    for (const u of info.userInfo) {
      if (u.gender === "MALE") male++;
      else if (u.gender === "FEMALE") female++;
    }

    const body = GROUP_BOX(
      `📛 Name: ${info.threadName}\n` +
      `🆔 TID: ${tid}\n` +
      `🔒 Approval: ${info.approvalMode ? "ON" : "OFF"}\n` +
      `😀 Emoji: ${info.emoji || "None"}\n\n` +
      `👥 Members: ${info.participantIDs.length}\n` +
      `👮 Admins: ${info.adminIDs.length}\n` +
      `👦 Male: ${male}\n` +
      `👧 Female: ${female}\n` +
      `💬 Messages: ${info.messageCount}`
    );

    if (!info.imageSrc) {
      return api.sendMessage(body, event.threadID, event.messageID);
    }

    const imgPath = __dirname + "/cache/box.png";
    return request(info.imageSrc)
      .pipe(fs.createWriteStream(imgPath))
      .on("close", () => {
        api.sendMessage(
          { body, attachment: fs.createReadStream(imgPath) },
          event.threadID,
          () => fs.unlinkSync(imgPath),
          event.messageID
        );
      });
  }

  /* ================= ADMIN INFO ================= */

  if (args[0] === "admin") {
    const imgPath = __dirname + "/cache/admin.png";
    const imgURL =
      "https://graph.facebook.com/100068565380737/picture?height=720&width=720";

    return request(imgURL)
      .pipe(fs.createWriteStream(imgPath))
      .on("close", () => {
        api.sendMessage(
          {
            body: ADMIN_BOX(
              "👤 Name:TAHA BABU 😉\n" +
              "🌐 Facebook:\n" +
              "https://www.facebook.com/share/1H2Vez2frr/\n\n" +
              `🙏 Thanks for using ${global.config.BOTNAME}`
            ),
            attachment: fs.createReadStream(imgPath)
          },
          event.threadID,
          () => fs.unlinkSync(imgPath),
          event.messageID
        );
      });
  }

  /* ================= USER INFO ================= */

  if (args[0] === "user") {
    let uid;

    if (Object.keys(event.mentions).length > 0)
      uid = Object.keys(event.mentions)[0];
    else if (args[1])
      uid = args[1];
    else if (event.type === "message_reply")
      uid = event.messageReply.senderID;
    else
      uid = event.senderID;

    const data = await api.getUserInfo(uid);
    const user = data[uid];

    const gender =
      user.gender === 2 ? "Male" :
      user.gender === 1 ? "Female" : "Unknown";

    const body = USER_BOX(
      `📛 Name: ${user.name}\n` +
      `🆔 UID: ${uid}\n` +
      `🔗 Profile: ${user.profileUrl}\n` +
      `👫 Friend with bot: ${user.isFriend ? "Yes" : "No"}\n` +
      `⚧ Gender: ${gender}\n` +
      `🔖 Username: ${user.vanity || "None"}`
    );

    const imgPath = __dirname + "/cache/user.png";

    return request(
      `https://graph.facebook.com/${uid}/picture?height=720&width=720`
    )
      .pipe(fs.createWriteStream(imgPath))
      .on("close", () => {
        api.sendMessage(
          { body, attachment: fs.createReadStream(imgPath) },
          event.threadID,
          () => fs.unlinkSync(imgPath),
          event.messageID
        );
      });
  }
};
