
import makeWASocket, { useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys";
import Pino from "pino";
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth");

  const sock = makeWASocket({
    auth: state,
    logger: Pino({ level: "silent" }),
    printQRInTerminal: true
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        startBot();
      }
    } else if (connection === "open") {
        console.log("✅ Kophialart Bot connected");
    }
  });
}

startBot();

app.get("/", (req, res) => {
  res.send("Kophialart WhatsApp Bot is running");
});

app.listen(PORT, () => {
  console.log("🌐 Server running on port " + PORT);
});
