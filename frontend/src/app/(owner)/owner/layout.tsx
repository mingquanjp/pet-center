import { OwnerLayout } from "@/layouts/owner/OwnerLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <OwnerLayout>{children}</OwnerLayout>;
}
