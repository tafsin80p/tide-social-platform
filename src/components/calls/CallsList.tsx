"use client";

import { useState } from "react";
import { Search, Phone, PhoneMissed, PhoneIncoming, PhoneOutgoing, Video, Plus } from "lucide-react";
import { mockCalls } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const filters = ["All", "Missed", "Incoming", "Outgoing"];

export function CallsList() {
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <div className="w-full md:w-[340px] h-full bg-surface border-r border-border-subtle flex flex-col flex-shrink-0">
      <div className="p-4 pt-6 md:pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Calls</h1>
          <div className="flex gap-2">
            <button className="p-2 bg-surface-elevated rounded-full hover:bg-surface-active transition-colors text-text-secondary hover:text-text-primary">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 bg-surface-elevated rounded-full hover:bg-surface-active transition-colors text-text-secondary hover:text-text-primary">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-text-muted" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 bg-surface-elevated border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-text-primary"
            placeholder="Search calls..."
          />
        </div>

        <div className="flex space-x-2 overflow-x-auto hide-scrollbar pb-1">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                activeFilter === filter
                  ? "bg-primary text-white"
                  : "bg-surface-elevated text-text-secondary hover:bg-surface-active hover:text-text-primary"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-2 pb-20 md:pb-4 space-y-1">
        {mockCalls.map((call) => {
          return (
            <button
              key={call.id}
              className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-surface-active transition-colors text-left"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={call.caller.avatar}
                  alt={call.caller.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className={cn("font-semibold text-sm truncate", call.direction === 'missed' ? "text-error" : "text-text-primary")}>
                    {call.caller.name}
                  </h3>
                  <span className="text-[11px] text-text-muted">
                    {call.timestamp}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                  {call.direction === 'missed' && <PhoneMissed className="w-3 h-3 text-error" />}
                  {call.direction === 'incoming' && <PhoneIncoming className="w-3 h-3 text-text-secondary" />}
                  {call.direction === 'outgoing' && <PhoneOutgoing className="w-3 h-3 text-success" />}
                  
                  <span>
                    {call.direction.charAt(0).toUpperCase() + call.direction.slice(1)}
                    {call.duration && ` • ${call.duration}`}
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0 text-text-muted hover:text-text-primary transition-colors">
                {call.type === 'video' ? <Video className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
