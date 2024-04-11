import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const authPasswordRecover_Body = z
  .object({
    AccessModel: z.string().nullish(),
    applID: z.string(),
    email: z.string(),
    resetURL: z.string().nullish(),
  })
  .passthrough();
const authPasswordReset_Body = z
  .object({ password: z.string(), verification: z.string() })
  .passthrough();
const authLogin_Body = z
  .object({
    applID: z.string(),
    coord: z.string().nullish(),
    deviceID: z.string(),
    deviceName: z.string(),
    email: z.string(),
    ip: z.string(),
    location: z.string(),
    password: z.string(),
    rememberMe: z.boolean(),
  })
  .passthrough();
const authEmailTokenAuth_Body = z
  .object({ applID: z.string(), email: z.string() })
  .passthrough();
const authEmailTokenSignin_Body = z
  .object({
    acveID: z.string(),
    coord: z.string().nullish(),
    deviceID: z.string(),
    deviceName: z.string(),
    ip: z.string(),
    location: z.string(),
    verification: z.string(),
  })
  .passthrough();
const authCreateAccount_Body = z
  .object({
    applID: z.string(),
    coord: z.string().nullish(),
    deviceID: z.string(),
    deviceName: z.string(),
    email: z.string(),
    ip: z.string(),
    location: z.string(),
    name: z.string(),
    password: z.string(),
  })
  .passthrough();
const usersGetProfileMe_Body = z
  .object({
    avatar: z.string().nullable(),
    info: z.object({}).partial().passthrough().nullable(),
    name: z.string().nullable(),
  })
  .partial()
  .passthrough();

