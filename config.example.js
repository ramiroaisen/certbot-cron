import { $ } from "zx";

/** @type {import("./cron").Config} */
const config = {
  interval: "1d",
  delay: 0,
  args: ["--force-renewal", "--dns-cloudflare", "--dns-cloudflare-credentials", "~/.cloudflare.ini"],
  hook: async () => {
    await $`nginx -s reload`;
    console.log("nginx restarted");
    // await $`pm2 reload all`;
  }
}

export default config;