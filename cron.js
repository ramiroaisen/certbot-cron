#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zx_1 = require("zx");
const commander_1 = require("commander");
const ms_1 = __importDefault(require("ms"));
const fs_1 = require("fs");
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
// @ts-ignore
const mod = require("./config.js");
let { args, interval, delay, hook } = mod;
if (typeof interval === "string") {
    interval = (0, ms_1.default)(interval);
}
if (delay == null)
    delay = interval;
if (typeof delay === "string")
    delay = (0, ms_1.default)(delay);
const cli = new commander_1.Command();
cli.version("0.0.1")
    .option("--renew-hook", "Run the renew hook config action")
    .option("--renew-hook-manager");
const opts = cli.parse().opts();
const run = async (opts) => {
    if (opts.renewHookManager) {
        const file = (0, fs_1.createWriteStream)("./hook.log", { flags: "a" });
        await (0, zx_1.$) `${__filename} --renew-hook`.pipe(file);
    }
    else if (opts.renewHook) {
        console.log(`Renew hook called`);
        if (hook) {
            await hook();
            console.log(`Renew hook executed`);
        }
        else {
            console.log(`Nothing to do (no renew hook supplied)`);
        }
    }
    else {
        await sleep(delay);
        while (true) {
            await (0, zx_1.$) `certbot renew ${args} --renew-hook=${zx_1.$.quote(__filename)} --renew-hook-manager`;
            await sleep(interval);
        }
    }
};
run(opts).then(() => {
    process.exit();
});
