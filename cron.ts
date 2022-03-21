#!/usr/bin/env node
import { $ } from "zx";
import { Command } from "commander";
import ms from "ms";
import { fileURLToPath } from "url";  
import path from "path";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms)); 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pm2Config = `${__dirname}/pm2.renew.config.json`;

export type Config = {
  interval: number | string
  delay: number | string | null
  args: string[]
  hook: (() => Promise<void>) | null,
}

// @ts-ignore
const mod = (await import("./config.js")).default;

let { args, interval, delay, hook }: Config = mod;

if(typeof  interval === "string") {
  interval = ms(interval);
}

if(delay == null) delay = interval;
if(typeof delay === "string") delay = ms(delay);

const cli = new Command();

cli.version("0.0.1")
  .option("--renew-hook", "Run the renew hook config action")
  .option("--pm2-exec")
  
const opts = cli.parse().opts();

if(opts.pm2Exec) {
  $.verbose = false;
  await $`pm2 start ${pm2Config}`;
  console.log("[Hook]: pm2 called");

} else if (opts.renewHook) {
  
  console.log(`renew hook process start`);
  
  process.on("SIGINT", async () => {
    console.log("SIGINT: process stopped");
    await sleep(100);
    process.exit();
  })

  if(hook) {
    console.log("waiting 2m (give time to other certificates)");
    await sleep(1_000 * 60 * 2);
    console.log("calling renew hook")
    await hook();
    console.log(`renew hook executed`);
  } else {
    console.log(`nothing to do (no renew hook supplied)`);
  }

} else {
  console.log("process start, waiting start delay:", ms(delay));
  await sleep(delay);
  while(true) {
    console.log("running certbot renew");
    await $`certbot renew ${args} --renew-hook=${$.quote(__filename) + " --pm2-exec"}`;
    console.log("command end, waiting interval:", ms(interval));
    await sleep(interval); 
  }
}

process.exit();