export const schemas = {
  authPasswordRecover_Body,
  authPasswordReset_Body,
  authLogin_Body,
  authEmailTokenAuth_Body,
  authEmailTokenSignin_Body,
  authCreateAccount_Body,
  usersGetProfileMe_Body,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/api/auth/flow/:provider",
    alias: "auth3rdParty",
    description: `Login with a providers Oauth flow`,
    requestFormat: "json",
    parameters: [
      {
        name: "provider",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "applID",
        type: "Query",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        context: z.string().nullish(),
        data: z
          .object({
            item: z
              .object({
                jwt: z.string(),
                roles: z.array(z.string()),
                user: z
                  .object({
                    applID: z.string(),
                    avatar: z.string().nullish(),
                    createdAt: z.string(),
                    deletedAt: z.string().nullish(),
                    info: z.object({}).partial().passthrough(),
                    name: z.string(),
                    pushTokens: z.array(z.string()).nullish(),
                    userID: z.string(),
                  })
                  .passthrough(),
              })
              .passthrough(),
            kind: z.string(),
            lang: z.string().nullish(),
          })
          .passthrough(),
      })
      .passthrough(),
  },
  {
    method: "get",
    path: "/api/auth/flow/:provider/callback",
    alias: "auth3rdParty",
    description: `Login with a providers Oauth flow`,
    requestFormat: "json",
    parameters: [
      {
        name: "provider",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "state",
        type: "Query",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        context: z.string().nullish(),
        data: z
          .object({
            item: z
              .object({
                jwt: z.string(),
                roles: z.array(z.string()),
                user: z
                  .object({
                    applID: z.string(),
                    avatar: z.string().nullish(),
                    createdAt: z.string(),
                    deletedAt: z.string().nullish(),
                    info: z.object({}).partial().passthrough(),
                    name: z.string(),
                    pushTokens: z.array(z.string()).nullish(),
                    userID: z.string(),
                  })
                  .passthrough(),
              })
              .passthrough(),
            kind: z.string(),
            lang: z.string().nullish(),
          })
          .passthrough(),
      })
      .passthrough(),
  },
  {
    method: "post",
    path: "/api/auth/one-time-login",
    alias: "authOneTimeLogin",
    description: `Authenticate with single use token`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Request data`,
        type: "Body",
        schema: z.object({ token: z.string() }).passthrough(),
      },
      {
        name: "context",
        type: "Query",
        schema: z.string().nullish(),
      },
    ],
    response: z
      .object({
        context: z.string().nullish(),
        data: z
          .object({
            item: z
              .object({
                jwt: z.string(),
                roles: z.array(z.string()),
                user: z
                  .object({
                    applID: z.string(),
                    avatar: z.string().nullish(),
                    createdAt: z.string(),
                    deletedAt: z.string().nullish(),
                    info: z.object({}).partial().passthrough(),
                    name: z.string(),
                    pushTokens: z.array(z.string()).nullish(),
                    userID: z.string(),
                  })
                  .passthrough(),
              })
              .passthrough(),
            kind: z.string(),
            lang: z.string().nullish(),
          })
          .passthrough(),
      })
      .passthrough(),
  },
  {
    method: "post",
    path: "/api/auth/password-recover",
    alias: "authPasswordRecover",
    description: `Start password recovery for account with given email`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Request data`,
        type: "Body",
        schema: authPasswordRecover_Body,
      },
      {
        name: "context",
        type: "Query",
        schema: z.string().nullish(),
      },
    ],
    response: z
      .object({
        context: z.string().nullish(),
        data: z
          .object({
            item: z
              .object({
                acveID: z.string(),
                createdAt: z.string(),
                type: z.string(),
                userID: z.string(),
              })
              .passthrough(),
            kind: z.string(),
            lang: z.string().nullish(),
          })
          .passthrough(),
      })
      .passthrough(),
  },
  {
    method: "post",
    path: "/api/auth/password-reset/:resetID",
    alias: "authPasswordReset",
    description: `Reset password for account with given email`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Request data`,
        type: "Body",
        schema: authPasswordReset_Body,
      },
      {
        name: "resetID",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "context",
        type: "Query",
        schema: z.string().nullish(),
      },
    ],
    response: z
      .object({
        context: z.string().nullish(),
        data: z.object({}).partial().passthrough(),
      })
      .passthrough(),
  },
  {
    method: "post",
    path: "/api/auth/password-reset/:resetID/validate",
    alias: "authPasswordResetValidate",
    description: `Verify that password reset is still valid`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Request data`,
        type: "Body",
        schema: authPasswordReset_Body,
      },
      {
        name: "resetID",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "context",
        type: "Query",
        schema: z.string().nullish(),
      },
    ],
    response: z
      .object({
        context: z.string().nullish(),
        data: z
          .object({
            item: z.object({ isValid: z.string() }).passthrough(),
            kind: z.string(),
            lang: z.string().nullish(),
          })
          .passthrough(),
      })
      .passthrough(),
  },
  {
    method: "get",
    path: "/api/auth/refresh",
    alias: "authRefresh",
    description: `Generate new short-lived JWT for current session user`,
    requestFormat: "json",
    parameters: [
      {
        name: "context",
        type: "Query",
        schema: z.string().nullish(),
      },
    ],
    response: z
      .object({
        context: z.string().nullish(),
        data: z
          .object({
            item: z
              .object({
                jwt: z.string(),
                roles: z.array(z.string()),
                user: z
                  .object({
                    applID: z.string(),
                    avatar: z.string().nullish(),
                    createdAt: z.string(),
                    deletedAt: z.string().nullish(),
                    info: z.object({}).partial().passthrough(),
                    name: z.string(),
                    pushTokens: z.array(z.string()).nullish(),
                    userID: z.string(),
                  })
                  .passthrough(),
              })
              .passthrough(),
            kind: z.string(),
            lang: z.string().nullish(),
          })
          .passthrough(),
      })
      .passthrough(),
  },
  {
    method: "post",
    path: "/api/auth/signin",
    alias: "authLogin",
    description: `Login with email &amp; password`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Request data`,
        type: "Body",
        schema: authLogin_Body,
      },
      {
        name: "context",
        type: "Query",
        schema: z.string().nullish(),
      },
    ],
    response: z
      .object({
        context: z.string().nullish(),
        data: z
          .object({
            item: z
              .object({
                jwt: z.string(),
                roles: z.array(z.string()),
                user: z
                  .object({
                    applID: z.string(),
                    avatar: z.string().nullish(),
                    createdAt: z.string(),
                    deletedAt: z.string().nullish(),
                    info: z.object({}).partial().passthrough(),
                    name: z.string(),
                    pushTokens: z.array(z.string()).nullish(),
                    userID: z.string(),
                  })
                  .passthrough(),
              })
              .passthrough(),
            kind: z.string(),
            lang: z.string().nullish(),
          })
          .passthrough(),
      })
      .passthrough(),
  },
  {
    method: "post",
    path: "/api/auth/signout",
    alias: "authSignout",
    description: `Signout and forget session and refresh tokens`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Request data`,
        type: "Body",
        schema: z.object({}).partial().passthrough(),
      },
      {
        name: "context",
        type: "Query",
        schema: z.string().nullish(),
      },
    ],
    response: z
      .object({
        context: z.string().nullish(),
        data: z
          .object({
            item: z.string(),
            kind: z.string(),
            lang: z.string().nullish(),
          })
          .passthrough(),
      })
      .passthrough(),
  },
  {
    method: "post",
    path: "/api/auth/token-auth",
    alias: "authEmailTokenAuth",
    description: `Start authentication with token for given email`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Request data`,
        type: "Body",
        schema: authEmailTokenAuth_Body,
      },
      {
        name: "context",
        type: "Query",
        schema: z.string().nullish(),
      },
    ],
    response: z
      .object({
        context: z.string().nullish(),
        data: z
          .object({
            item: z
              .object({
                acveID: z.string(),
                createdAt: z.string(),
                type: z.string(),
                userID: z.string(),
              })
              .passthrough(),
            kind: z.string(),
            lang: z.string().nullish(),
          })
          .passthrough(),
      })
      .passthrough(),
  },
  {
    method: "post",
    path: "/api/auth/token-signin",
    alias: "authEmailTokenSignin",
    description: `Authentication with token for given email`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Request data`,
        type: "Body",
        schema: authEmailTokenSignin_Body,
      },
      {
        name: "context",
        type: "Query",
        schema: z.string().nullish(),
      },
    ],
    response: z
      .object({
        context: z.string().nullish(),
        data: z
          .object({
            item: z
              .object({
                jwt: z.string(),
                roles: z.array(z.string()),
                user: z
                  .object({
                    applID: z.string(),
                    avatar: z.string().nullish(),
                    createdAt: z.string(),
                    deletedAt: z.string().nullish(),
                    info: z.object({}).partial().passthrough(),
                    name: z.string(),
                    pushTokens: z.array(z.string()).nullish(),
                    userID: z.string(),
                  })
                  .passthrough(),
              })
              .passthrough(),
            kind: z.string(),
            lang: z.string().nullish(),
          })
          .passthrough(),
      })
      .passthrough(),
  },
  {
    method: "post",
    path: "/api/auth/validate-email",
    alias: "authValidateEmail",
    description: `checks if the email is valid for appl_id`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Request data`,
        type: "Body",
        schema: authEmailTokenAuth_Body,
      },
      {
        name: "context",
        type: "Query",
        schema: z.string().nullish(),
      },
    ],
    response: z
      .object({
        context: z.string().nullish(),
        data: z
          .object({
            item: z
              .object({
                applID: z.string(),
                email: z.string(),
                isValid: z.boolean(),
              })
              .passthrough(),
            kind: z.string(),
            lang: z.string().nullish(),
          })
          .passthrough(),
      })
      .passthrough(),
  },
  {
    method: "post",
    path: "/api/onboarding/create-account",
    alias: "authCreateAccount",
    description: `Create a new account`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Request data`,
        type: "Body",
        schema: authCreateAccount_Body,
      },
      {
        name: "context",
        type: "Query",
        schema: z.string().nullish(),
      },
    ],
    response: z
      .object({
        context: z.string().nullish(),
        data: z
          .object({
            item: z
              .object({
                jwt: z.string(),
                roles: z.array(z.string()),
                user: z
                  .object({
                    applID: z.string(),
                    avatar: z.string().nullish(),
                    createdAt: z.string(),
                    deletedAt: z.string().nullish(),
                    info: z.object({}).partial().passthrough(),
                    name: z.string(),
                    pushTokens: z.array(z.string()).nullish(),
                    userID: z.string(),
                  })
                  .passthrough(),
              })
              .passthrough(),
            kind: z.string(),
            lang: z.string().nullish(),
          })
          .passthrough(),
      })
      .passthrough(),
  },
  {
    method: "get",
    path: "/api/users/:userID",
    alias: "usersGetUserByID",
    description: `Return the authenticated user&#x27;s data`,
    requestFormat: "json",
    parameters: [
      {
        name: "userID",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "context",
        type: "Query",
        schema: z.string().nullish(),
      },
    ],
    response: z
      .object({
        context: z.string().nullish(),
        data: z
          .object({
            item: z
              .object({
                applID: z.string(),
                avatar: z.string().nullish(),
                createdAt: z.string(),
                deletedAt: z.string().nullish(),
                info: z.object({}).partial().passthrough(),
                name: z.string(),
                pushTokens: z.array(z.string()).nullish(),
                userID: z.string(),
              })
              .passthrough(),
            kind: z.string(),
            lang: z.string().nullish(),
          })
          .passthrough(),
      })
      .passthrough(),
  },
  {
    method: "patch",
    path: "/api/users/:userID",
    alias: "usersPatchUserByID",
    description: `Update user&#x27;s data`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Request data`,
        type: "Body",
        schema: usersGetProfileMe_Body,
      },
      {
        name: "userID",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "context",
        type: "Query",
        schema: z.string().nullish(),
      },
    ],
    response: z
      .object({
        context: z.string().nullish(),
        data: z
          .object({
            item: z
              .object({
                applID: z.string(),
                avatar: z.string().nullish(),
                createdAt: z.string(),
                deletedAt: z.string().nullish(),
                email: z.string().nullish(),
                info: z.object({}).partial().passthrough(),
                name: z.string(),
                userID: z.string(),
              })
              .passthrough(),
            kind: z.string(),
            lang: z.string().nullish(),
          })
          .passthrough(),
      })
      .passthrough(),
  },
  {
    method: "get",
    path: "/api/users/profile/:userID",
    alias: "usersGetProfileMe",
    description: `Get user profile`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `Request data`,
        type: "Body",
        schema: usersGetProfileMe_Body,
      },
      {
        name: "userID",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "context",
        type: "Query",
        schema: z.string().nullish(),
      },
    ],
    response: z
      .object({
        context: z.string().nullish(),
        data: z
          .object({
            item: z
              .object({
                applID: z.string(),
                avatar: z.string().nullish(),
                createdAt: z.string(),
                deletedAt: z.string().nullish(),
                email: z.string().nullish(),
                info: z.object({}).partial().passthrough(),
                name: z.string(),
                userID: z.string(),
              })
              .passthrough(),
            kind: z.string(),
            lang: z.string().nullish(),
          })
          .passthrough(),
      })
      .passthrough(),
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
