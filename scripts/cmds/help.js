const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const doNotDelete = "〲 𝗠𝗔𝗬𝗕𝗘 𝗡𝗫 〲";

module.exports = {
 config: {
 name: "help",
 version: "2.0",
 author: "xalman",
 countDown: 3,
 role: 0,
 shortDescription: { en: "Neural Command Interface" },
 longDescription: { en: "Advanced command system with holographic UI" },
 category: "info",
 guide: { en: "{pn} [command | --search <term> | --detailed]" },
 priority: 1
 },

 langs: {
 en: {
   mainMenu: "╔════════════════════════════════════════════════════════════╗\n" +
             "║                    ✦ 〲 𝗠𝗔𝗬𝗕𝗘 𝗡𝗫 〲 ✦                       ║\n" +
             "╠════════════════════════════════════════════════════════════╣\n" +
             "%1\n" +
             "╠════════════════════════════════════════════════════════════╣\n" +
             "║              💠 𝐓𝐎𝐓𝐀𝐋: %2  𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒  💠              ║\n" +
             "║                 🎯 𝐏𝐑𝐄𝐅𝐈𝐗: [ %3 ]  🎯                    ║\n" +
             "╚════════════════════════════════════════════════════════════╝\n" +
             "💎 %4",
   
   categoryView: "┌────────────────────────────────────────────────────────┐\n" +
                 "│              🎮 [%1]  𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐒𝐄𝐂𝐓𝐎𝐑 🎮              │\n" +
                 "├────────────────────────────────────────────────────────┤\n" +
                 "%2\n" +
                 "└────────────────────────────────────────────────────────┘\n" +
                 "🔮  𝐒𝐘𝐍𝐀𝐏𝐒𝐄 𝐀𝐂𝐓𝐈𝐕𝐄  🔮",
   
   searchResults: "🔍  𝐒𝐄𝐀𝐑𝐂𝐇 𝐑𝐄𝐒𝐔𝐋𝐓𝐒 🔍\n" +
                  "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                  "%1\n" +
                  "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                  "📊 𝐌𝐀𝐓𝐂𝐇𝐄𝐒: %2  ⏱️ 𝐓𝐈𝐌𝐄: %3𝐦𝐬",
   
   commandInfo: "╔════════════════════════════════════════════════════════════╗\n" +
                "║           🧬 𝗡𝗫 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗗𝗔𝗧𝗔𝗕𝗔𝗦𝗘 🧬           ║\n" +
                "╠════════════════════════════════════════════════════════════╣\n" +
                "║  🏷️ 𝗡𝗔𝗠𝗘: %1\n" +
                "║  📝 𝗗𝗘𝗦𝗖: %2\n" +
                "║  🔗 𝗔𝗟𝗜𝗔𝗦: %3\n" +
                "║  🧬 𝗩𝗘𝗥: %4\n" +
                "║  🛡️ 𝗥𝗢𝗟𝗘: %5\n" +
                "║  ⏳ 𝗖𝗢𝗢𝗟: %6𝘀\n" +
                "║  👤 𝗔𝗨𝗧𝗛: %7\n" +
                "╠════════════════════════════════════════════════════════════╣\n" +
                "║  📖 𝗨𝗦𝗔𝗚𝗘 𝗚𝗨𝗜𝗗𝗘\n" +
                "%8\n" +
                "╚════════════════════════════════════════════════════════════╝\n" +
                "✨ %9",
   
   commandNotFound: "⚠️ 𝗘𝗥𝗥𝗢𝗥: 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 \"%1\" 𝗻𝗼𝘁 𝗳𝗼𝘂𝗻𝗱 ⚠️",
   noResults: "🔴 𝗡𝗢 𝗥𝗘𝗦𝗨𝗟𝗧𝗦 𝗙𝗢𝗨𝗡𝗗 𝗙𝗢𝗥: \"%1\" 🔴"
 }
 },

 onStart: async function ({ message, args, event, threadsData, getLang, role }) {
   const startTime = Date.now();
   const langCode = await threadsData.get(event.threadID, "data.lang") || global.GoatBot.config.language;
   const prefix = getPrefix(event.threadID);
   const commandName = (args[0] || "").toLowerCase();
   
   const isSearch = args.includes("--search") || args.includes("-s");
   const isDetailed = args.includes("--detailed") || args.includes("-d");
   const isCategory = args.includes("--category") || args.includes("-c");
   
   let cleanArgs = args.filter(arg => !arg.startsWith("--") && !arg.startsWith("-"));
   let searchTerm = "";
   
   if (isSearch && cleanArgs[0]) {
     searchTerm = cleanArgs.join(" ").toLowerCase();
     return await this.searchCommands(message, getLang, prefix, role, searchTerm, startTime);
   }
   
   if (isCategory) {
     return await this.showCategoryView(message, getLang, prefix, role);
   }
   
   const targetCommand = cleanArgs[0] || "";
   const command = commands.get(targetCommand) || commands.get(aliases.get(targetCommand));
   
   if (command) {
     return await this.showCommandInfo(message, getLang, prefix, command, isDetailed);
   }
   
   return await this.showAllCommands(message, getLang, prefix, role);
 },
 
 showAllCommands: async function(message, getLang, prefix, role) {
   const categories = {};
   
   for (const [name, value] of commands) {
     if (value.config.role > role) continue;
     const cat = value.config.category?.toUpperCase() || "OTHERS";
     if (!categories[cat]) categories[cat] = [];
     categories[cat].push(name);
   }
   
   const sortedCategories = Object.keys(categories).sort();
   let commandDisplay = "";
   let totalCommands = 0;
   
   for (const cat of sortedCategories) {
     const cmdList = categories[cat].sort();
     totalCommands += cmdList.length;
     const icon = this.getCategoryIcon(cat);
     commandDisplay += `\n  ${icon} ［${cat}］  ─  [${cmdList.length} commands]\n`;
     commandDisplay += `  └➤ ${cmdList.join(" • ")}\n`;
   }
   
   con
