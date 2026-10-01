import { CognitoUserPool } from "amazon-cognito-identity-js";
import { userPoolClientId, userPoolId } from "../config";

let pool: CognitoUserPool | null = null;

export function getUserPool(): CognitoUserPool {
  if (!pool) {
    pool = new CognitoUserPool({
      UserPoolId: userPoolId,
      ClientId: userPoolClientId,
    });
  }
  return pool;
}
