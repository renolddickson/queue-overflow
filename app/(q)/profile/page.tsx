"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { fetchUserData, getUid } from '@/actions/auth';
import { User } from '@/types/api';
import { deleteImagesFromStorage, updateData, uploadImage } from '@/actions/document';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { handleFileChange, readFileAsDataURL } from '@/utils/helper';

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
      if (newProfileImageFile) {
        const base64Profile = await readFileAsDataURL(newProfileImageFile);
        try {
          const profilePublicUrl = await uploadImage('avatars', {
            fileName: newProfileImageFile.name,
            fileContent: base64Profile,
          });
          // Mark previous profile image for deletion, if it exists
          if (userData.profile_image) {
            imagesToDelete.push(userData.profile_image);
          }
          updatedData.profile_image = profilePublicUrl;
        } catch (uploadError) {
          console.error("Error uploading profile image:", uploadError);
          toast.error("Failed to update profile image");
          return;
        }
      }
      if (newBannerImageFile) {
        const base64Banner = await readFileAsDataURL(newBannerImageFile);
        try {
          const bannerPublicUrl = await uploadImage('banners', {
            fileName: newBannerImageFile.name,
            fileContent: base64Banner,
          });
          // Mark previous banner image for deletion, if it exists
          if (userData.banner_image) {
            imagesToDelete.push(userData.banner_image);
          }
          updatedData.banner_image = bannerPublicUrl;
        } catch (uploadError) {
          console.error("Error uploading banner image:", uploadError);
          toast.error("Failed to update banner image");
          return;
        }
      }

      // Delete old images from storage, if any
      if (imagesToDelete.length > 0) {
        await deleteImagesFromStorage(imagesToDelete);
      }
      if (Object.keys(updatedData).length === 0) {
        toast.info("No changes to update");
        return;
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
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col p-4 w-full">
        <div className="animate-pulse space-y-4">
          <div className="h-52 bg-gray-300 rounded"></div>
          <div className="h-48 w-48 bg-gray-300 rounded-full mt-[-6rem] ml-4"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-300 rounded w-1/2"></div>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col p-4 w-full">
      {/* Banner Section */}
      <div className="relative w-full h-52 border">
        <Image
          src={newBannerImage || userData.banner_image || '/assets/default-banner.jpg'}
          fill
          className="rounded-sm overflow-hidden"
          style={{ objectFit: 'cover' }}
          alt="Banner image"
        />
        <div
          className="absolute top-2 right-2 cursor-pointer text-white bg-gray-800 p-2 rounded-full"
          onClick={handleBannerImageClick}
          title="Change Banner"
        >
          <Pencil />
        </div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={bannerFileInputRef}
          onChange={handleBannerFileChange}
        />
      </div>

      {/* Profile Image Section */}
      <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white relative -mt-24 ml-4">
        <Image
          src={newProfileImage || userData.profile_image || '/assets/no-avatar.png'}
          fill
          style={{ objectFit: 'cover' }}
          alt="Profile image"
        />
        <div
          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
          onClick={handleProfileImageClick}
          title="Change Profile Image"
        >
          <div className="flex flex-col justify-center items-center text-white">
            <Pencil />
            <span>Upload</span>
          </div>
        </div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={profileFileInputRef}
          onChange={handleProfileFileChange}
        />
      </div>

      {/* Profile Settings Section */}
      <div className="w-full flex flex-col mt-8">
        <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>
        <div className="mt-4 flex flex-col gap-2">
          <label className="block text-sm font-medium text-gray-700">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              setIsEditingProfile(true);
            }}
            className="border p-2 rounded"
          />
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <label className="block text-sm font-medium text-gray-700">User Name</label>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setIsEditingProfile(true);
            }}
            className="border p-2 rounded"
          />
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={userData.email || ''}
            disabled
            className="border p-2 rounded"
          />
        </div>
        {isEditingProfile && (
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleUpdateProfile}
              disabled={isUpdating}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {isUpdating ? 'Updating...' : 'Update Profile'}
            </button>
            <button
              onClick={handleResetProfileChanges}
              className="px-4 py-2 bg-gray-300 text-black rounded"
            >
              Reset Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileEditor;
