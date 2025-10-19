/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as ads from "../ads.js";
import type * as audienceGroups from "../audienceGroups.js";
import type * as auth from "../auth.js";
import type * as http from "../http.js";
import type * as messages from "../messages.js";
import type * as personas from "../personas.js";
import type * as simulation from "../simulation.js";
import type * as users from "../users.js";

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
  auth: typeof auth;
  http: typeof http;
  messages: typeof messages;
  personas: typeof personas;
  simulation: typeof simulation;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
