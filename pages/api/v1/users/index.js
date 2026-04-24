import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user.js";
import activation from "models/activation";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(req, res) {
  const userInputValue = req.body;

  const newUser = await user.create(userInputValue);

  // 1. Criar token de ativação
  await activation.sendEmailToUser(newUser);

  return res.status(201).json(newUser);
}
