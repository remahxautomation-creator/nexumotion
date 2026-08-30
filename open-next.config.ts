import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal configuration: no incremental cache, queue or tag cache configured
// yet. Every catalogue page is `force-dynamic` and reads the database on each
// request, so there is nothing meaningful to cache at this layer. Add an R2
// incremental cache here if pages are later made static.
export default defineCloudflareConfig();
