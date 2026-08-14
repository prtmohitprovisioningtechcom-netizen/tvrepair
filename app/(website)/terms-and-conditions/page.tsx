import { CmsLegalPage, legalMetadata } from "@/components/website/CmsLegalPage";

export const generateMetadata = () => legalMetadata("terms-and-conditions", "Terms and Conditions");

export default function Page() {
  return <CmsLegalPage slug="terms-and-conditions" title="Terms and Conditions" />;
}
