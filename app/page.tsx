import { isAfterSwitchTime } from "@/lib/time-check";
import type { JSX } from "react";
import NewHome from "./newHome";
import OldHome from "./oldHome";
export const dynamic = "force-dynamic";

export default function Page(props: {
  searchParams: Promise<{ ref?: string }>;
}) {
  return isAfterSwitchTime() ? <NewHome /> : <OldHome {...props} />;
}
