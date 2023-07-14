import * as AWS from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { TodoItem } from "../models/TodoItem";
import { TodoUpdate } from "../models/TodoUpdate";

const XAWS = AWSXRay.captureAWS(AWS);

const docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient();

const TODOS_TABLE = process.env.TODOS_TABLE;

// Query to DynamoDB logic (Like a DAO layer)

export const findByUserId = async (userId: string) => {
  const todo = await docClient
    .query({
      TableName: TODOS_TABLE,
      KeyConditionExpression: "#userId = :userId",
      ExpressionAttributeNames: { "#userId": "userId", "#_name": "name" },
      ExpressionAttributeValues: { ":userId": userId },
      ProjectionExpression:
        "todoId, userId, createdAt, #_name, dueDate, done, attachmentUrl",
    })
    .promise();

  return todo.Items;
};

export const findByUserIdAndName = async (
  userId: string,
  searchString: string
) => {
  const todo = await docClient
    .query({
      TableName: TODOS_TABLE,
      KeyConditionExpression: "#userId = :userId",
      ExpressionAttributeNames: { "#userId": "userId", "#_name": "name" },
      ExpressionAttributeValues: {
        ":userId": userId,
        ":searchString": searchString.toLowerCase,
      },
      FilterExpression: "contains(lowercase(#_name), :searchString)",
      ProjectionExpression:
        "todoId, userId, createdAt, #_name, dueDate, done, attachmentUrl",
    })
    .promise();

  return todo.Items;
};

export const add = async (todo: TodoItem) => {
  await docClient.put({ TableName: TODOS_TABLE, Item: todo }).promise();
};

export const updateByUserIdAndTodoId = async (
  userId: string,
  todoId: string,
  todo: TodoUpdate
) => {
  await docClient
    .update({
      TableName: TODOS_TABLE,
      Key: { todoId, userId },
      UpdateExpression:
        "set #_name = :name, #dueDate = :dueDate, #done = :done",
      ExpressionAttributeNames: {
        "#_name": "name",
        "#dueDate": "dueDate",
        "#done": "done",
      },
      ExpressionAttributeValues: {
        ":name": todo.name,
        ":dueDate": todo.dueDate,
        ":done": todo.done,
      },
    })
    .promise();
};

export const deleteByUserIdAndTodoId = async (
  userId: string,
  todoId: string
) => {
  await docClient
    .delete({
      TableName: TODOS_TABLE,
      Key: { userId, todoId },
    })
    .promise();
};
