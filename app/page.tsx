import Home from "./home";
export const dynamic = "force-dynamic";

export default async function Page(props: {
  searchParams: Promise<{ ref?: string; preview?: string }>;
}) {
  return <Home {...props} />;
}
