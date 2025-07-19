import { isAfterSwitchTime } from "@/lib/time-check";
import NewLayout from "./newLayout";
import OldLayout from "./oldLayout";

export default function RootLayout(props: {
  children: React.ReactNode;
}) {
  return isAfterSwitchTime() ? (
    <NewLayout {...props} />
  ) : (
    <OldLayout {...props} />
  );
}
