"use client";
import { useSearchParams } from "next/navigation";
import { VenueCodeHandler } from "./venue-code-handler";

export function VenueCodeHandlerWrapper() {
  const searchParams = useSearchParams();
  const venueCode = searchParams.get("cv");
  if (!venueCode) return null;
  return <VenueCodeHandler venueCode={venueCode} />;
}
