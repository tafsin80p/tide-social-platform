import { ChannelsList } from "@/components/channels/ChannelsList";

export default function ChannelsPage() {
  return (
    <div className="flex w-full h-full">
      <ChannelsList />
      <div className="flex-1 hidden md:flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-24 h-24 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-4 border border-border-subtle">
            <span className="text-4xl">📢</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">Channels</h2>
          <p className="text-text-muted text-sm max-w-sm">
            Stay updated with your favorite communities and creators.
          </p>
        </div>
      </div>
    </div>
  );
}
