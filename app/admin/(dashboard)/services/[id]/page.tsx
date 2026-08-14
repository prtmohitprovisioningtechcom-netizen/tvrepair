import { ServiceEditor } from "@/components/admin/ServiceEditor";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ServiceEditor id={Number(id)} />;
}
