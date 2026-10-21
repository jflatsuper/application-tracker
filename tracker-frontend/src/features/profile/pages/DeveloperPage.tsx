import ProfileSection from "../components/ProfileSection";
import SeedPanel from "../components/SeedPanel";

const DeveloperPage = () => (
  <ProfileSection title="Developer" description="Only shown in development.">
    <SeedPanel />
  </ProfileSection>
);

export default DeveloperPage;
