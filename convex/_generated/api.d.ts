/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ads from "../ads.js";
import type * as audienceGroups from "../audienceGroups.js";
import type * as audiences from "../audiences.js";
import type * as auth from "../auth.js";
import type * as http from "../http.js";
import type * as messages from "../messages.js";
import type * as personas from "../personas.js";
import type * as sessions from "../sessions.js";
import type * as simulation from "../simulation.js";
import type * as userAudiences from "../userAudiences.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  ads: typeof ads;
  audienceGroups: typeof audienceGroups;
  audiences: typeof audiences;
  auth: typeof auth;
  http: typeof http;
  messages: typeof messages;
  personas: typeof personas;
  sessions: typeof sessions;
  simulation: typeof simulation;
  userAudiences: typeof userAudiences;
  users: typeof users;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
