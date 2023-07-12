import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as middy from "middy";
import { cors } from "middy/middlewares";

import { getTodosForUser } from "../../businessLogic/todos";
import { getUserId } from "../utils";
import { createLogger } from "../../utils/logger";

const logger = createLogger("createTodo");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event);
    logger.log("get todo list by userId ", userId);
    try {
      return {
        statusCode: 200,
        body: JSON.stringify({
          items: await getTodosForUser(userId),
        }),
      };
    } catch (e) {
      logger.error("Error get todos", e);
      return {
        statusCode: 500,
        body: "Internal Server Error",
      };
    }
  }
);

handler.use(
  cors({
    credentials: true,
  })
);
