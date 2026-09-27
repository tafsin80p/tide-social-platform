import { CreateGroup } from "@/components/groups/CreateGroup";

export default function GroupsPage() {
  return (
    <div className="flex w-full h-full">
      <CreateGroup />
      <div className="flex-1 hidden md:flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-24 h-24 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-4 border border-border-subtle">
            <span className="text-4xl">👥</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">Groups & Communities</h2>
          <p className="text-text-muted text-sm max-w-sm">
            Create a group to stay connected with friends, family, or your team.
          </p>
        </div>
      </div>
    </div>
  );
}
