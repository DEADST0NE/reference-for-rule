import { Wallet } from "ethers";
import axios from "axios";

import { ETH_PROVIDER } from "./providers";
import { SendRule, EnvEnum } from "./types";

const getUrl = (env: EnvEnum) =>
  env === EnvEnum.PROD
    ? "https://issuer.app.purefi.io"
    : "https://stage.issuer.app.purefi.io";

export const sendRule = async (payload: SendRule) => {
  const signer = new Wallet(payload.privateKey, ETH_PROVIDER);

  const message = JSON.stringify(payload.data);
  const baseURL = getUrl(payload.env);
  const signature = await signer.signMessage(message);

  const instance = axios.create({
    baseURL,
  });

  try {
    const res = await instance.post<string>("/v4/rule", {
      message,
      signature,
      signType: payload.signType,
      setSigner: payload.setSigner,
    });

    return res.data;
  } catch (err: any) {
    throw new Error(
      err?.response?.message || err.message || err.data || "ISSUER QUERY ERROR"
    );
  }
};