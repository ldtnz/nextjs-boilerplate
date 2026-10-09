import PageHeader from "@/components/PageHeader";
import SettingsSection from "@/components/SettingsSection";
import DisplayNameEditor from "@/components/DisplayNameEditor";
import { getSettings } from "@/lib/settings";
import { APP_NAME } from "@/lib/app";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <main className="mx-auto w-full max-w-2xl px-3 pb-16 sm:px-5">
      <PageHeader title="Settings" back={{ href: "/", label: `Back to ${APP_NAME}` }} />
      {/* One gap between sections, set here rather than as a margin on each,
          so adding or removing one cannot leave a doubled or missing gap. */}
      <div className="space-y-3">
        <SettingsSection title="Your name" description="Shown in the header on the home page. Leave it empty to show nothing.">
          <DisplayNameEditor initialName={settings.displayName} />
        </SettingsSection>
      </div>
    </main>
  );
}
