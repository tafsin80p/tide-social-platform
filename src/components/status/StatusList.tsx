"use client";

import { Plus, MoreVertical } from "lucide-react";
import { currentUser, mockUsers } from "@/lib/mock-data";

export function StatusList() {
  return (
    <div className="w-full md:w-[340px] h-full bg-surface border-r border-border-subtle flex flex-col flex-shrink-0">
      <div className="p-4 pt-6 md:pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Status</h1>
          <button className="p-2 text-text-secondary hover:text-text-primary rounded-full transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        <button className="w-full flex items-center gap-4 p-2 rounded-2xl hover:bg-surface-active transition-colors text-left group">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt="My Status"
              className="w-14 h-14 rounded-full object-cover"
            />
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary text-white rounded-full border-2 border-surface flex items-center justify-center">
              <Plus className="w-3 h-3" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">My Status</p>
            <p className="text-xs text-text-secondary mt-0.5">Tap to add status update</p>
          </div>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-2 pb-20 md:pb-4 space-y-4">
        <div className="px-2">
          <h3 className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-wider">Recent updates</h3>
          <div className="space-y-1">
            {mockUsers.slice(0, 3).map((user) => (
              <button
                key={user.id}
                className="w-full flex items-center gap-4 p-2 rounded-2xl hover:bg-surface-active transition-colors text-left"
              >
                <div className="p-0.5 rounded-full border-2 border-primary">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border border-surface"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary">{user.name}</p>
                  <p className="text-xs text-text-secondary mt-0.5">Today, 8:45 AM</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="px-2">
          <h3 className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-wider">Viewed updates</h3>
          <div className="space-y-1">
            {mockUsers.slice(3, 5).map((user) => (
              <button
                key={user.id}
                className="w-full flex items-center gap-4 p-2 rounded-2xl hover:bg-surface-active transition-colors text-left opacity-70 hover:opacity-100"
              >
                <div className="p-0.5 rounded-full border-2 border-border-subtle">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border border-surface"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary">{user.name}</p>
                  <p className="text-xs text-text-secondary mt-0.5">Yesterday, 10:24 PM</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
