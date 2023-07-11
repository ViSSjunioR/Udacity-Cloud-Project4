import * as AWS from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

const XAWS = AWSXRay.captureAWS(AWS);

const s3 = new AWS.S3({ signatureVersion: "v4" });
const docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient();

const TODOS_TABLE = process.env.TODOS_TABLE;
const ATTACHMENT_S3_BUCKET = process.env.ATTACHMENT_S3_BUCKET;
const SIGNED_URL_EXPIRATION = process.env.SIGNED_URL_EXPIRATION;

export const generateUploadURLToS3 = async (
  userId: string,
  todoId: string
): Promise<string> => {
  const presignUrl = s3.getSignedUrl("putObject", {
    Bucket: ATTACHMENT_S3_BUCKET,
    Key: `${todoId}.jpg`,
    Expires: parseInt(SIGNED_URL_EXPIRATION),
  });

  await docClient
    .update({
      TableName: TODOS_TABLE,
      Key: { userId, todoId },
      UpdateExpression: "set attachmentUrl = :attachmentUrl",
      ExpressionAttributeValues: {
        ":attachmentUrl": `https://${ATTACHMENT_S3_BUCKET}.s3.amazonaws.com/${todoId}.jpg`,
      },
    })
    .promise();

  return presignUrl;
};
