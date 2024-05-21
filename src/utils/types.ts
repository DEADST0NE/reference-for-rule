export type Answers = {
  signType: SignTypeEnum;
  setSigner: boolean;
  privateKey: string;
  sender: string;
  receiver: string;
  chainId: number;
  rule: number;
  env: EnvEnum;
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
  signType: SignTypeEnum;
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
