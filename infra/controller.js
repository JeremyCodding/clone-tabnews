import * as cookie from "cookie";
import session from "../models/session.js";
import {
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  ForbiddenError,
} from "infra/errors";
import user from "models/user.js";

function onNoMatchHandler(req, res) {
  const publicErrorObject = new MethodNotAllowedError();
  res.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onErrorHandler(error, req, res) {
  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof ForbiddenError
  ) {
    return res.status(error.statusCode).json(error);
  }

  if (error instanceof UnauthorizedError) {
    clearSessionCookie(res);
    return res.status(error.statusCode).json(error);
  }

  const publicErrorObject = new InternalServerError({
    cause: error,
  });

  console.log(publicErrorObject);
  res.status(publicErrorObject.statusCode).json(publicErrorObject);
}

async function setSessionCookie(sessionToken, response) {
  const setCookie = cookie.serialize("session_id", sessionToken, {
    path: "/",
    maxAge: session.EXPIRATION_IN_MILISECONDS / 1000,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  response.setHeader("Set-Cookie", setCookie);
}

async function clearSessionCookie(response) {
  const setCookie = cookie.serialize("session_id", "invalid", {
    path: "/",
    maxAge: -1,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  response.setHeader("Set-Cookie", setCookie);
}

async function injectAnonymousOrUser(req, res, next) {
  if (req.cookies?.session_id) {
    await injectAuthenticatedUser(req);
    return next();
  }

  injectAnonymousUser(req);
  return next();
}

async function injectAuthenticatedUser(req) {
  const sessionToken = req.cookes.session_id;
  const sessionObject = await session.findOneValidByToken(sessionToken);
  const userObject = await user.findOneById(sessionObject.user_id);

  req.context = {
    ...req.context,
    user: userObject,
  };
}

async function injectAnonymousUser(req) {
  const anonymousUserObject = {
    features: ["read:activation_token", "create:session", "create:user"],
  };

  req.context = {
    ...req.context,
    user: anonymousUserObject,
  };
}

function canRequest(feature) {
  return function canRequestMiddleware(req, res, next) {
    const userTryingToRequest = req.context.user;

    if (userTryingToRequest.features.includes(feature)) {
      return next();
    }

    throw new ForbiddenError({
      message: "Você não possui permissão para executar essa ação.",
      action: `Verifique se o seu usuário possui pa feature "${feature}"`,
    });
  };
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
  setSessionCookie,
  clearSessionCookie,
  injectAnonymousOrUser,
  canRequest,
};

export default controller;
