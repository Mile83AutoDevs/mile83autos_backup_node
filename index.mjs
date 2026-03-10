import dotenv from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";
import { backupModule, callDatabaseData } from "./backup_node.mjs";

dotenv.config({
  quiet: false,
});

// ---------------- DISCORD BOT SETUP ----------------
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

// Exit if required env vars are missing
if (!DISCORD_BOT_TOKEN || !DISCORD_CHANNEL_ID) {
  console.error("Discord token or channel ID missing!");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const sendDiscordMessage = async (message) => {
  try {
    const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
    if (channel) await channel.send(message);
  } catch (err) {
    console.error("Failed to send Discord message:", err.message);
  }
};

// ---------------- BACKUP WORKER ----------------
const runBackup = async () => {
  console.log("Starting daily backup...");

  try {
    const databaseData = await callDatabaseData("production");

    if (!databaseData) {
      const msg = " Backup failed: Could not fetch database data.";
      console.log(msg);
      await sendDiscordMessage(msg);
      return;
    }

    const isBackupSuccess = await backupModule(databaseData, "production");

    const msg = isBackupSuccess.status
      ? `✅ Daily backup completed successfully., Here is your report: ${isBackupSuccess.data_report}`
      : "❌ Daily backup failed.";
    console.log(msg);
    await sendDiscordMessage(msg);
  } catch (error) {
    const msg = `❌ Backup execution error: ${error.message}`;
    console.error(msg);
    await sendDiscordMessage(msg);
  }
};

// ---------------- RUN ----------------
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  runBackup().then(() => process.exit(0)); // exit after run
});

// Log in the bot
client.login(DISCORD_BOT_TOKEN);
