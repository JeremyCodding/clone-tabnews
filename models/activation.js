import email from "infra/email";

async function sendEmailToUser(user) {
  await email.send({
    from: "Jingou <jeremy.jingou@gmail.com>",
    to: user.email,
    subject: "Ative seu cadastro no JingouSpaces",
    text: `${user.username}, clique no link abaixo para ativar seu cadastro no JingouSpaces:
    `,
  });
}

const activation = {
  sendEmailToUser,
};

export default activation;
