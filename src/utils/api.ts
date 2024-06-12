import { Wallet } from "ethers";
import axios from "axios";

import { ETH_PROVIDER } from "./providers";
import { SendRule, EnvEnum, SendRuleLimit } from "./types";
import { v4 } from "uuid";

const getUrl = (env: EnvEnum) =>
  env === EnvEnum.PROD
    ? "https://issuer.app.purefi.io"
    : "https://stage.issuer.app.purefi.io";

export const sendRule = async (payload: SendRule) => {
  const nonce = v4();
  const deadline = new Date();
  deadline.setMinutes(deadline.getMinutes() + 3);

  const data: SendRule["data"] & { deadline: number; nonce: string } = {
    nonce,
    ...payload.data,
    deadline: +deadline,
  };

  const message = JSON.stringify(data);

  const baseURL = getUrl(payload.env);

  const signer = new Wallet(payload.privateKey, ETH_PROVIDER);
  const signature = await signer.signMessage(message);

  const instance = axios.create({
    baseURL,
  });

  try {
    const res = await instance.post<string>("/v4/rule", {
      message,
      signature,
      signType: payload.sign,
      setSigner: payload.setSigner,
    });

    return res.data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message ||
        err.message ||
        err.data ||
        "ISSUER QUERY ERROR"
    );
  }
};

export const sendRuleLimit = async (params: SendRuleLimit) => {
  const signer = new Wallet(params.privateKey, ETH_PROVIDER);

  const deadline = new Date();
  deadline.setMinutes(deadline.getMinutes() + 3);

  const payload: SendRuleLimit["data"] & { deadline: number } = {
    ...params.data,
    deadline: +deadline,
  };

  const message = JSON.stringify(payload);
  const baseURL = getUrl(params.env);
  const signature = await signer.signMessage(message);

  const instance = axios.create({
    baseURL,
  });

  const data = {
    message,
    signature,
  };

  console.log("\n", "Payload LIMIT:\n", data);

  try {
    const res = await instance.post<string>("/v4/rule/limits", data);

    return res.data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message ||
        err.message ||
        err.data ||
        "ISSUER QUERY ERROR"
    );
  }
};
