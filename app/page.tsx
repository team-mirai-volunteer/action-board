import Home from "./home";

export default async function Page(props: {
  searchParams: Promise<{ ref?: string; preview?: string }>;
}) {
  return <Home {...props} />;
}
