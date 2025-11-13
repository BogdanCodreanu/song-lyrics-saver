import { Stack, StackProps, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';

export class InfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // S3 bucket for lyrics with versioning and CORS for Next.js
    const bucket = new s3.Bucket(this, 'CapoeiraSongsBucket', {
      bucketName: 'alemar-capoeira-songs',
      versioned: true,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: true,
        blockPublicPolicy: false, // Allow bucket policies for public access
        ignorePublicAcls: true,
        restrictPublicBuckets: false,
      }),
      enforceSSL: true,
      removalPolicy: RemovalPolicy.RETAIN,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
            s3.HttpMethods.DELETE,
            s3.HttpMethods.HEAD,
          ],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
          exposedHeaders: ['ETag'],
        },
      ],
    });

    // Allow public read access to images/ prefix
    bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [new iam.AnyPrincipal()],
        actions: ['s3:GetObject'],
        resources: [`${bucket.bucketArn}/images/*`],
      })
    );

    // DynamoDB table with just "id" partition key (single-env, pay-per-request)
    const table = new dynamodb.Table(this, 'CapoeiraSongsTable', {
      tableName: 'alemar-capoeira-songs',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // IAM User for Vercel (access keys created manually after deploy)
    const vercelUser = new iam.User(this, 'VercelUser', {
      userName: 'vercel-capoeira-songs-app',
    });

    // Grant S3 read/write and DynamoDB read/write data to the user
    bucket.grantReadWrite(vercelUser);
    table.grantReadWriteData(vercelUser);

    // Also allow DescribeTable on the DynamoDB table
    vercelUser.addToPolicy(
      new iam.PolicyStatement({
        actions: ['dynamodb:DescribeTable'],
        resources: [table.tableArn],
      })
    );

    // Stack outputs
    new CfnOutput(this, 'S3BucketName', { value: bucket.bucketName });
    new CfnOutput(this, 'DynamoDbTableName', { value: table.tableName });
    new CfnOutput(this, 'IamUserName', { value: vercelUser.userName });
    new CfnOutput(this, 'AwsRegion', { value: Stack.of(this).region });
  }
}
