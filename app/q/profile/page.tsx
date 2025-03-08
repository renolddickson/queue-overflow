"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { fetchUserData, getUid, handleChangePassword } from '@/actions/auth';
import { User } from '@/types/api';
import { updateData, uploadImage } from '@/actions/document';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';

const ProfileEditor = () => {
  const [userData, setUserData] = useState<User | null>(null);

  // Profile related states
  const [username, setUsername] = useState('');
  const [newProfileImage, setNewProfileImage] = useState<string | null>(null);
  const [newProfileImageFile, setNewProfileImageFile] = useState<File | null>(null);

  // Banner related states
  const [newBannerImage, setNewBannerImage] = useState<string | null>(null);
  const [newBannerImageFile, setNewBannerImageFile] = useState<File | null>(null);

  // General editing state (if any unsaved changes exist)
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Password related states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const uid = await getUid();
        if (uid) {
          const { data } = await fetchUserData(uid);
          setUserData(data);
          setUsername(data?.user_name || '');
        }
      } catch (err) {
        console.error("Error occurred", err);
        toast.error("Failed to load user data");
      }
    };
    loadData();
  }, []);

  // Helper function to read file as data URL (returns a promise)
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // ----- Banner Image Functions -----
  const handleBannerImageClick = () => {
    bannerFileInputRef.current?.click();
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setNewBannerImage(reader.result as string);
        setNewBannerImageFile(file);
        setIsEditingProfile(true);
      };
      reader.onerror = (error) => {
        console.error("Banner file reading error: ", error);
        toast.error("Failed to read banner file");
      };
    }
  };

  // ----- Profile Image Functions -----
  const handleProfileImageClick = () => {
    profileFileInputRef.current?.click();
  };

  const handleProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setNewProfileImage(reader.result as string);
        setNewProfileImageFile(file);
        setIsEditingProfile(true);
      };
      reader.onerror = (error) => {
        console.error("Profile file reading error: ", error);
        toast.error("Failed to read profile file");
      };
    }
  };

  // ----- Save/Reset Functions -----
  const handleResetProfileChanges = () => {
    setUsername(userData?.user_name || '');
    setNewProfileImage(null);
    setNewProfileImageFile(null);
    setNewBannerImage(null);
    setNewBannerImageFile(null);
    setIsEditingProfile(false);
  };

  const handleUpdateProfile = async () => {
    if (!userData) return;
    try {
      const updatedData: Partial<User> = {};

      // Update username if it changed
      if (username !== userData.user_name) {
        updatedData.user_name = username;
      }

      // Update profile image if a new one was selected
      if (newProfileImageFile) {
        const base64Profile = await readFileAsDataURL(newProfileImageFile);
        try {
          const profilePublicUrl = await uploadImage('avatars', {
            fileName: newProfileImageFile.name,
            fileContent: base64Profile,
          });
          updatedData.profile_image = profilePublicUrl;
        } catch (uploadError) {
          console.error("Error uploading profile image:", uploadError);
          toast.error("Failed to update profile image");
          return;
        }
      }

      // Update banner image if a new one was selected
      if (newBannerImageFile) {
        const base64Banner = await readFileAsDataURL(newBannerImageFile);
        try {
          const bannerPublicUrl = await uploadImage('banners', {
            fileName: newBannerImageFile.name,
            fileContent: base64Banner,
          });
          updatedData.banner_image = bannerPublicUrl;
        } catch (uploadError) {
          console.error("Error uploading banner image:", uploadError);
          toast.error("Failed to update banner image");
          return;
        }
      }

      if (Object.keys(updatedData).length === 0) {
        toast.info("No changes to update");
        return;
      }

      await updateData<User>('users', userData.id, updatedData);
      setUserData({ ...userData, ...updatedData });
      toast.success("Profile updated successfully");

      // Reset local changes
      handleResetProfileChanges();
    } catch (error) {
      console.error("Error updating profile", error);
      toast.error("Failed to update profile");
    }
  };

  // ----- Password Functions -----
  const handleResetPasswordFields = () => {
    setNewPassword('');
    setConfirmPassword('');
    setIsEditingPassword(false);
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await handleChangePassword(newPassword);
      toast.success("Password updated successfully");
      handleResetPasswordFields();
    } catch (error) {
      console.error("Error updating password", error);
      toast.error("Failed to update password");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col p-4 w-full">
      {/* Banner Section */}
      <div className="relative w-full h-52">
        <Image
          src={newBannerImage || userData?.banner_image || '/assets/default-banner.jpg'}
          fill
          className="rounded-sm overflow-hidden"
          style={{ objectFit: 'cover' }}
          alt="banner"
        />
        {/* Pencil icon triggers banner file input */}
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
          src={newProfileImage || userData?.profile_image || "/assets/no-avatar.png"}
          fill
          style={{ objectFit: 'cover' }}
          alt="profile image"
        />
        {/* Overlay for profile image file input */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
          onClick={handleProfileImageClick}
          title="Change Profile Image"
        >
          <span className="text-white">Upload</span>
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
          <label className="block text-sm font-medium text-gray-700">User name</label>
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
            value={userData?.email || ''}
            disabled
            className="border p-2 rounded"
          />
        </div>
        {isEditingProfile && (
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleUpdateProfile}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Update Profile
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

      {/* Password Settings Section */}
      <div className="mt-8 border-t pt-4">
        <h2 className="text-2xl font-bold mb-4">Password Settings</h2>
        <div className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setIsEditingPassword(true);
            }}
            className="border p-2 rounded"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setIsEditingPassword(true);
            }}
            className="border p-2 rounded"
          />
          {isEditingPassword && (
            <div className="flex gap-4">
              <button
                onClick={handleUpdatePassword}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Change Password
              </button>
              <button
                onClick={handleResetPasswordFields}
                className="px-4 py-2 bg-gray-300 text-black rounded"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;
