import { CmsLegalPage, legalMetadata } from "@/components/website/CmsLegalPage";

export const generateMetadata = () => legalMetadata("privacy-policy", "Privacy Policy");

export default function Page() {
  return <CmsLegalPage slug="privacy-policy" title="Privacy Policy" />;
}
