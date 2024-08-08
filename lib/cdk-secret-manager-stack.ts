import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as aws_lambda_nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkSecretManagerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const secrets = new secretsmanager.Secret(this, "Secret", {
      secretObjectValue: {
        secret1: cdk.SecretValue.unsafePlainText("this_is_secret1"),
        secret2: cdk.SecretValue.unsafePlainText("this_is_secret2"),
        secret3: cdk.SecretValue.unsafePlainText("this_is_secret3"),
      },
      secretName: "my-secret",
      description: "This is my secret",
      encryptionKey: undefined,
      replicaRegions: undefined,
    });

    const nodejs_lambda_function = new aws_lambda_nodejs.NodejsFunction(
      this,
      "ShowSecretFunction",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: "lambda/node/show_secrets.ts",
        handler: "handler",
        environment: {
          SECRETS_NAME: secrets.secretName,
        },
      }
    );
    secrets.grantRead(nodejs_lambda_function);

    const python_lambda_function = new lambda.Function(
      this,
      "ShowSecretFunctionPython",
      {
        runtime: lambda.Runtime.PYTHON_3_12,
        handler: "show_secrets.lambda_handler",
        code: lambda.Code.fromAsset("lambda/python", {
          bundling: {
            image: lambda.Runtime.PYTHON_3_12.bundlingImage,
            command: [
              "bash",
              "-c",
              "pip install -r requirements.txt -t /asset-output && cp -au . /asset-output",
            ],
          },
        }),
        environment: {
          SECRETS_NAME: secrets.secretName,
        },
      }
    );
    secrets.grantRead(python_lambda_function);

    const nodejs_lambda_function_url = nodejs_lambda_function.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });
    const python_lambda_function_url = python_lambda_function.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });

    new cdk.CfnOutput(this, "NodeFunctionURL", {
      value: nodejs_lambda_function_url.url,
    });
    new cdk.CfnOutput(this, "PythonFunctionURL", {
      value: python_lambda_function_url.url,
    });
  }
}
