import BillingSection from "@/features/billing/components/BillingSection";
import ProfileSection from "../components/ProfileSection";

const BillingPage = () => (
  <ProfileSection
    title="Billing"
    description="Your plan, upgrades and cancellation."
  >
    <BillingSection />
  </ProfileSection>
);

export default BillingPage;
