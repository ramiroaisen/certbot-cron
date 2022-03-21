import { $ } from "zx";

/** @type {import("./cron").Config} */
const config = {
  interval: "1d",
  delay: 0,
  args: ["--dns-cloudflare", "--dns-cloudflare-credentials", "~/.cloudflare.ini"],
  hook: async () => {
    await $`nginx -s reload`;
    // await $`pm2 reload all`;
  }   
}

export default config;