import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as middy from "middy";
import { cors } from "middy/middlewares";

import { findTodosByUserIdAndName } from "../../businessLogic/todos";
import { getUserId } from "../utils";
import { createLogger } from "../../utils/logger";

const logger = createLogger("searchTodo");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event);
    const searchRequest: string =
      event["queryStringParameters"]["searchString"];
    logger.log("find Todos by text search: ", searchRequest);
    try {
      return {
        statusCode: 200,
        body: JSON.stringify({
          items: await findTodosByUserIdAndName(userId, searchRequest),
        }),
      };
    } catch (e) {
      logger.error("Error query Todos", e);
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
