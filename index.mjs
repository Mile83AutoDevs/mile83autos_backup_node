import express from "express";
import bodyParser from "body-parser";
import nodeCron from "node-cron";
import { backupModule, callDatabaseData } from "./backup_node.mjs";

// ---------------- SETUP ----------------
const server = express();
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(express.json());

// Run daily at 24 hours once a day;
const timeofNextBackup = "0 0 * * *";

// ---------------- CRON JOB ----------------
const startBackupCronJob = () => {
  console.log("Starting 24 hours backup cron job...");
  nodeCron.schedule(timeofNextBackup, async () => {
    try {
      console.log("Running 24 hours backup...");
      const databaseData = await callDatabaseData("production");
      if (!databaseData) {
        console.log("Could not fetch database data for backup.");
        return;
      }
      const isBackupSuccess = await backupModule(
        databaseData,
        "production"
      );
      console.log(
        isBackupSuccess
          ? "24 hours backup completed successfully."
          : "24 hours backup failed."
      );
    } catch (error) {
      console.error("Cron execution error:", error.message);
    }
  });
};

// ---------------- INITIALIZE ----------------
(() => {
  startBackupCronJob();
})();

// ---------------- KEEP PROCESS ALIVE ----------------
const PORT = process.env.PORT || 3000;


server.listen(PORT, () => {
  console.log(`Background cron server is currently running on port ${PORT}`);
});
