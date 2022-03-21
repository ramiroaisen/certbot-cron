#!/usr/bin/env node
import { $ } from "zx";
import { Command } from "commander";
import ms from "ms";
import { fileURLToPath } from "url";
import { createWriteStream } from "fs";
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const __filename = fileURLToPath(import.meta.url);
// @ts-ignore
const mod = (await import("./config.js")).default;
let { args, interval, delay, hook } = mod;
if (typeof interval === "string") {
    interval = ms(interval);
}
if (delay == null)
    delay = interval;
if (typeof delay === "string")
    delay = ms(delay);
const date = () => new Date().toLocaleString();
const cli = new Command();
cli.version("0.0.1")
    .option("--renew-hook", "Run the renew hook config action")
    .option("--renew-hook-manager");
const opts = cli.parse().opts();
if (opts.renewHookManager) {
    const file = createWriteStream("./hook.log", { flags: "a" });
    await $ `${__filename} --renew-hook`.pipe(file);
}
else if (opts.renewHook) {
    console.log(`[${date()}]: renew hook called`);
    if (hook) {
        await hook();
        console.log(`[${date()}]: renew hook executed`);
    }
    else {
        console.log(`[${date()}]: nothing to do (no renew hook supplied)`);
    }
}
else {
    console.log("process start, waiting start delay", ms(delay));
    await sleep(delay);
    while (true) {
        console.log("running certbot renew");
        await $ `certbot renew ${args} --renew-hook=${$.quote(__filename) + " --renew-hook-manager"}`;
        console.log("waiting interval", ms(interval));
        await sleep(interval);
    }
}
process.exit();
