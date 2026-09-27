import { SettingsList } from "@/components/settings/SettingsList";
import { getUserSession } from "@/actions/auth";

export default async function SettingsPage() {
  const session = await getUserSession();
  
  return (
    <div className="flex w-full h-full">
      <SettingsList user={session} />
      <div className="flex-1 hidden md:flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-24 h-24 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-4 border border-border-subtle">
            <span className="text-4xl">⚙️</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">TIDO Settings</h2>
          <p className="text-text-muted text-sm max-w-sm">
            Customize your experience, update privacy settings, or manage your account.
          </p>
        </div>
      </div>
    </div>
  );
}
