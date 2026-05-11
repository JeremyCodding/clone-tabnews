import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user.js";
import activation from "models/activation";
import authorization from "models/authorization";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.post(controller.canRequest("create:user"), postHandler);
export default router.handler(controller.errorHandlers);

async function postHandler(req, res) {
  const userTryingToPost = req.context.user;
  const userInputValue = req.body;

  const newUser = await user.create(userInputValue);

  const secureOutputValues = authorization.filterOutput(
    userTryingToPost,
    "read:user",
    newUser,
  );

  const activationToken = await activation.create(newUser.id);
  await activation.sendEmailToUser(newUser, activationToken);

  return res.status(201).json(secureOutputValues);
}
