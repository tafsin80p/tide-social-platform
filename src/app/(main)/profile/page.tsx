"use client";

import { ArrowLeft, Camera, Edit2, LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { getUserSession, logoutUser, updateUserProfile } from "@/actions/auth";
import { uploadMedia } from "@/actions/upload";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadUser() {
      const session = await getUserSession();
      if (!session) {
        router.push("/login");
      } else {
        setUser(session);
      }
      setLoading(false);
    }
    loadUser();
  }, [router]);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
    router.refresh();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const uploadRes = await uploadMedia(formData);
      if (uploadRes.success && uploadRes.url) {
        const updateRes = await updateUserProfile({ avatar: uploadRes.url });
        if (updateRes.success) {
          setUser((prev: any) => ({ ...prev, avatar: uploadRes.url }));
          router.refresh();
        }
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="flex w-full h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex w-full h-full bg-background">
      <div className="w-full md:w-[400px] h-full bg-surface border-r border-border-subtle flex flex-col mx-auto md:mx-0">
        <div className="h-16 border-b border-border-subtle flex items-center px-4 bg-background z-10 shrink-0">
          <button onClick={() => router.back()} className="p-2 text-text-secondary hover:text-text-primary transition-colors mr-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-text-primary">Profile</h1>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar p-6">
          <div className="flex flex-col items-center mb-8">
            <div className="relative group cursor-pointer mb-8" onClick={() => fileInputRef.current?.click()}>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
              <img 
                src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=TIDO"} 
                alt={user?.name} 
                className="w-32 h-32 rounded-full object-cover ring-4 ring-background"
              />
              <div className="absolute inset-0 bg-surface/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-text-primary animate-spin" />
                ) : (
                  <Camera className="w-8 h-8 text-text-primary" />
                )}
              </div>
            </div>
            
            <div className="w-full">
              <label className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 block">Your Name</label>
              <div className="flex items-center justify-between border-b border-border-subtle pb-2 mb-6">
                <span className="text-text-primary font-medium">{user?.name}</span>
                <Edit2 className="w-4 h-4 text-text-secondary hover:text-text-primary cursor-pointer" />
              </div>

              <div className="text-xs text-text-muted mb-8">
                This is not your username or pin. This name will be visible to your TIDO contacts.
              </div>

              <label className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 block">Email</label>
              <div className="flex items-center justify-between border-b border-border-subtle pb-2 mb-6">
                <span className="text-text-primary font-medium">{user?.email}</span>
              </div>

              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-error/10 text-error hover:bg-error/20 transition-colors font-medium mt-8"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 hidden md:flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-24 h-24 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-4 border border-border-subtle">
            <span className="text-4xl">👤</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">Profile</h2>
          <p className="text-text-muted text-sm max-w-sm">
            Manage your personal information and profile picture.
          </p>
        </div>
      </div>
    </div>
  );
}
