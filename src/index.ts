import { sendRule } from "./utils/api";
import { getData, getPurefiType } from "./utils/helpers";
import { validBabyJubJub, validEcdsa } from "./utils/validations";

import { SignTypeEnum } from "./utils/types";

async function main() {
  const answers = await getData();

  const purefiData = await sendRule({
    data: {
      sender: answers.sender,
      receiver: answers.receiver,
      chainId: `${answers.chainId}`,
      ruleId: `${answers.rule}`,
      amount: answers.amount,
      token: answers.token,
    },
    privateKey: answers.privateKey,
    setSigner: answers.setSigner,
    env: answers.env,
    sign: answers.sign,
    signType: answers.signType,
  });

  console.log("\n", "Result:\n", purefiData);

  const packageType = getPurefiType(answers.rule);

  if (answers.sign === SignTypeEnum.ecdsa) {
    validEcdsa({
      packageType,
      purefiData,
      setSigner: answers.setSigner,
      env: answers.env,
    });
  } else {
    validBabyJubJub({
      packageType,
      purefiData,
      setSigner: answers.setSigner,
      env: answers.env,
    });
  }
}

main();
