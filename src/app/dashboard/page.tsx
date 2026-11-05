/**
 * Persora — /dashboard legacy alias.
 *
 * The user console lives at /overview (see src/app/(dashboard)/overview).
 * Earlier builds linked to /dashboard, so this route redirects instead of
 * 404-ing for bookmarks and old e-mails.
 */

import { redirect } from "next/navigation";

export default function DashboardAliasPage() {
  redirect("/overview");
}
