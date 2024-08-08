import json
import os

import boto3


def lambda_handler(event, context):
    client = boto3.client("secretsmanager")
    response = client.get_secret_value(SecretId=os.environ["SECRETS_NAME"])
    print(response)
    secret = json.loads(response["SecretString"])
    return {
        "message": f"{secret["secret1"]}, {secret["secret2"]}, {secret["secret3"]}",
    }
