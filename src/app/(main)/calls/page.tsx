import { CallsList } from "@/components/calls/CallsList";

export default function CallsPage() {
  return (
    <div className="flex w-full h-full">
      <CallsList />
      <div className="flex-1 hidden md:flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-24 h-24 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-4 border border-border-subtle">
            <span className="text-4xl">📞</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">Your Calls</h2>
          <p className="text-text-muted text-sm max-w-sm">
            Select a call from the list to view details or start a new call from your contacts.
          </p>
        </div>
      </div>
    </div>
  );
}
