import inquirer from "inquirer";

import { Answers } from "./types";

export const setColor = (color: string, text: string) => {
  return `\x1b[${color}m${text}\x1b[0m`;
};

export const getData = async () => {
  const answers = await inquirer.prompt<Answers>([
    {
      type: "list",
      name: "env",
      default: "PROD",
      message: "Select env:",
      choices: ["STAGE", "PROD"],
    },
    {
      type: "list",
      name: "signType",
      default: "ecdsa",
      message: "Select sign type:",
      choices: ["ecdsa", "babyJubJub"],
    },
    {
      type: "confirm",
      default: false,
      name: "setSigner",
      message: "Is set signer:",
    },
    {
      type: "input",
      name: "privateKey",
      message: `Input signer ${setColor("31", "private key")}:`,
    },
    {
      type: "input",
      name: "sender",
      default: "0x979379a368aF8eE40f6eF47E08aA2f976da1c9eD",
      message: `Input sender ${setColor("33", "public key")}:`,
      validate: (value: string) => {
        const valid = value.length === 42;
        return valid || `Please enter length 42 char`;
      },
    },
    {
      type: "input",
      name: "receiver",
      default: "0xaa8F4C9a834f4329e2Bb96DcFb96e2F0FEE42235",
      message: `Input receiver ${setColor("33", "public key")}:`,
      validate: (value: string) => {
        const valid = value.length === 42;
        return valid || `Please enter length 42 char`;
      },
    },
    {
      type: "input",
      name: "chainId",
      default: "1",
      message: `Input ${setColor("32", "chain id")}:`,
      validate: (value: string) => {
        const valid = !isNaN(parseFloat(value));
        return valid || `Please enter a number`;
      },
      filter: Number,
    },
    {
      type: "input",
      name: "rule",
      default: "777",
      message: `Input ${setColor("34", "rule id")}:`,
      validate: (value: string) => {
        const valid = !isNaN(parseFloat(value));
        return valid || `Please enter a number`;
      },
      filter: Number,
    },
  ]);

  return answers;
};

export const getPurefiType = (rule: number) => {
  const IsRuleType2 = [631, 94, 95, 96];

  if (IsRuleType2.includes(rule)) {
    return 2;
  }
  return 1;
};

const bufferToBigInt = (buf: Buffer) => {
  const hex = buf.toString("hex");
  if (hex.length === 0) {
    return BigInt(0);
  }
  return BigInt(`0x${hex}`);
};

const uint8ArrayToBigInt = (uint8Array: Uint8Array) =>
  bufferToBigInt(Buffer.from(uint8Array));

export const extractBigInt = (
  message: Uint8Array,
  start: number,
  offset = 32
) => uint8ArrayToBigInt(new Uint8Array(message.slice(start, start + offset)));
