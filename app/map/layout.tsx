export default function MapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="relative flex-1 w-full">{children}</div>;
}
