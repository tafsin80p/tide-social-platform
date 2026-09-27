"use client";

import { useState, useEffect } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, MoreHorizontal, Maximize2, MessageSquare } from "lucide-react";
import { mockUsers } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";

export default function CallScreen() {
  const params = useParams();
  const router = useRouter();
  const type = params.type as string; // 'voice' or 'video'
  const activeUser = mockUsers[0]; // Maria
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(type === 'voice');
  const [callTime, setCallTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCallTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const endCall = () => {
    router.back();
  };

  if (type === 'voice') {
    return (
      <div className="flex flex-col h-screen w-full bg-[#030914] relative overflow-hidden items-center justify-between py-12">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="w-full flex justify-between items-start px-6 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-text-primary font-bold text-sm">T</div>
            <span className="font-bold text-lg text-text-primary">TIDO</span>
          </div>
          <button className="p-2 bg-surface/50 rounded-full backdrop-blur">
            <Maximize2 className="w-5 h-5 text-text-primary" />
          </button>
        </div>

        <div className="flex flex-col items-center z-10">
          <h2 className="text-3xl font-bold text-text-primary mb-2">{activeUser.name}</h2>
          <p className="text-text-muted mb-12">Ringing... {formatTime(callTime)}</p>
          
          <div className="relative">
            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-full border border-primary/30 animate-[ping_3s_ease-in-out_infinite]"></div>
            <div className="absolute -inset-4 rounded-full border border-primary/20 animate-[ping_3s_ease-in-out_infinite_0.5s]"></div>
            <div className="absolute -inset-8 rounded-full border border-primary/10 animate-[ping_3s_ease-in-out_infinite_1s]"></div>
            
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-primary/30 relative z-10 bg-surface">
              <img src={activeUser.avatar} alt={activeUser.name} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 z-10">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={cn("w-14 h-14 rounded-full flex items-center justify-center transition-colors backdrop-blur", isMuted ? "bg-white text-black" : "bg-surface/50 text-text-primary hover:bg-surface")}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          
          <button 
            onClick={endCall}
            className="w-16 h-16 rounded-full flex items-center justify-center bg-error hover:bg-red-600 transition-colors shadow-[0_0_20px_rgba(239,68,68,0.4)]"
          >
            <PhoneOff className="w-7 h-7 text-text-primary" />
          </button>
          
          <button 
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={cn("w-14 h-14 rounded-full flex items-center justify-center transition-colors backdrop-blur", isVideoOff ? "bg-white text-black" : "bg-surface/50 text-text-primary hover:bg-surface")}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>
        </div>
      </div>
    );
  }

  // Video Call
  return (
    <div className="flex flex-col h-screen w-full bg-background relative overflow-hidden">
      {/* Remote Video (Mock) */}
      <img src={activeUser.avatar} alt={activeUser.name} className="absolute inset-0 w-full h-full object-cover opacity-80" />
      
      {/* Overlay gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
      
      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10">
        <div>
          <h2 className="text-2xl font-bold text-text-primary drop-shadow-md">{activeUser.name}</h2>
          <p className="text-text-primary/80 font-medium drop-shadow-md">{formatTime(callTime)}</p>
        </div>
      </div>

      {/* Local Video Preview */}
      <div className="absolute top-6 right-6 w-32 h-48 bg-surface-active rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-20">
        {!isVideoOff ? (
          <img src="https://i.pravatar.cc/150?u=u0" alt="Me" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface">
            <span className="text-text-primary text-xl font-bold">T</span>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-6 z-10">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className={cn("w-14 h-14 rounded-full flex items-center justify-center transition-colors backdrop-blur", isMuted ? "bg-white text-black" : "bg-surface/50 text-text-primary hover:bg-background/70")}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>
        
        <button 
          onClick={() => setIsVideoOff(!isVideoOff)}
          className={cn("w-14 h-14 rounded-full flex items-center justify-center transition-colors backdrop-blur", isVideoOff ? "bg-white text-black" : "bg-surface/50 text-text-primary hover:bg-background/70")}
        >
          {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </button>
        
        <button className="w-14 h-14 rounded-full flex items-center justify-center bg-surface/50 text-text-primary hover:bg-background/70 transition-colors backdrop-blur">
          <MessageSquare className="w-6 h-6" />
        </button>
        
        <button className="w-14 h-14 rounded-full flex items-center justify-center bg-surface/50 text-text-primary hover:bg-background/70 transition-colors backdrop-blur">
          <MoreHorizontal className="w-6 h-6" />
        </button>
        
        <button 
          onClick={endCall}
          className="w-16 h-16 rounded-full flex items-center justify-center bg-error hover:bg-red-600 transition-colors shadow-[0_0_20px_rgba(239,68,68,0.4)] ml-2"
        >
          <PhoneOff className="w-7 h-7 text-text-primary" />
        </button>
      </div>
    </div>
  );
}
