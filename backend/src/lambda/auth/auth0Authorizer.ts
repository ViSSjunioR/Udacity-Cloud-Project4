import { CustomAuthorizerEvent, CustomAuthorizerResult } from "aws-lambda";
import "source-map-support/register";

import { verify, decode } from "jsonwebtoken";
import { createLogger } from "../../utils/logger";
import Axios from "axios";
import { Jwt } from "../../auth/Jwt";
import { JwtPayload } from "../../auth/JwtPayload";
import * as https from "https";

const logger = createLogger("auth");

const jwksUrl =
  "https://dev-1qmibpydwj0mnmgf.us.auth0.com/.well-known/jwks.json";

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info("Authorizing a user", event.authorizationToken);
  try {
    const jwtToken = await verifyToken(event.authorizationToken);
    logger.info("User was authorized", jwtToken);

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: "*",
          },
        ],
      },
    };
  } catch (e) {
    logger.error("User not authorized", { error: e.message });

    return {
      principalId: "user",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Deny",
            Resource: "*",
          },
        ],
      },
    };
  }
};

type SigningKey = {
  kid: string;
  publicKey: string;
};

type JwkKey = {
  alg: string;
  kty: string;
  use: string;
  x5c: string[];
  n: string;
  e: string;
  kid: string;
  x5t: string;
};

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader);
  const jwt: Jwt = decode(token, { complete: true }) as Jwt;

  const key = await getSigningKey(jwksUrl, jwt.header.kid);
  if (!key) {
    throw new Error("Invalid token");
  }

  const verifyToken = verify(token, key.publicKey);
  if (typeof verifyToken === "string") {
    throw new Error("Invalid token");
  }

  return verifyToken as JwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error("No authentication header");

  if (!authHeader.toLowerCase().startsWith("bearer "))
    throw new Error("Invalid authentication header");

  const split = authHeader.split(" ");
  const token = split[1];

  return token;
}

async function getSigningKey(
  jwksUri: string,
  kid: string
): Promise<SigningKey> {
  const keys = await getJwks({
    jwksUri,
    strictSsl: false,
  });
  if (!keys || !keys.length) {
    return null;
  }

  const signingKeys = keys
    .filter(
      (key) =>
        (key.use === "sig" &&
          key.kty === "RSA" &&
          key.kid &&
          key.x5c &&
          key.x5c.length) ||
        (key.n && key.e)
    )
    .map((key) => ({
      kid: key.kid,
      publicKey: certToPEM(key.x5c[0]),
    }));

  const signingKey = signingKeys.find((key) => key.kid === kid);
  if (!signingKey) {
    return null;
  }

  return signingKey;
}

export async function getJwks(options: {
  jwksUri: string;
  strictSsl: boolean;
}): Promise<JwkKey[] | null> {
  const instance = Axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: options.strictSsl,
    }),
  });

  try {
    const response = await instance.get(options.jwksUri, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data.keys;
  } catch (e) {
    console.log(e);
    return null;
  }
}

function certToPEM(cert: string) {
  // @ts-ignore
  cert = cert.match(/.{1,64}/g).join("\n");
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  return cert;
}
