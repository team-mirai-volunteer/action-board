import { isAfterSwitchTime } from "@/lib/time-check";
import type { JSX } from "react";
import NewHome from "./newHome";
import OldHome from "./oldHome";

export const runtime = "edge";

export const dynamic = "force-dynamic";

export default async function Page(props: {
  searchParams: Promise<{ ref?: string; preview?: string }>;
}) {
  const params = await props.searchParams;
  const isPreview = params.preview === "1";

  if (isPreview) {
    return <NewHome />;
  }

  return isAfterSwitchTime() ? <NewHome /> : <OldHome {...props} />;
}
