import { sendRule } from "./utils/api";
import { getData, getPurefiType } from "./utils/helpers";
import { SignTypeEnum } from "./utils/types";
import { validEcdsa } from "./utils/validations";

async function main() {
  const answers = await getData();

  const purefiData = await sendRule({
    data: {
      sender: answers.sender,
      receiver: answers.receiver,
      chainId: `${answers.chainId}`,
      ruleId: `${answers.rule}`,
    },
    privateKey: answers.privateKey,
    setSigner: answers.setSigner,
    env: answers.env,
    signType: answers.signType,
  });

  console.log("\n", "Result:\n", purefiData);

  const packageType = getPurefiType(answers.rule);

  if (answers.signType === SignTypeEnum.ecdsa) {
    validEcdsa({
      packageType,
      purefiData,
      setSigner: answers.setSigner,
    });
  }
}

main();
