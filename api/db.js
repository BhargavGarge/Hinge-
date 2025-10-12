import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: "",
  credentials: {
    accessKeyId:"",
    secretAccessKey: "",
  },
});

const docClient = DynamoDBDocumentClient.from(client);

export { docClient, PutCommand };
