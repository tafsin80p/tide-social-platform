"use client";

import { Video, Phone, MoreVertical, Search, Paperclip, Smile, Mic, Send, Image as ImageIcon, Loader2, MoreHorizontal, Edit2, Trash2, Reply, Camera, File, Square, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import EmojiPicker, { EmojiStyle, Theme } from 'emoji-picker-react';
import { getMessages, sendMessage, getConversationById, markAsRead, toggleReaction, editMessage, deleteMessage } from "@/actions/chat";
import { uploadMedia } from "@/actions/upload";
import { getUserSession } from "@/actions/auth";
import { formatOnlineStatus } from "@/lib/utils";
import { toast } from "react-hot-toast";

const VoiceMessagePlayer = ({ src, isMe = false }: { src: string, isMe?: boolean }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const animationRef = useRef<number>();

  const updateProgress = () => {
    if (audioRef.current && !audioRef.current.paused) {
      setCurrentTime(audioRef.current.currentTime);
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [src]);

  const togglePlay = () => {
    if (audioRef.current?.paused) {
      audioRef.current.play();
      setIsPlaying(true);
      animationRef.current = requestAnimationFrame(updateProgress);
    } else {
      audioRef.current?.pause();
      setIsPlaying(false);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className={cn("flex items-center gap-2 w-52 sm:w-64 min-w-[200px]", isMe ? "text-white" : "text-text-primary")}>
      <audio ref={audioRef} src={src} className="hidden" preload="metadata" />
      <button 
        type="button" 
        onClick={togglePlay} 
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform hover:scale-105 shadow-[0_2px_4px_rgba(0,0,0,0.1)]",
          isMe ? "bg-white text-primary" : "bg-primary text-white"
        )}
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
      </button>
      <div className="flex-1 flex items-center h-full px-1.5">
        <input 
          type="range" 
          min={0} 
          max={duration || 100} 
          value={currentTime} 
          onChange={handleSeek}
          className={cn(
            "w-full h-1 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full cursor-pointer",
            isMe 
              ? "bg-white/40 [&::-webkit-slider-thumb]:bg-white" 
              : "bg-black/10 dark:bg-white/10 [&::-webkit-slider-thumb]:bg-primary"
          )}
        />
      </div>
      <div className={cn(
        "px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0 shadow-[0_2px_4px_rgba(0,0,0,0.05)]",
        isMe ? "bg-white text-gray-700" : "bg-surface text-text-secondary border border-border-subtle"
      )}>
        {isPlaying ? formatTime(currentTime) : formatTime(duration)}
      </div>
    </div>
  );
};

export function ChatArea() {
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chat");
  const [messages, setMessages] = useState<any[]>([]);
  const [currentConversation, setCurrentConversation] = useState<any>(null);
  const [activeUser, setActiveUser] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [activeReactionMessageId, setActiveReactionMessageId] = useState<string | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editMessageText, setEditMessageText] = useState("");
  const [replyingToMessage, setReplyingToMessage] = useState<any>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<{file: File | Blob, url: string, type: string, name: string} | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cancelRecordingRef = useRef(false);

  const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

  const handleReaction = async (messageId: string, emoji: string) => {
    setActiveReactionMessageId(null);
    setHoveredMessageId(null);
    
    // Optimistic update
    setMessages(prev => prev.map(msg => {
      if (msg._id === messageId) {
        const reactions = msg.reactions || [];
        const existingIdx = reactions.findIndex((r: any) => r.userId === currentUser?.id && r.emoji === emoji);
        let newReactions = [...reactions];
        if (existingIdx > -1) {
          newReactions.splice(existingIdx, 1);
        } else {
          newReactions.push({ emoji, userId: currentUser?.id });
        }
        return { ...msg, reactions: newReactions };
      }
      return msg;
    }));

    await toggleReaction(messageId, emoji);
  };

  const handleDelete = async (messageId: string, type: 'me' | 'everyone') => {
    setActiveDropdownId(null);
    setHoveredMessageId(null);
    
    // Optimistic UI
    setMessages(prev => prev.map(msg => {
      if (msg._id === messageId) {
        if (type === 'everyone') {
          return { ...msg, text: "This message was deleted.", isDeletedForEveryone: true };
        } else {
          return null;
        }
      }
      return msg;
    }).filter(Boolean));

    await deleteMessage(messageId, type);
  };

  const handleEditSubmit = async (e: React.FormEvent, messageId: string) => {
    e.preventDefault();
    if (!editMessageText.trim()) return;

    setEditingMessageId(null);
    
    // Optimistic UI
    setMessages(prev => prev.map(msg => {
      if (msg._id === messageId) {
        return { ...msg, text: editMessageText, isEdited: true };
      }
      return msg;
    }));

    await editMessage(messageId, editMessageText);
  };

  useEffect(() => {
    let intervalId: any;

    async function initAndLoad() {
      if (!chatId) return;
      setLoading(true);

      const session = await getUserSession();
      setCurrentUser(session);
      
      if (!session) return;

      const [msgRes, convRes] = await Promise.all([
        getMessages(chatId),
        getConversationById(chatId)
      ]);

      await markAsRead(chatId);

      if (msgRes.success) setMessages(msgRes.messages);
      if (convRes.success) {
        setCurrentConversation(convRes.conversation);
        const other = convRes.conversation.participants.find((p: any) => p._id !== session.id);
        setActiveUser(other);
      }
      
      setLoading(false);
      setTimeout(scrollToBottom, 100);

      // Set up polling for real-time messages and online status
      intervalId = setInterval(async () => {
        const [mRes, cRes] = await Promise.all([
          getMessages(chatId),
          getConversationById(chatId)
        ]);
        
        if (mRes.success) {
          setMessages(prev => {
            // Compare to see if there are any new messages, edits, deletes, or reactions
            const prevStr = JSON.stringify(prev);
            const newStr = JSON.stringify(mRes.messages);
            
            if (prevStr !== newStr) {
              // If length increased, it means there is a new message, so scroll down and mark read
              if (mRes.messages.length > prev.length) {
                setTimeout(scrollToBottom, 100);
                markAsRead(chatId);
              }
              return mRes.messages;
            }
            return prev;
          });
        }

        if (cRes.success) {
          setCurrentConversation((prev: any) => {
            const prevStr = JSON.stringify(prev);
            const newStr = JSON.stringify(cRes.conversation);
            return prevStr !== newStr ? cRes.conversation : prev;
          });
          const other = cRes.conversation.participants.find((p: any) => p._id !== session.id);
          setActiveUser(other);
        }
      }, 4000); // Check every 4 seconds
    }

    initAndLoad();

    return () => clearInterval(intervalId);
  }, [chatId]);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!message.trim() && !pendingAttachment) || !chatId || sending) return;
    
    setSending(true);
    let mediaUrl = undefined;
    let mediaType = undefined;
    
    // Upload if there's an attachment
    if (pendingAttachment) {
      setUploadingMedia(true);
      try {
        const formData = new FormData();
        formData.append("file", pendingAttachment.file, pendingAttachment.name);
        const res = await uploadMedia(formData);
        if (res.error) throw new Error(res.error);
        mediaUrl = res.url;
        mediaType = res.type as 'image' | 'video' | 'audio';
      } catch (error: any) {
        toast.error(error.message || "Failed to upload file");
        setUploadingMedia(false);
        setSending(false);
        return;
      }
      setUploadingMedia(false);
    }
    
    const text = message;
    const replyToId = replyingToMessage?._id;
    setMessage("");
    setReplyingToMessage(null);
    setPendingAttachment(null);
    setShowEmojiPicker(false);

    // Optimistic UI
    const tempMsg = {
      _id: Date.now().toString(),
      text,
      mediaUrl,
      mediaType,
      senderId: { _id: currentUser.id },
      replyTo: replyingToMessage,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    const res = await sendMessage(chatId, text, replyToId, mediaUrl, mediaType);
    if (res.success) {
      setMessages(prev => prev.map(m => m._id === tempMsg._id ? res.message : m));
    }
    
    setSending(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !chatId) return;

    // Create a local object URL for preview
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") || file.type.startsWith("audio/") ? "video" : "raw";

    setPendingAttachment({ file, url, type, name: file.name });
    setShowAttachmentMenu(false);
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      cancelRecordingRef.current = false;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (!cancelRecordingRef.current) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(audioBlob);
          setPendingAttachment({ file: audioBlob, url, type: 'audio', name: `voice-message-${Date.now()}.webm` });
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      toast.error("Microphone access denied.");
    }
  };

  const stopRecording = (cancel = false) => {
    if (mediaRecorderRef.current && isRecording) {
      cancelRecordingRef.current = cancel;
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!chatId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-transparent text-text-muted">
        <div className="w-24 h-24 mb-4 rounded-full bg-surface-elevated/40 border-2 border-border-subtle flex items-center justify-center text-4xl shadow-lg">
          💬
        </div>
        <h2 className="text-xl font-semibold text-text-primary">Your Messages</h2>
        <p className="text-sm mt-2">Select a chat or start a new conversation</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent relative z-0 hidden md:flex min-h-0">
      {/* Header */}
      <div className="h-16 border-b border-border-subtle flex items-center justify-between px-6 bg-transparent backdrop-blur-sm z-10 shrink-0">
        {loading ? (
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-surface-elevated animate-pulse"></div>
             <div className="w-24 h-4 bg-surface-elevated animate-pulse rounded"></div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={activeUser?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=TIDO"} alt={activeUser?.name} className="w-10 h-10 rounded-full object-cover" />
              <div className={cn(
                "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface",
                formatOnlineStatus(activeUser?.lastActive) === "Online" ? "bg-success" : "bg-text-muted"
              )}></div>
            </div>
            <div>
              <h2 className="font-semibold text-sm">{activeUser?.name || "Loading..."}</h2>
              <p className={cn("text-xs", formatOnlineStatus(activeUser?.lastActive) === "Online" ? "text-success" : "text-text-muted")}>
                {formatOnlineStatus(activeUser?.lastActive) === "Online" ? "Active now" : activeUser?.lastActive ? `Active ${formatOnlineStatus(activeUser.lastActive)} ago` : "Offline"}
              </p>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Link href="/call/video" className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-active rounded-full transition-colors">
            <Video className="w-5 h-5" />
          </Link>
          <Link href="/call/voice" className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-active rounded-full transition-colors">
            <Phone className="w-5 h-5" />
          </Link>
          <div className="w-px h-5 bg-border-subtle mx-1"></div>
          <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-active rounded-full transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <Link 
            href={`/?chat=${chatId}${searchParams.get('info') === 'true' ? '' : '&info=true'}`}
            className={cn(
              "p-2 text-text-secondary hover:text-text-primary hover:bg-surface-active rounded-full transition-colors",
              searchParams.get('info') === 'true' && "bg-surface-active text-text-primary"
            )}
          >
            <MoreVertical className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto hide-scrollbar p-6 space-y-4">
        <div className="flex justify-center mb-6">
          <span className="text-xs text-text-muted bg-surface px-3 py-1 rounded-full border border-border-subtle">Today</span>
        </div>
        
        {(() => {
          const myMessages = messages.filter(m => m.senderId?._id === currentUser?.id || m.senderId === currentUser?.id);
          const lastMyMsgId = myMessages[myMessages.length - 1]?._id;

          return messages.map((msg) => {
            const isMe = msg.senderId?._id === currentUser?.id || msg.senderId === currentUser?.id;
            const isLastMyMsg = isMe && msg._id === lastMyMsgId;
            const otherUnreadCount = currentConversation?.unreadCounts?.[activeUser?._id] || 0;
            const isRead = isLastMyMsg && otherUnreadCount === 0;
            
            // Group reactions by emoji
            const reactionCounts = (msg.reactions || []).reduce((acc: any, reaction: any) => {
              acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
              return acc;
            }, {});

            return (
              <div 
                key={msg._id} 
                id={`message-${msg._id}`}
                className={cn("flex flex-col w-full mb-1", isMe ? "items-end" : "items-start")}
                onMouseEnter={() => setHoveredMessageId(msg._id)}
                onMouseLeave={() => setHoveredMessageId(null)}
              >
              <div className={cn(
                "max-w-[70%] relative group",
                msg.mediaType === 'audio' && !msg.text ? "pl-1.5 pr-2 py-1.5 rounded-full" : "px-4 py-2.5 rounded-2xl",
                isMe ? "bg-primary text-white rounded-tr-sm" : "bg-surface-elevated/40 text-text-primary border border-border-subtle rounded-tl-sm"
              )}>
                {msg.replyTo && (
                  <div 
                    onClick={() => {
                      document.getElementById(`message-${msg.replyTo._id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      document.getElementById(`message-${msg.replyTo._id}`)?.classList.add('bg-surface-active', 'transition-colors', 'duration-500');
                      setTimeout(() => {
                        document.getElementById(`message-${msg.replyTo._id}`)?.classList.remove('bg-surface-active');
                      }, 2000);
                    }}
                    className={cn(
                      "mb-2 p-2 rounded-xl text-xs border-l-2 cursor-pointer transition-colors opacity-80 hover:opacity-100",
                      isMe ? "bg-white/10 border-white" : "bg-surface/50 border-primary"
                    )}
                  >
                    <p className="font-semibold mb-0.5">{msg.replyTo.senderId?._id === currentUser?.id ? "You" : msg.replyTo.senderId?.name || "Someone"}</p>
                    <p className="truncate">{msg.replyTo.isDeletedForEveryone ? "This message was deleted." : msg.replyTo.text}</p>
                  </div>
                )}
                
                {msg.mediaUrl && (
                  <div className={cn("rounded-xl overflow-hidden", msg.text ? "mb-2" : "")}>
                    {msg.mediaType === 'image' && (
                      <img src={msg.mediaUrl} alt="Image" className="max-w-full rounded-xl object-contain" style={{ maxHeight: '300px' }} />
                    )}
                    {msg.mediaType === 'video' && (
                      <video src={msg.mediaUrl} controls className="max-w-full rounded-xl" style={{ maxHeight: '300px' }} />
                    )}
                    {msg.mediaType === 'audio' && (
                      <VoiceMessagePlayer src={msg.mediaUrl} isMe={isMe} />
                    )}
                  </div>
                )}
                {editingMessageId === msg._id ? (
                  <form onSubmit={(e) => handleEditSubmit(e, msg._id)} className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={editMessageText} 
                      onChange={(e) => setEditMessageText(e.target.value)} 
                      className="bg-transparent border-b border-white/50 text-white focus:outline-none focus:border-white text-sm py-1 w-full"
                      autoFocus
                    />
                    <button type="submit" className="text-white hover:text-white/80 p-1">
                      <Send className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => setEditingMessageId(null)} className="text-white hover:text-white/80 p-1">
                      ×
                    </button>
                  </form>
                ) : msg.text ? (
                  <p className={cn("text-sm leading-relaxed", msg.isDeletedForEveryone && "italic opacity-80")}>
                    {msg.text}
                  </p>
                ) : null}
                
                {!(msg.mediaType === 'audio' && !msg.text) && (
                  <div className={cn(
                    "flex items-center justify-end gap-1 mt-1",
                    isMe ? "text-white/80" : "text-text-muted"
                  )}>
                    <span className="text-[10px]">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {msg.isEdited && " (edited)"}
                    </span>
                  </div>
                )}
                
                {msg.mediaType === 'audio' && !msg.text && (
                  <span className={cn(
                    "absolute -bottom-4 text-[10px] text-text-muted whitespace-nowrap",
                    isMe ? "right-1" : "left-1"
                  )}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}

                {/* Render Reactions */}
                {Object.keys(reactionCounts).length > 0 && (
                  <div className={cn(
                    "absolute -bottom-3 flex items-center gap-1 bg-surface border border-border-subtle rounded-full px-1.5 py-0.5 shadow-sm z-10",
                    isMe ? "right-2" : "left-2"
                  )}>
                    {Object.entries(reactionCounts).map(([emoji, count]: any) => (
                      <span key={emoji} className="text-xs flex items-center gap-0.5">
                        {emoji} <span className="text-[10px] text-text-muted">{count > 1 ? count : ''}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons (Hover) */}
                {hoveredMessageId === msg._id && !activeReactionMessageId && !activeDropdownId && (
                  <div className={cn(
                    "absolute top-1/2 -translate-y-1/2 flex items-center gap-1",
                    isMe ? "-left-16" : "-right-16"
                  )}>
                    <button 
                      onClick={() => setActiveReactionMessageId(msg._id)}
                      className="p-1.5 bg-surface border border-border-subtle rounded-full text-text-muted hover:text-text-primary shadow-sm transition-all hover:scale-110"
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                    {!msg.isDeletedForEveryone && (
                      <button 
                        onClick={() => setActiveDropdownId(msg._id)}
                        className="p-1.5 bg-surface border border-border-subtle rounded-full text-text-muted hover:text-text-primary shadow-sm transition-all hover:scale-110"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                {/* More Options Menu */}
                {activeDropdownId === msg._id && (
                  <div className={cn(
                    "absolute top-0 flex flex-col bg-surface border border-border-subtle rounded-xl shadow-lg z-50 overflow-hidden w-40 animate-in fade-in zoom-in-95 duration-200",
                    isMe ? "-left-44" : "-right-44"
                  )}>
                    <button 
                      onClick={() => {
                        setReplyingToMessage(msg);
                        setActiveDropdownId(null);
                        document.getElementById('chat-input')?.focus();
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-surface-active transition-colors text-left"
                    >
                      <Reply className="w-4 h-4" /> Reply
                    </button>
                    {isMe && !msg.isDeletedForEveryone && (
                      <button 
                        onClick={() => {
                          setEditMessageText(msg.text);
                          setEditingMessageId(msg._id);
                          setActiveDropdownId(null);
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-surface-active transition-colors text-left"
                      >
                        <Edit2 className="w-4 h-4" /> Edit
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(msg._id, 'me')}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-surface-active transition-colors text-left"
                    >
                      <Trash2 className="w-4 h-4" /> Delete for me
                    </button>
                    {isMe && !msg.isDeletedForEveryone && (
                      <button 
                        onClick={() => handleDelete(msg._id, 'everyone')}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/10 transition-colors text-left"
                      >
                        <Trash2 className="w-4 h-4" /> Delete for everyone
                      </button>
                    )}
                  </div>
                )}

                {/* Reaction Menu */}
                {activeReactionMessageId === msg._id && (
                  <div className={cn(
                    "absolute -top-12 flex items-center gap-1 bg-surface border border-border-subtle rounded-full px-2 py-1.5 shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2 duration-200",
                    isMe ? "right-0" : "left-0"
                  )}>
                    {QUICK_REACTIONS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(msg._id, emoji)}
                        className="text-lg hover:scale-125 transition-transform duration-200 px-1"
                      >
                        {emoji}
                      </button>
                    ))}
                    <div className="w-px h-4 bg-border-subtle mx-1"></div>
                    <button 
                      onClick={() => setActiveReactionMessageId(null)}
                      className="text-text-muted hover:text-text-primary px-1"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              
              {/* Read Receipt */}
              {isLastMyMsg && (
                <div className={cn(
                  "flex items-center justify-end pr-1",
                  msg.mediaType === 'audio' && !msg.text ? "mt-5" : "mt-1"
                )}>
                  {isRead ? (
                    <img 
                      src={activeUser?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=TIDO"} 
                      alt="Seen" 
                      className="w-3.5 h-3.5 rounded-full object-cover shadow-sm" 
                      title="Seen"
                    />
                  ) : (
                    <span className="text-[10px] text-text-muted font-medium">
                      {formatOnlineStatus(activeUser?.lastActive) === "Online" ? "Delivered" : "Sent"}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        });
      })()}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-transparent border-t border-border-subtle shrink-0 relative">
        <div className="flex flex-col gap-2 max-w-4xl mx-auto">
          {replyingToMessage && (
            <div className="flex items-center justify-between bg-surface-active/50 border border-border-subtle rounded-xl p-3 mx-10 mb-2 animate-in slide-in-from-bottom-2 fade-in">
              <div className="border-l-4 border-primary pl-3">
                <p className="text-xs font-semibold text-primary">Replying to {replyingToMessage.senderId?._id === currentUser?.id ? "Yourself" : replyingToMessage.senderId?.name}</p>
                <p className="text-sm text-text-secondary truncate mt-0.5">{replyingToMessage.isDeletedForEveryone ? "This message was deleted." : replyingToMessage.text}</p>
              </div>
              <button 
                onClick={() => setReplyingToMessage(null)}
                className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface rounded-full transition-colors"
              >
                ×
              </button>
            </div>
          )}
          
          {pendingAttachment && pendingAttachment.type !== 'audio' && (
            <div className="mx-6 mb-2 bg-surface-elevated border border-border-subtle rounded-xl p-3 flex flex-col gap-2 relative w-fit max-w-[50%] shadow-lg">
              <button 
                onClick={() => {
                  URL.revokeObjectURL(pendingAttachment.url);
                  setPendingAttachment(null);
                }} 
                className="absolute -top-2 -right-2 bg-surface text-text-muted hover:text-error rounded-full p-1.5 border border-border-subtle shadow-md z-10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              {pendingAttachment.type === 'image' && (
                <img src={pendingAttachment.url} alt="Preview" className="max-h-48 object-contain rounded-lg" />
              )}
              {pendingAttachment.type === 'video' && (
                <video src={pendingAttachment.url} controls className="max-h-48 rounded-lg" />
              )}
              {pendingAttachment.type === 'raw' && (
                <div className="flex items-center gap-3 text-text-primary p-2 bg-surface-active rounded-lg pr-8">
                  <File className="w-8 h-8 text-primary shrink-0" />
                  <span className="text-sm font-medium truncate">{pendingAttachment.name}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-end gap-2 w-full">
            <div className="relative">
              <button 
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={cn("p-3 transition-colors flex-shrink-0 rounded-full", showEmojiPicker ? "bg-surface-active text-primary" : "text-text-secondary hover:text-primary hover:bg-surface-active")}
              >
                <Smile className="w-6 h-6" />
              </button>
              {showEmojiPicker && (
                <div className="absolute bottom-14 left-0 z-50 shadow-2xl rounded-2xl overflow-hidden border border-border-subtle">
                  <EmojiPicker 
                    emojiStyle={EmojiStyle.FACEBOOK}
                    onEmojiClick={(emojiData) => setMessage(prev => prev + emojiData.emoji)}
                    theme={Theme.LIGHT} // Light background per request
                  />
                </div>
              )}
            </div>
            
            <div className="relative flex items-center">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*,video/*,audio/*" 
              />
              
              <button 
                type="button"
                disabled={uploadingMedia}
                onClick={() => {
                  setShowAttachmentMenu(!showAttachmentMenu);
                  setShowEmojiPicker(false);
                }}
                className={cn("p-3 transition-colors flex-shrink-0 rounded-full", showAttachmentMenu ? "bg-surface-active text-primary" : "text-text-secondary hover:text-primary hover:bg-surface-active disabled:opacity-50")}
              >
                {uploadingMedia ? <Loader2 className="w-6 h-6 animate-spin" /> : <Paperclip className="w-6 h-6" />}
              </button>

              {showAttachmentMenu && (
                <div className="absolute bottom-14 left-0 z-50 bg-surface border border-border-subtle shadow-2xl rounded-3xl p-3 flex flex-col gap-1 w-56 animate-in fade-in slide-in-from-bottom-4 duration-200 origin-bottom-left">
                  <button onClick={() => { setShowAttachmentMenu(false); if(fileInputRef.current) { fileInputRef.current.accept="image/*,video/*"; fileInputRef.current.capture="environment"; fileInputRef.current.click(); } }} className="flex items-center gap-3 p-3 hover:bg-surface-active rounded-2xl transition-colors text-text-primary text-sm font-semibold group text-left">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                      <Camera className="w-5 h-5" />
                    </div>
                    Camera
                  </button>
                  <button onClick={() => { setShowAttachmentMenu(false); if(fileInputRef.current) { fileInputRef.current.accept="image/*,video/*"; fileInputRef.current.removeAttribute('capture'); fileInputRef.current.click(); } }} className="flex items-center gap-3 p-3 hover:bg-surface-active rounded-2xl transition-colors text-text-primary text-sm font-semibold group text-left">
                    <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400 group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    Gallery
                  </button>
                  <button onClick={() => { setShowAttachmentMenu(false); if(fileInputRef.current) { fileInputRef.current.accept="*"; fileInputRef.current.removeAttribute('capture'); fileInputRef.current.click(); } }} className="flex items-center gap-3 p-3 hover:bg-surface-active rounded-2xl transition-colors text-text-primary text-sm font-semibold group text-left">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                      <File className="w-5 h-5" />
                    </div>
                    Document
                  </button>
                </div>
              )}
            </div>
            <form onSubmit={handleSend} className="flex-1 bg-surface-elevated/40 border border-border-subtle rounded-3xl flex items-center pr-2 pl-4 py-1 min-h-[48px]">
              {isRecording ? (
                <div className="flex-1 flex items-center justify-between bg-transparent px-2 py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-error animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                    <span className="text-sm font-medium text-error">{formatTime(recordingTime)}</span>
                  </div>
                  <button type="button" onClick={() => stopRecording(true)} className="text-text-muted hover:text-error transition-colors text-sm font-medium px-2">
                    Cancel
                  </button>
                </div>
              ) : pendingAttachment?.type === 'audio' ? (
                <div className="flex-1 flex items-center justify-between bg-transparent py-1 w-full overflow-hidden pl-2">
                  <VoiceMessagePlayer src={pendingAttachment.url} isMe={false} />
                  <button type="button" onClick={() => {
                    URL.revokeObjectURL(pendingAttachment.url);
                    setPendingAttachment(null);
                  }} className="text-text-muted hover:text-error transition-colors p-2 shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <input
                  id="chat-input"
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onClick={() => setShowEmojiPicker(false)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm text-text-primary py-2"
                  disabled={sending}
                />
              )}
              {isRecording ? (
                <button type="button" onClick={() => stopRecording(false)} className="p-2 bg-error text-white rounded-full hover:bg-red-600 transition-colors ml-2 shadow-sm animate-pulse">
                  <Square className="w-4 h-4 fill-current" />
                </button>
              ) : message.trim() || pendingAttachment ? (
                <button type="submit" disabled={sending || uploadingMedia} className="p-2 bg-primary text-white rounded-full hover:bg-primary-hover transition-colors ml-2 shadow-sm disabled:opacity-50 shrink-0">
                  {(sending || uploadingMedia) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                </button>
              ) : (
                <button type="button" onClick={startRecording} className="p-2 text-text-secondary hover:text-primary transition-colors ml-2 shrink-0">
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
