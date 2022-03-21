#!/usr/bin/env node
import { $ } from "zx";
import { Command } from "commander";
import ms from "ms";
import { fileURLToPath } from "url";  
import { createWriteStream } from "fs";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms)); 

const __filename = fileURLToPath(import.meta.url);

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
  .option("--renew-hook-manager")
  
const opts = cli.parse().opts();

if (opts.renewHookManager) {
  const file = createWriteStream("./hook.log", { flags: "a" });
  await $`${__filename} --renew-hook`.pipe(file);

} else if (opts.renewHook) {
    console.log(`Renew hook called`);
  if(hook) {
    await hook();
    console.log(`Renew hook executed`);
  } else {
    console.log(`Nothing to do (no renew hook supplied)`);
  }

} else {
  await sleep(delay);
  while(true) {
    await $`certbot renew ${args} --renew-hook=${$.quote(__filename)} --renew-hook-manager`;
    await sleep(interval);
  }
}

process.exit();




