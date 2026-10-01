import {
  AuthenticationDetails,
  CognitoUser,
  type CognitoUserSession,
} from "amazon-cognito-identity-js";
import { getUserPool } from "./cognito";
import { groupsFromIdToken, isAdminFromGroups } from "./groups";

export type SignInResult =
  | { kind: "authenticated"; session: CognitoUserSession }
  | { kind: "newPasswordRequired" };

let pendingNewPasswordUser: CognitoUser | null = null;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function cognitoUser(email: string): CognitoUser {
  return new CognitoUser({
    Username: normalizeEmail(email),
    Pool: getUserPool(),
  });
}

function asError(error: unknown, fallback: string): Error {
  if (error instanceof Error && error.message) {
    return error;
  }
  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message?: string }).message || fallback);
    const name = String((error as { name?: string; code?: string }).name || (error as { code?: string }).code || "");
    const wrapped = new Error(message);
    wrapped.name = name || wrapped.name;
    return wrapped;
  }
  return new Error(fallback);
}

export function mapSignInError(error: unknown): string {
  const err = asError(error, "Sign-in failed");
  if (err.name === "NotAuthorizedException" || /incorrect username or password/i.test(err.message)) {
    return "Email or password is wrong.";
  }
  if (/network|failed to fetch|timeout/i.test(err.message)) {
    return "Cannot reach Cognito.";
  }
  return err.message || "Sign-in failed.";
}

export function signIn(email: string, password: string): Promise<SignInResult> {
  const user = cognitoUser(email);
  const details = new AuthenticationDetails({
    Username: normalizeEmail(email),
    Password: password,
  });
  return new Promise((resolve, reject) => {
    user.authenticateUser(details, {
      onSuccess(session) {
        pendingNewPasswordUser = null;
        resolve({ kind: "authenticated", session });
      },
      onFailure(error) {
        reject(asError(error, "Sign-in failed"));
      },
      newPasswordRequired() {
        pendingNewPasswordUser = user;
        resolve({ kind: "newPasswordRequired" });
      },
    });
  });
}

export function hasPendingNewPassword(): boolean {
  return pendingNewPasswordUser !== null;
}

export function completeNewPassword(password: string): Promise<CognitoUserSession> {
  const user = pendingNewPasswordUser;
  if (!user) {
    return Promise.reject(new Error("Start from sign-in."));
  }
  return new Promise((resolve, reject) => {
    user.completeNewPasswordChallenge(
      password,
      {},
      {
        onSuccess(session) {
          pendingNewPasswordUser = null;
          resolve(session);
        },
        onFailure(error) {
          reject(asError(error, "Could not set password"));
        },
      },
    );
  });
}

export function getCurrentUser(): CognitoUser | null {
  return getUserPool().getCurrentUser();
}

export function getSession(): Promise<CognitoUserSession> {
  const user = getCurrentUser();
  if (!user) {
    return Promise.reject(new Error("Not signed in"));
  }
  return new Promise((resolve, reject) => {
    user.getSession((error: Error | null, session: CognitoUserSession | null) => {
      if (error || !session?.isValid()) {
        reject(asError(error, "Invalid session"));
        return;
      }
      resolve(session);
    });
  });
}

export async function getIdToken(): Promise<string> {
  const session = await getSession();
  return session.getIdToken().getJwtToken();
}

export async function getGroups(): Promise<string[]> {
  try {
    const token = await getIdToken();
    return groupsFromIdToken(token);
  } catch {
    return [];
  }
}

export async function isAdmin(): Promise<boolean> {
  return isAdminFromGroups(await getGroups());
}

export function signOut(): Promise<void> {
  pendingNewPasswordUser = null;
  const user = getCurrentUser();
  if (!user) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    user.globalSignOut({
      onSuccess() {
        user.signOut();
        resolve();
      },
      onFailure() {
        user.signOut();
        resolve();
      },
    });
  });
}

export function forgotPassword(email: string): Promise<void> {
  const user = cognitoUser(email);
  return new Promise((resolve) => {
    user.forgotPassword({
      onSuccess() {
        resolve();
      },
      onFailure() {
        resolve();
      },
    });
  });
}

export function confirmForgotPassword(email: string, code: string, password: string): Promise<void> {
  const user = cognitoUser(email);
  return new Promise((resolve, reject) => {
    user.confirmPassword(code.trim(), password, {
      onSuccess() {
        resolve();
      },
      onFailure(error) {
        reject(asError(error, "Could not reset password"));
      },
    });
  });
}
