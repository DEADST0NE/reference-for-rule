import inquirer from "inquirer";
import { buildBabyjub, buildEddsa } from "circomlibjs";
import { setColor, uint8ArrayToBigInt } from "./utils/helpers";

const generateKeyPair = async (privKey: string) => {
  const bjj = await buildBabyjub();
  const pubKey = bjj.mulPointEscalar(bjj.Base8, privKey);

  const packedPubKey = Array.from(bjj.packPoint(pubKey))
    .reverse()
    .reduce((a, v) => a + ("0" + v.toString(16)).substr(-2), "0x");

  return {
    pubKey,
    packedPubKey,
    pubKey_bigint: [
      uint8ArrayToBigInt(pubKey[0]),
      uint8ArrayToBigInt(pubKey[1]),
    ],
  };
};

const calculatePubKey = async (privateKey: string) => {
  const eddsa = await buildEddsa();
  const prvKey =
    typeof privateKey === "string"
      ? Buffer.from(privateKey, "hex")
      : privateKey;
  const pubKey = eddsa.prv2pub(prvKey);
  return {
    Ax: pubKey[0],
    Ay: pubKey[1],
  };
};

const run = async () => {
  let data = await inquirer.prompt<{ privateKey: string }>([
    {
      type: "input",
      name: "privateKey",
      message: `Input signer ${setColor("31", "private key")}:`,
    },
  ]);

  const privateKey = data.privateKey.startsWith("0x")
    ? data.privateKey
    : "0x" + data.privateKey;

  const babyJubJub = await generateKeyPair(privateKey);
  const eddsa = await calculatePubKey(privateKey);

  console.log("Public key: \n", babyJubJub, eddsa);
};

run();
