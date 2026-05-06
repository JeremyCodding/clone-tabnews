import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import activation from "models/activation.js";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.patch(controller.canRequest("read:activation_token"), patchHandler);

export default router.handler(controller.errorHandlers);

async function patchHandler(req, res) {
  const activationTokenId = req.query.token_id;

  const validActivationToken =
    await activation.findOneByValidToken(activationTokenId);

  console.log(validActivationToken);

  await activation.activateUserByUserId(validActivationToken.user_id);

  const usedActivationToken =
    await activation.markTokenAsUsed(activationTokenId);

  console.log(usedActivationToken);

  return res.status(200).json(usedActivationToken);
}
