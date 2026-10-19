// Envoie un message de test au vétérinaire :  npm run notify-test
import { config } from "./Config.js";
import { notificationsEnabled, sendTelegram } from "./Notify.js";

async function main() {
  if (!notificationsEnabled()) {
    console.error(
      "Telegram n'est pas configuré. Ajoute TELEGRAM_BOT_TOKEN et TELEGRAM_CHAT_ID dans server/.env.",
    );
    process.exit(1);
  }
  await sendTelegram(
    "Test : les notifications du cabinet fonctionnent. Tu recevras ici les rappels de vaccin à envoyer.",
  );
  console.log(
    `Message de test envoyé (tous les jours à partir de ${config.notifyHour} h).`,
  );
}
main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
