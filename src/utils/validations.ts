import {
  AbiCoder,
  getBytes,
  solidityPacked,
  solidityPackedKeccak256,
} from "ethers";
import { recover } from "eth-crypto";
import { buildEddsa } from "circomlibjs";

import { extractBigInt, setColor } from "./helpers";
import { publicKeys } from "./variables";

import { ValidEcdsa } from "./types";

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

  const publicKey = recover(signature, messageHash).toLowerCase();

  console.log(
    setColor("31", "VALID STATUS:"),
    publicKey === publicKeys[payload.env].hex
  );
};

export const validBabyJubJub = async (payload: ValidEcdsa) => {
  const eddsa = await buildEddsa();
  const abiCoder = AbiCoder.defaultAbiCoder();
  const [timestamp, signature, purefiPackage] = abiCoder.decode(
    ["uint64", "bytes", "bytes"],
    payload.purefiData
  );

  const message = getBytes(
    solidityPacked(["uint64", "bytes"], [timestamp, purefiPackage])
  );

  let _timestamp: bigint,
    _pkgType: bigint,
    _ruleId: bigint,
    _sessionIdHex: bigint,
    _sender: bigint,
    _receiver: bigint,
    _token: bigint,
    _amount: bigint,
    _signer: bigint;

  let messageHash: Uint8Array;

  if (payload.packageType === 1) {
    _timestamp = extractBigInt(message, 0, 8); // start: 0, offset: 8 bytes
    _pkgType = extractBigInt(message, 39, 1); // start: 8, offset: 1 byte
    _ruleId = extractBigInt(message, 40, 32); // start: 40, offset: 32 bytes
    _sessionIdHex = extractBigInt(message, 72, 31); // start: 72, offset: 32 bytes
    _sender = extractBigInt(message, 116, 20); // start: 104, offset: 20 bytes (address)
    _receiver = extractBigInt(message, 148, 20); // start: 136, offset: 20 bytes (address)
    _signer = extractBigInt(message, 180, 20); // start: 168, offset: 20 bytes (address)

    messageHash = payload.setSigner
      ? eddsa.poseidon([
          _pkgType,
          _timestamp,
          _sender,
          _receiver,
          _sessionIdHex,
          _ruleId,
          _signer,
        ])
      : eddsa.poseidon([
          _pkgType,
          _timestamp,
          _sender,
          _receiver,
          _sessionIdHex,
          _ruleId,
        ]);
  } else {
    _timestamp = extractBigInt(message, 0, 8); // start: 0, offset: 8 bytes
    _pkgType = extractBigInt(message, 39, 1); // start: 8, offset: 1 byte
    _ruleId = extractBigInt(message, 40, 32); // start: 40, offset: 32 bytes
    _sessionIdHex = extractBigInt(message, 72, 31); // start: 72, offset: 32 bytes
    _sender = extractBigInt(message, 116, 20); // start: 104, offset: 20 bytes (address)
    _receiver = extractBigInt(message, 148, 20); // start: 136, offset: 20 bytes (address)
    _token = extractBigInt(message, 180, 20); // start: 168, offset: 20 bytes (address)
    _amount = extractBigInt(message, 200, 32); // start: 200, offset: 32 bytes
    _signer = extractBigInt(message, 244, 20); // start: 232, offset: 20 bytes (address)

    messageHash = payload.setSigner
      ? eddsa.poseidon([
          _pkgType,
          _timestamp,
          _sender,
          _receiver,
          _token,
          _sessionIdHex,
          _ruleId,
          _amount,
          _signer,
        ])
      : eddsa.poseidon([
          _pkgType,
          _timestamp,
          _sender,
          _receiver,
          _token,
          _sessionIdHex,
          _ruleId,
          _amount,
        ]);
  }

  const pSignature = getBytes(signature);

  const uSignature = eddsa.unpackSignature(pSignature);

  const issuerPublicKey = publicKeys[payload.env].point;

  const isValid = eddsa.verifyPoseidon(
    messageHash,
    uSignature,
    issuerPublicKey
  );

  console.log(setColor("31", "VALID STATUS:"), isValid);
};
