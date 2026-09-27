"use client";

import { useState } from "react";
import { Camera, Search, ArrowLeft, Check } from "lucide-react";
import { mockUsers } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function CreateGroup() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");

  const toggleUser = (id: string) => {
    setSelectedUsers(prev => 
      prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full md:w-[400px] h-full bg-surface border-r border-border-subtle flex flex-col flex-shrink-0 mx-auto md:mx-0">
      <div className="h-16 border-b border-border-subtle flex items-center px-4 bg-background z-10 shrink-0">
        <button className="p-2 text-text-secondary hover:text-text-primary transition-colors mr-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-text-primary">Create Group</h1>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar pb-24">
        <div className="p-6 border-b border-border-subtle flex flex-col items-center">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-4 relative cursor-pointer hover:bg-primary/30 transition-colors border border-primary/30">
            {groupName ? (
              <span className="text-3xl font-bold text-text-primary">{groupName.charAt(0).toUpperCase()}</span>
            ) : (
              <Camera className="w-8 h-8" />
            )}
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-surface-elevated rounded-full flex items-center justify-center border-2 border-surface">
              <Camera className="w-3 h-3 text-text-secondary" />
            </div>
          </div>
          
          <div className="w-full">
            <label className="text-xs font-medium text-text-muted mb-1 block px-2">Group name</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full bg-surface-elevated border-b-2 border-primary border-t-0 border-l-0 border-r-0 px-3 py-2 text-text-primary focus:outline-none focus:ring-0 text-sm"
              placeholder="TIDO Friends"
            />
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Participants ({selectedUsers.length}/256)
            </h3>
          </div>
          
          <div className="space-y-1">
            {mockUsers.map((user) => {
              const isSelected = selectedUsers.includes(user.id);
              return (
                <button
                  key={user.id}
                  onClick={() => toggleUser(user.id)}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-surface-active transition-colors text-left group"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary">{user.name}</p>
                    <p className="text-xs text-text-secondary truncate">{user.online ? 'Online' : user.lastSeen}</p>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center border transition-colors",
                    isSelected ? "bg-primary border-primary" : "border-text-muted group-hover:border-text-secondary"
                  )}>
                    {isSelected && <Check className="w-3 h-3 text-text-primary" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-surface border-t border-border-subtle shrink-0 flex justify-center">
        <button 
          disabled={selectedUsers.length === 0 || !groupName.trim()}
          className="w-full md:w-auto md:px-12 py-3 bg-primary text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-hover transition-colors shadow-lg"
        >
          Create Chat
        </button>
      </div>
    </div>
  );
}
