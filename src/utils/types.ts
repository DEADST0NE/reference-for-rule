import BigNumber from "bignumber.js";

export type Answers = {
  sign: SignTypeEnum;
  signType: 1 | 2;
  setSigner: boolean;
  privateKey: string;
  sender: string;
  receiver: string;
  chainId: number;
  rule: number;
  env: EnvEnum;
  token?: string;
  amount?: string;
};

export enum EnvEnum {
  PROD = "PROD",
  STAGE = "STAGE",
}

export enum SignTypeEnum {
  "ecdsa" = "ecdsa",
  "babyJubJub" = "babyJubJub",
}

export type RuleData = {
  sender: string;
  amount?: string;
  ruleId: string;
  token?: string;
  chainId: string;
  receiver: string;
};

export type SendRule = {
  env: EnvEnum;
  data: RuleData;
  privateKey: string;
  setSigner: boolean;
  sign: SignTypeEnum;
  signType: 1 | 2;
};

export type ValidEcdsa = {
  purefiData: string;
  packageType: number;
  setSigner: boolean;
  env: EnvEnum;
};

export type PublicKeys = {
  [key in EnvEnum]: {
    hex: string;
    point: [Uint8Array, Uint8Array];
  };
};

export const RulesType1 = [
  "777",
  "776",
  "731",
  "131",
  "231",
  "331",
  "81",
  "82",
  "83",
  "91",
  "92",
  "93",
];
export const RulesType2 = ["631", "94", "95", "96"];
