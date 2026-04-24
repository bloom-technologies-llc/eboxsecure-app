import ProtectPage from "@/app/protect-page";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ProtectPage();
  return <>{children}</>;
}
