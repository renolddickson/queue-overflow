"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from "@/components/common/Image";;
import { fetchUserData, getUid } from '@/actions/auth';
import { User } from '@/types/api';
import { updateData } from '@/actions/document';
import { deleteCloudinaryByUrl } from '@/actions/cloudinary';
import { toast } from 'sonner';
import { handleFileChange, readFileAsDataURL } from '@/utils/helper';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeCheck, User as UserIcon, Camera, Loader2, Mail, Link as LinkIcon, Save, RotateCcw } from 'lucide-react';
import CloudinaryUpload from '@/components/common/CloudinaryUpload';

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

const ProfileEditor = () => {
  // User Data and Editing States
  const [userData, setUserData] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  // Added state for update loader
  const [isUpdating, setIsUpdating] = useState(false);

  // Profile image states
  const [newProfileImage, setNewProfileImage] = useState<string | null>(null);
  const [newProfileImageFile, setNewProfileImageFile] = useState<File | null>(null);

  // Banner image states
  const [newBannerImage, setNewBannerImage] = useState<string | null>(null);
  const [newBannerImageFile, setNewBannerImageFile] = useState<File | null>(null);

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
        }
      } catch (err) {
        console.error("Error occurred while fetching user data:", err);
        toast.error("Failed to load user data");
      }
    };

    loadData();
  }, []);

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
      handleResetProfileChanges();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!userData) {
    return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 w-full">
      <div className="animate-pulse space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
          <div className="h-4 w-96 bg-slate-100 dark:bg-slate-800/60 rounded-md"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1 space-y-2">
            <div className="h-11 w-full bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            <div className="h-11 w-full bg-slate-100 dark:bg-slate-800/40 rounded-xl"></div>
            <div className="h-11 w-full bg-slate-100 dark:bg-slate-800/40 rounded-xl"></div>
          </div>

          {/* Main Content Skeleton */}
          <div className="lg:col-span-3 space-y-8">
            <div className="h-[400px] w-full bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800"></div>
            <div className="h-[200px] w-full bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800"></div>
          </div>
        </div>
      </div>
    </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 w-full">
      <div className="flex flex-col gap-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-slate-50">Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your public profile and account preferences.</p>
          </div>
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
                disabled={isUpdating}
                className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 shadow-md transition-all active:scale-95"
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
            <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 shadow-sm transition-all">
              <UserIcon size={18} className="text-green-600" />
              Public Profile
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
              <BadgeCheck size={18} />
              Account Verification
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
              <Mail size={18} />
              Notifications
            </button>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Appearance Section */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden border-none bg-white dark:bg-slate-900/50">
              <CardHeader className="pb-0 pt-8 px-8">
                <CardTitle className="text-xl font-serif">Brand Appearance</CardTitle>
                <CardDescription>How you appear to others on the platform.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-10">
                
                {/* Banner Upload */}
                <div className="space-y-4">
                  <Label>Profile Banner</Label>
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden group border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-green-500 dark:hover:border-green-500 transition-all">
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
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl relative z-10 bg-slate-100">
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
                          className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-green-500"
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
                            onChange={(e) => { setUsername(e.target.value); setIsEditingProfile(true); }}
                            className="rounded-xl pl-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-green-500"
                            placeholder="username"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Info Section */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
              <CardHeader className="pt-8 px-8">
                <CardTitle className="text-xl font-serif">Account Information</CardTitle>
                <CardDescription>Private details and authentication.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="text-slate-600 dark:text-slate-400">Account Email</Label>
                  <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-500">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;
