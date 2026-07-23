"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from "@/components/common/Image";;
import { fetchUserData, getUid, checkUsernameAvailability } from '@/actions/auth';
import { getActiveSessions, revokeSession } from '@/actions/sessions';
import { User } from '@/types/api';
import { updateData } from '@/actions/document';
import { deleteCloudinaryByUrl } from '@/actions/cloudinary';
import { toast } from 'sonner';
import { handleFileChange, readFileAsDataURL } from '@/utils/helper';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeCheck, User as UserIcon, Camera, Loader2, Mail, Link as LinkIcon, Save, Shield, Bell, Plus, Layers, Activity, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import CloudinaryUpload from '@/components/common/CloudinaryUpload';
import { cn } from '@/lib/utils';
import { useSearchParams, useRouter } from 'next/navigation';

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

const ProfileEditor = () => {
  // User Data and Editing States
  const [userData, setUserData] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  // Added state for update loader
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [sessions, setSessions] = useState<any[]>([]);
  const [isRevoking, setIsRevoking] = useState<string | null>(null);
  
  // Username check states
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  // Profile image states
  const [newProfileImage, setNewProfileImage] = useState<string | null>(null);
  const [newProfileImageFile, setNewProfileImageFile] = useState<File | null>(null);

  // Banner image states
  const [newBannerImage, setNewBannerImage] = useState<string | null>(null);
  const [newBannerImageFile, setNewBannerImageFile] = useState<File | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const isInitialSetup = searchParams.get('setup') === 'true';
  const isIncomplete = searchParams.get('incomplete') === 'true';

  // Refs for file inputs
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const uid = await getUid();
        if (uid) {
          const { data } = await fetchUserData(uid);
          if (data) {
            setUserData(data);
            setUsername(data.user_name || '');
            setDisplayName(data.display_name || '');
          }

          // Fetch sessions
          const sessionsRes = await getActiveSessions();
          if (sessionsRes.data) {
            setSessions(sessionsRes.data);
          }
        }
      } catch (err) {
        console.error("Error occurred while fetching user data:", err);
        toast.error("Failed to load user data");
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if ((isInitialSetup || isIncomplete) && userData && !userData.user_name) {
      setIsEditingProfile(true);
      toast.info(isInitialSetup ? "Welcome! Please set your username and name." : "Please complete your profile to continue.");
    }
  }, [isInitialSetup, isIncomplete, userData]);

  useEffect(() => {
    if (!username || !userData || username === userData.user_name) {
      setUsernameStatus('idle');
      return;
    }

    // Basic validation: only letters, numbers, and underscores, min length 3
    if (username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameStatus('idle'); // Or show an error state if you prefer
      return;
    }

    const checkAvailability = async () => {
      setIsCheckingUsername(true);
      setUsernameStatus('checking');
      try {
        const { data } = await checkUsernameAvailability(username);
        if (data && data.length > 0) {
          setUsernameStatus('taken');
        } else {
          setUsernameStatus('available');
        }
      } catch (error) {
        console.error("Error checking username:", error);
        setUsernameStatus('idle');
      } finally {
        setIsCheckingUsername(false);
      }
    };

    const timeoutId = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [username, userData]);

  // --- File input handlers ---
  const handleBannerImageClick = () => {
    bannerFileInputRef.current?.click();
  };

  const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > MAX_FILE_SIZE) {
        toast.error("Banner image exceeds the maximum file limit of 1MB");
        return;
      }
      await handleFileChange(e, setNewBannerImage, setNewBannerImageFile);
      setIsEditingProfile(true);
    } catch (error) {
      console.error("Banner file reading error:", error);
      toast.error("Failed to read banner file");
    }
  };

  const handleProfileImageClick = () => {
    profileFileInputRef.current?.click();
  };

  const handleProfileFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > MAX_FILE_SIZE) {
        toast.error("Profile image exceeds the maximum file limit of 1MB");
        return;
      }
      await handleFileChange(e, setNewProfileImage, setNewProfileImageFile);
      setIsEditingProfile(true);
    } catch (error) {
      console.error("Profile file reading error:", error);
      toast.error("Failed to read profile file");
    }
  };

  // --- Reset Functions ---
  const handleResetProfileChanges = () => {
    setUsername(userData?.user_name || '');
    setDisplayName(userData?.display_name || '');
    setNewProfileImage(null);
    setNewProfileImageFile(null);
    setNewBannerImage(null);
    setNewBannerImageFile(null);
    setIsEditingProfile(false);
  };

  // --- Update Functions ---
  const handleUpdateProfile = async () => {
    if (!userData) return;

    setIsUpdating(true);
    try {
      const updatedData: Partial<User> = {};
      const imagesToDelete: string[] = [];

      if (username !== userData.user_name) {
        updatedData.user_name = username;
      }
      if (displayName !== userData.display_name) {
        updatedData.display_name = displayName;
      }
      if (newProfileImage) {
        updatedData.profile_image = newProfileImage;
      }
      if (newBannerImage) {
        updatedData.banner_image = newBannerImage;
      }
      if (Object.keys(updatedData).length === 0) {
        toast.info("No changes to update");
        return;
      }

      if (newProfileImage && userData.profile_image) {
        await deleteCloudinaryByUrl(userData.profile_image);
      }
      if (newBannerImage && userData.banner_image) {
        await deleteCloudinaryByUrl(userData.banner_image);
      }

      await updateData<User>('users', userData.id, updatedData);
      setUserData({ ...userData, ...updatedData });
      toast.success("Profile updated successfully");
      router.refresh();
      handleResetProfileChanges();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setIsRevoking(sessionId);
    try {
      const res = await revokeSession(sessionId);
      if (res.success) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        toast.success("Session revoked successfully");
      } else {
        toast.error("Failed to revoke session");
      }
    } catch (error) {
      console.error("Error revoking session:", error);
      toast.error("Something went wrong");
    } finally {
      setIsRevoking(null);
    }
  };

  if (!userData) {
    return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 w-full">
      <div className="animate-pulse space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-10 w-48 bg-slate-200 dark:bg-zinc-800 rounded-lg"></div>
          <div className="h-4 w-96 bg-slate-100 dark:bg-zinc-800/60 rounded-md"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1 space-y-2">
            <div className="h-11 w-full bg-slate-200 dark:bg-zinc-800 rounded-xl"></div>
            <div className="h-11 w-full bg-slate-100 dark:bg-zinc-800/40 rounded-xl"></div>
            <div className="h-11 w-full bg-slate-100 dark:bg-zinc-800/40 rounded-xl"></div>
          </div>

          {/* Main Content Skeleton */}
          <div className="lg:col-span-3 space-y-8">
            <div className="h-[400px] w-full bg-slate-50 dark:bg-zinc-900/50 rounded-3xl border border-slate-100 dark:border-zinc-800"></div>
            <div className="h-[200px] w-full bg-slate-50 dark:bg-zinc-900/50 rounded-3xl border border-slate-100 dark:border-zinc-800"></div>
          </div>
        </div>
      </div>
    </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 w-full min-h-screen">
      <div className="flex flex-col gap-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your public profile and account preferences.</p>
          </div>
          {(isInitialSetup || isIncomplete) && !userData?.user_name && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500 flex-1 md:max-w-md">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-full text-amber-600 dark:text-amber-400">
                <Info size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">Complete Your Profile</p>
                <p className="text-xs text-amber-800/80 dark:text-amber-400/80">A username and display name are required to join the community.</p>
              </div>
            </div>
          )}
          {isEditingProfile && (
            <div className="flex items-center gap-3 animate-in fade-in zoom-in duration-300">
              <Button 
                variant="ghost" 
                onClick={handleResetProfileChanges}
                className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateProfile} 
                disabled={isUpdating || usernameStatus === 'taken' || usernameStatus === 'checking'}
                className={cn(
                  "rounded-full px-6 shadow-md transition-all active:scale-95",
                  usernameStatus === 'taken' ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"
                )}
              >
                {isUpdating ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                {isUpdating ? 'Updating...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-1">
            <button 
              onClick={() => setActiveTab('profile')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                activeTab === 'profile' 
                  ? "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-slate-100 shadow-sm" 
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800/50"
              )}
            >
              <UserIcon size={18} className={activeTab === 'profile' ? "text-green-600" : ""} />
              Public Profile
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                activeTab === 'security' 
                  ? "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-slate-100 shadow-sm" 
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800/50"
              )}
            >
              <Shield size={18} />
              Security
            </button>
            <button 
              onClick={() => setActiveTab('notifications')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                activeTab === 'notifications' 
                  ? "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-slate-100 shadow-sm" 
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800/50"
              )}
            >
              <Bell size={18} />
              Notifications
            </button>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            
            {activeTab === 'profile' && (
              <>
                {/* Appearance Section */}
            <Card className="border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden border-none bg-white dark:bg-zinc-900/50">
              <CardHeader className="pb-0 pt-8 px-8">
                <CardTitle className="text-xl font-serif">Brand Appearance</CardTitle>
                <CardDescription>How you appear to others on the platform.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-10">
                
                {/* Banner Upload */}
                <div className="space-y-4">
                  <Label>Profile Banner</Label>
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden group border-2 border-dashed border-slate-200 dark:border-zinc-800 hover:border-green-500 dark:hover:border-green-500 transition-all">
                    <Image
                      src={newBannerImage || userData.banner_image || '/assets/default-banner.jpg'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                      alt="Banner"
                    />
                    <div className="absolute inset-x-0 bottom-4 flex justify-center z-30">
                        <CloudinaryUpload 
                            onSuccess={(url) => {
                                setNewBannerImage(url);
                                setIsEditingProfile(true);
                            }}
                            userId={userData.id}
                            category="banners"
                            buttonText="Update Banner"
                            className="bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30"
                        />
                    </div>
                  </div>
                </div>

                {/* Profile Image & Basic Info */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="relative group flex-shrink-0">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-zinc-800 shadow-xl relative z-10 bg-slate-100 dark:bg-zinc-900">
                      <Image
                        src={newProfileImage || userData.profile_image || '/assets/no-avatar.png'}
                        fill
                        className="object-cover"
                        alt="Avatar"
                      />
                    </div>
                    <div className="absolute inset-0 z-20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      <CloudinaryUpload 
                        onSuccess={(url) => {
                            setNewProfileImage(url);
                            setIsEditingProfile(true);
                        }}
                        userId={userData.id}
                        category="profiles"
                        buttonText=""
                        className="w-full h-full rounded-full opacity-0 absolute inset-0 cursor-pointer"
                      />
                      <Camera size={24} className="text-white pointer-events-none" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-8 h-8 rounded-full border-4 border-white dark:border-slate-900 z-30" />
                  </div>
                  
                  <div className="flex-1 w-full space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="display-name" className="text-slate-600 dark:text-slate-400">Public Display Name</Label>
                        <Input 
                          id="display-name"
                          value={displayName}
                          onChange={(e) => { setDisplayName(e.target.value); setIsEditingProfile(true); }}
                          className="rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-background focus:ring-green-500"
                          placeholder="Your Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-slate-600 dark:text-slate-400">Username</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">@</span>
                          <Input 
                            id="username"
                            value={username}
                            onChange={(e) => { 
                              const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                              setUsername(val); 
                              setIsEditingProfile(true); 
                            }}
                            className={cn(
                              "rounded-xl pl-8 pr-10 border-slate-200 dark:border-zinc-800 bg-white dark:bg-background focus:ring-green-500 transition-all",
                              usernameStatus === 'available' && "border-green-500 ring-1 ring-green-500/20",
                              usernameStatus === 'taken' && "border-red-500 ring-1 ring-red-500/20"
                            )}
                            placeholder="username"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                            {usernameStatus === 'checking' && <Loader2 size={16} className="animate-spin text-slate-400" />}
                            {usernameStatus === 'available' && <CheckCircle2 size={16} className="text-green-500" />}
                            {usernameStatus === 'taken' && <AlertCircle size={16} className="text-red-500" />}
                          </div>
                        </div>
                        {usernameStatus === 'taken' && (
                          <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium animate-in slide-in-from-top-1 duration-200">
                             <AlertCircle size={12} /> This username is already taken.
                          </p>
                        )}
                        {usernameStatus === 'available' && (
                          <p className="text-[11px] text-green-600 mt-1 flex items-center gap-1 font-medium animate-in slide-in-from-top-1 duration-200">
                             <CheckCircle2 size={12} /> Username is available!
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Info Section */}
            <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
              <CardHeader className="pt-8 px-8">
                <CardTitle className="text-xl font-serif">Account Information</CardTitle>
                <CardDescription>Private details and authentication.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="text-slate-600 dark:text-slate-400">Account Email</Label>
                  <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-black border border-slate-100 dark:border-zinc-800 rounded-xl text-slate-500">
                    <Mail size={16} />
                    <span className="text-sm">{userData.email}</span>
                    <BadgeCheck size={14} className="text-blue-500 ml-auto" />
                  </div>
                  <p className="text-[12px] text-slate-400 mt-1">Contact support to change your verified email address.</p>
                </div>
                
                <div className="pt-4">
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 flex items-start gap-3">
                    <div className="mt-0.5 p-1 bg-amber-200 dark:bg-amber-900/40 rounded-full text-amber-700 dark:text-amber-400">
                      <LinkIcon size={12} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-300">Public Profile Link</h4>
                      <p className="text-xs text-amber-800 dark:text-amber-400/80 mt-1">Your profile is visible to anyone on the web at:</p>
                      <div className="mt-2 text-xs font-mono bg-white/50 dark:bg-black/20 p-1.5 rounded border border-amber-200/50 dark:border-amber-900/20">
                         {typeof window !== 'undefined' ? `${window.location.origin}/author/@${userData.user_name}` : `author/@${userData.user_name}`}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-serif font-bold dark:text-white">Security Settings</h2>
                </div>

                <div className="grid gap-6">
                  {/* Sessions Section */}
                  <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Active Sessions</CardTitle>
                      <CardDescription>Devices that are currently logged into your account.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {sessions.length > 0 ? (
                        sessions.map((session, index) => (
                          <div key={session.id} className={cn(
                            "flex items-center justify-between p-4 rounded-xl border transition-all",
                            index === 0 ? "bg-slate-50 dark:bg-zinc-800/50 border-slate-100 dark:border-zinc-800" : "border-slate-100 dark:border-zinc-800/30"
                          )}>
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "p-2.5 rounded-full",
                                index === 0 ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400"
                              )}>
                                <Shield size={20} />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                  {session.device_name || 'Unknown Device'}
                                  {index === 0 && (
                                    <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">Current</span>
                                  )}
                                </p>
                                <p className="text-xs text-slate-500 italic">
                                  {session.ip_address} • {session.last_active ? new Date(session.last_active).toLocaleString() : 'Recently'}
                                </p>
                              </div>
                            </div>
                            {index !== 0 && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleRevokeSession(session.id)}
                                disabled={isRevoking === session.id}
                                className="text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/10 dark:border-red-900/30"
                              >
                                {isRevoking === session.id ? <Loader2 size={14} className="animate-spin" /> : 'Revoke'}
                              </Button>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center text-slate-500 italic text-sm">
                          Loading active sessions...
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Password Section */}
                  <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Password & Authentication</CardTitle>
                      <CardDescription>Manage your password and secondary security layers.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                         <div>
                           <p className="font-bold text-slate-900 dark:text-slate-100">Change Password</p>
                           <p className="text-sm text-slate-500">Last changed 3 months ago</p>
                         </div>
                         <Button variant="outline">Update</Button>
                      </div>
                      <div className="h-px bg-slate-100 dark:bg-zinc-800" />
                      <div className="flex items-center justify-between">
                         <div>
                           <p className="font-bold text-slate-900 dark:text-slate-100">Two-Factor Authentication (2FA)</p>
                           <p className="text-sm text-slate-500">Add an extra layer of security to your account.</p>
                         </div>
                         <Button variant="outline" className="text-green-600 border-green-200">Enable</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-serif font-bold dark:text-white">Notification Preferences</h2>
                </div>

                <div className="grid gap-6">
                  <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                    <CardHeader>
                      <CardTitle className="text-lg">App Notifications</CardTitle>
                      <CardDescription>Control which updates you receive within the application.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 dark:text-slate-100">New Content</p>
                          <p className="text-sm text-slate-500">Get notified when creators you follow post new content.</p>
                        </div>
                        <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-100 cursor-pointer">
                          <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white dark:bg-zinc-400 transition-transform" />
                        </div>
                      </div>
                      
                      <div className="h-px bg-slate-100 dark:bg-zinc-800" />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 dark:text-slate-100">Novioc Updates</p>
                          <p className="text-sm text-slate-500">Stay up to date with the latest features and official news.</p>
                        </div>
                        <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-900 dark:bg-white transition-colors cursor-pointer">
                          <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white dark:bg-zinc-900 transition-transform" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Email Alerts</CardTitle>
                      <CardDescription>Choose if you want to receive digests and account alerts via email.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 dark:text-slate-100">Product Newsletters</p>
                          <p className="text-sm text-slate-500">Weekly highlights and top content from Novioc.</p>
                        </div>
                        <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-zinc-800 transition-colors cursor-pointer">
                          <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white dark:bg-zinc-400 transition-transform" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;
