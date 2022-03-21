#!/usr/bin/env node
import { $ } from "zx";
import { Command } from "commander";
import ms from "ms";
import { fileURLToPath } from "url";
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
const run = async (opts) => {
    console.log(opts);
};
const cli = new Command();
cli.version("0.0.1")
    .option("--renew-hook", "Run the renew hook config action")
    .option("--renew-hook-manager");
const opts = cli.parse().opts();
if (opts.renewHook) {
    console.log(`Renew hook called`);
    if (hook) {
        await hook();
        console.log(`Renew hook executed`);
    }
    else {
        console.log(`Nothing to do (no renew hook supplied)`);
    }
    process.exit();
}
else {
    await sleep(delay);
    while (true) {
        await $ `certbot renew ${args} --renew-hook="pm2 start certbot-hook"`;
        await sleep(interval);
    }
}
