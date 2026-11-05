/**
 * Persora — /signup alias.
 *
 * The canonical registration route is /register (linked from the public
 * website). /signup is kept as a permanent redirect so external links and
 * docs that use the shorter form keep working.
 */

import { redirect } from "next/navigation";

export default function SignupAliasPage() {
  redirect("/register");
}
