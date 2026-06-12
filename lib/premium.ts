import { clerkClient } from "@clerk/nextjs/server";

/** Roles stored in Clerk publicMetadata.role that bypass the daily premium limit. */
const UNLIMITED_ROLES = new Set(["admin", "pro"]);

export async function hasUnlimitedPremium(userId: string): Promise<boolean> {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = user.publicMetadata?.role;
    return typeof role === "string" && UNLIMITED_ROLES.has(role);
}
