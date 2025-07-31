import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export function EnvVarWarning() {
  return (
    <div className="flex gap-4 items-center">
      <Badge variant={"outline"} className="font-normal">
        Supabase environment variables required
      </Badge>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={"outline"}
          aria-disabled="true"
          disabled
          className="opacity-75 cursor-none pointer-events-none"
        >
          Sign in
        </Button>
        <Button
          size="sm"
          variant={"default"}
          aria-disabled="true"
          disabled
          className="opacity-75 cursor-none pointer-events-none"
        >
          Sign up
        </Button>
      </div>
    </div>
  );
}
