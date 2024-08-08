import { SecretsManagerClient, GetSecretValueCommand} from "@aws-sdk/client-secrets-manager"

export const handler = async() => {
    const client = new SecretsManagerClient()

    try {
        const command = new GetSecretValueCommand({ SecretId: "secret1"})
        const response = await client.send(command)
        console.log(response)
        return {
            statusCode: 200,
            body: JSON.stringify(response),
        }
    } catch (error) {
        console.log(error)
        return {
            statusCode: 500,
            body: JSON.stringify('Error retrieving secret'),
        }
    }
}