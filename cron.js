#!/usr/bin/env node
import { $ } from "zx";
import { Command } from "commander";
import ms from "ms";
import { fileURLToPath } from "url";
import path from "path";
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pm2Hook = `${__dirname}/pm2.renew.config.json`;
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
    .option("--renew-hook", "Run the renew hook config action");
const opts = cli.parse().opts();
if (opts.renewHook) {
    console.log(`renew hook called`);
    if (hook) {
        await hook();
        console.log(`renew hook executed`);
    }
    else {
        console.log(`nothing to do (no renew hook supplied)`);
    }
}
else {
    console.log("process start, waiting start delay:", ms(delay));
    await sleep(delay);
    while (true) {
        console.log("running certbot renew");
        await $ `certbot renew ${args} --renew-hook=${`pm2 start ${$.quote(pm2Hook)}`}`;
        console.log("command end, waiting interval:", ms(interval));
        await sleep(interval);
    }
}
process.exit();
