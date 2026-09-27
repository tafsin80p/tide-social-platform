"use client";

import { Hash, Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const mockChannels = [
  { id: 'ch1', name: 'Announcements', unread: 2, members: '1.2k' },
  { id: 'ch2', name: 'Design Team', unread: 0, members: '14' },
  { id: 'ch3', name: 'Engineering', unread: 5, members: '48' },
  { id: 'ch4', name: 'Random', unread: 0, members: '156' },
];

export function ChannelsList() {
  return (
    <div className="w-full md:w-[340px] h-full bg-surface border-r border-border-subtle flex flex-col flex-shrink-0">
      <div className="p-4 pt-6 md:pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Channels</h1>
          <button className="p-2 bg-surface-elevated rounded-full hover:bg-surface-active transition-colors text-text-secondary hover:text-text-primary">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-text-muted" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 bg-surface-elevated border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-text-primary"
            placeholder="Search channels..."
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-2 pb-20 md:pb-4 space-y-1">
        {mockChannels.map((channel) => {
          return (
            <button
              key={channel.id}
              className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-surface-active transition-colors text-left"
            >
              <div className="w-12 h-12 bg-surface-elevated rounded-xl flex items-center justify-center flex-shrink-0 border border-border-subtle text-primary">
                <Hash className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h3 className={cn("font-semibold text-sm truncate", channel.unread > 0 ? "text-text-primary" : "text-text-primary")}>
                    {channel.name}
                  </h3>
                  {channel.unread > 0 && (
                    <div className="bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0">
                      {channel.unread}
                    </div>
                  )}
                </div>
                <p className="text-xs text-text-secondary truncate">
                  {channel.members} members
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
