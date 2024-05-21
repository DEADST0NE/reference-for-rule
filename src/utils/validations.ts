import { recover } from "eth-crypto";
import { ValidEcdsa } from "./types";
import { AbiCoder, solidityPackedKeccak256 } from "ethers";

export const validEcdsa = (payload: ValidEcdsa) => {
  const abiCoder = AbiCoder.defaultAbiCoder();
  const [timestamp, signature, purefiPackage] = abiCoder.decode(
    ["uint64", "bytes", "bytes"],
    payload.purefiData
  );

  let arrayType: string[] = [];

  if (payload.packageType === 1) {
    arrayType = payload.setSigner
      ? ["uint8", "uint256", "uint256", "address", "address", "address"]
      : ["uint8", "uint256", "uint256", "address", "address"];
  } else {
    arrayType = payload.setSigner
      ? [
          "uint8",
          "uint256",
          "uint256",
          "address",
          "address",
          "address",
          "uint256",
          "address",
        ]
      : [
          "uint8",
          "uint256",
          "uint256",
          "address",
          "address",
          "address",
          "uint256",
        ];
  }
  const purefiPackageDecode = abiCoder.decode(arrayType, purefiPackage);

  let packageType: number,
    ruleId: number,
    sessionIdHex: bigint,
    sender: string,
    receiver: string,
    token: string,
    amount: bigint,
    signer: string;

  if (payload.packageType === 1) {
    [packageType, ruleId, sessionIdHex, sender, receiver, signer] =
      purefiPackageDecode;
  } else {
    [
      packageType,
      ruleId,
      sessionIdHex,
      sender,
      receiver,
      token,
      amount,
      signer,
    ] = purefiPackageDecode;
  }

  console.log(
    "\n",
    "Purefi data:\n",
    {
      signature,
      timestamp: Number(timestamp),
      purefiPackage,
    },
    "\n"
  );

  console.log(
    "Purefi package:\n",
    {
      sender,
      ruleId: Number(ruleId),
      packageType: Number(packageType),
      sessionIdHex: Number(sessionIdHex),
      receiver,
      signer,
      amount: amount!,
      token: token!,
    },
    "\n"
  );

  const messageHash = solidityPackedKeccak256(
    ["uint64", "bytes"],
    [timestamp, purefiPackage]
  );
  console.log("Message hash: ", messageHash, "\n");

  const publicKey = recover(signature, messageHash);

  console.log("PUBLIC KEY: ", publicKey);
};
