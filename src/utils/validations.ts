import {
  AbiCoder,
  getBytes,
  solidityPacked,
  solidityPackedKeccak256,
} from "ethers";
import { recover } from "eth-crypto";
import { buildEddsa } from "circomlibjs";

import { setColor } from "./helpers";
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

  const _timestamp: any = timestamp;
  let _pkgType: number;
  let _ruleId: any;
  let _sessionIdHex: any;
  let _sender: string;
  let _receiver: string;
  let _token: string;
  let _amount: any;
  let _nestedHash: string;

  let messageHash: Uint8Array;

  if (payload.packageType === 1) {
    [_pkgType, _ruleId, _sessionIdHex, _sender, _receiver, _nestedHash] =
      abiCoder.decode(
        [
          "uint8", // packageType - number
          "uint256", // ruleId - BigNumber
          "uint256", // sessionId - BigNumber
          "address", // sender - string
          "address", // receiver - string
          "bytes", // nestedHash - string
        ],
        purefiPackage
      );

    messageHash = eddsa.poseidon([
      _pkgType,
      _timestamp,
      _sender,
      _receiver,
      _sessionIdHex,
      _ruleId,
      _nestedHash,
    ]);
  } else {
    [
      _pkgType,
      _ruleId,
      _sessionIdHex,
      _sender,
      _receiver,
      _token,
      _amount,
      _nestedHash,
    ] = abiCoder.decode(
      [
        "uint8", // packageType - number
        "uint256", // ruleId - BigNumber
        "uint256", // sessionId - BigNumber
        "address", // sender - string
        "address", // receiver - string
        "address", // token - string
        "uint256", // amount - BigNumber
        "bytes", // nestedHash - string
      ],
      purefiPackage
    );

    messageHash = eddsa.poseidon([
      _pkgType,
      _timestamp,
      _sender,
      _receiver,
      _token,
      _sessionIdHex,
      _ruleId,
      _amount,
      _nestedHash,
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
