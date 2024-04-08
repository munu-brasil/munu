import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const endpoints = makeApi([
  {
    method: "post",
    path: "/api/auth/signin",
    alias: "authSignin",
    description: `signin example`,
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
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
