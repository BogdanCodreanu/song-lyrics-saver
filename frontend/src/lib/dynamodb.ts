import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { CapoeiraSong } from './types';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'eu-central-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'alemar-capoeira-songs';

export async function getAllSongs(): Promise<CapoeiraSong[]> {
  try {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
    });

    const response = await docClient.send(command);
    return (response.Items || []) as CapoeiraSong[];
  } catch (error) {
    console.error('Error fetching songs from DynamoDB:', error);
    throw error;
  }
}

export async function getSongById(id: string): Promise<CapoeiraSong | null> {
  try {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        id: id,
      },
    });

    const response = await docClient.send(command);
    return (response.Item as CapoeiraSong) || null;
  } catch (error) {
    console.error('Error fetching song from DynamoDB:', error);
    throw error;
  }
}

export async function createSong(song: CapoeiraSong): Promise<CapoeiraSong> {
  try {
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: song,
    });

    await docClient.send(command);
    return song;
  } catch (error) {
    console.error('Error creating song in DynamoDB:', error);
    throw error;
  }
}

export async function updateSong(id: string, updates: Partial<Omit<CapoeiraSong, 'id' | 'createdAt'>>): Promise<CapoeiraSong> {
  try {
    // Build update expression
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    // Always update updatedAt
    updates.updatedAt = new Date().toISOString();

    Object.entries(updates).forEach(([key, value], index) => {
      const nameKey = `#field${index}`;
      const valueKey = `:value${index}`;
      updateExpressions.push(`${nameKey} = ${valueKey}`);
      expressionAttributeNames[nameKey] = key;
      expressionAttributeValues[valueKey] = value;
    });

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const response = await docClient.send(command);
    return response.Attributes as CapoeiraSong;
  } catch (error) {
    console.error('Error updating song in DynamoDB:', error);
    throw error;
  }
}

export async function deleteSong(id: string): Promise<void> {
  try {
    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
    });

    await docClient.send(command);
  } catch (error) {
    console.error('Error deleting song from DynamoDB:', error);
    throw error;
  }
}
