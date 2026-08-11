import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import type { AppAbility, AppAuthFacts } from "./types.js";

/**
 * Defines what this requester may do.
 *
 * No rule means no access. Generated table routes ask for actions such as
 * `read`, `create`, and `export` on the table name. Custom routes can use
 * feature subjects such as `quote_publication` or `public_api_sample` and then
 * apply their own row predicates through `auth.rowSecurity`.
 */
export function buildAbility(ctx: AppAuthFacts): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  // PUBLIC: these features are intentionally available to anonymous visitors.
  can("read", "public_api_sample");
  can(["read", "create", "update", "export"], "books");
  can(["read", "create", "update", "export"], "quotes");
  // The reset only restores the pristine demo snapshot, so letting the
  // anonymous scheduler call it cannot leak or destroy anything a visitor
  // couldn't already edit through the public table routes.
  can("run", "demo_reset");

  if (ctx.principal.kind === "user") {
    can("read", "hello");
    can("read", "agent_access_token");
    can("create", "agent_access_token");
    can("delete", "agent_access_token");
  }

  if (
    ctx.principal.kind === "user" &&
    ctx.principal.membership.roles.includes("owner")
  ) {
    can("delete", ["books", "quotes"]);

    // This allows owner actions; row security still limits database rows to the
    // request's trusted ownership facts.
    can("manage", "all");
  }

  return build();
}
