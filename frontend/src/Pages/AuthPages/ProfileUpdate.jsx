import React, { useContext, useEffect, useState } from "react";
import AuthLayout from "../../Components/layouts/AuthLayout";
import ProfilePhotoSelector from "../../Components/inputs/ProfilePhotoSelector";
import Input from "../../Components/inputs/Inputs";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";
import uploadImage from "../../utils/uploadingImage";
import { validateEmail } from "../../utils/helper";
import toast from "react-hot-toast";

const ProfileUpdate = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { user: currentUser, updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  // Initialize form with current user data
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.name || "");
      setEmail(currentUser.email || "");
      setProfilePic(currentUser.profileImageUrl || null);
    }
  }, [currentUser]);

  const sanitizeImageUrl = (url) => {
    console.log('Original URL:', url);
    if (!url) return '';
    const baseUrl = axiosInstance.defaults.baseURL || 'https://easyloan.onrender.com';
    let sanitized = url;
    const patterns = [
      'http://localhost:3000',
      'https://localhost:3000',
      'https://easyloan-1.onrender.com'
    ];
    patterns.forEach(pattern => {
      sanitized = sanitized.replaceAll(pattern, baseUrl);
    });
    console.log('Sanitized URL:', sanitized);
    return sanitized;
  };

  const handleImageUpload = async (imageFile) => {
    try {
      console.log('Starting image upload...');
      if (!imageFile) throw new Error('No image file provided');
      if (imageFile.size > 5 * 1024 * 1024) throw new Error('File size exceeds 5MB limit');
      const formData = new FormData();
      formData.append('image', imageFile);
      console.log('Uploading to:', API_PATHS.IMAGE.UPLOAD_IMAGE);
      const response = await axiosInstance.post(
        API_PATHS.IMAGE.UPLOAD_IMAGE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log('Upload response:', response.data);
      if (!response.data?.data?.imageUrl) {
        throw new Error('Server did not return image URL');
      }
      const imageUrl = sanitizeImageUrl(response.data.data.imageUrl);
      return imageUrl;
    } catch (error) {
      console.error('Detailed upload error:', {
        message: error.message,
        response: error.response?.data,
        config: error.config,
      });
      const errorMessage = error.message.includes('timeout')
        ? 'Image upload timed out. Please check your connection or try a smaller file.'
        : error.response?.data?.message || 'Failed to upload image. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate inputs
      if (!fullName.trim()) throw new Error("Full name is required");
      if (!validateEmail(email)) throw new Error("Valid email is required");
      if (showPasswordFields && newPassword !== confirmPassword) {
        throw new Error("Passwords don't match");
      }

      let imageUrl = null;
      if (profilePic && profilePic instanceof File) {
        console.log('Uploading new profile image...');
        try {
          imageUrl = await handleImageUpload(profilePic);
          console.log('New image URL:', imageUrl);
        } catch (uploadError) {
          console.warn('Image upload failed, continuing without image update:', uploadError.message);
          toast.error('Image upload failed: ' + uploadError.message);
          setError('Image upload failed: ' + uploadError.message);
        }
      }

      const payload = {
        name: fullName,
        email,
        ...(imageUrl && { profileImageUrl: imageUrl }),
        ...(showPasswordFields && newPassword && { password: newPassword }),
      };

      console.log('Sending profile update:', payload);

      const response = await axiosInstance.put(
        API_PATHS.AUTH.UPDATE_USER_PROFILE,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Profile update failed");
      }

      updateUser(response.data.data);
      toast.success("Profile updated successfully!");
      setShowPasswordFields(false);
    } catch (error) {
      console.error('Profile update error:', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack,
      });

      const errorMessage = error.message.includes('timeout')
        ? 'Profile update timed out. Please try again or check your connection.'
        : error.response?.data?.message || error.message || 'Profile update failed. Please try again.';
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-black">Update Your Profile</h3>
        <p className="text-xs text-slate-700 mt-[5px] mb-6">
          Keep your information up to date
        </p>

        <form onSubmit={handleProfileUpdate}>
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />
          
          <div className="grid grid-col-1 md:grid-cols-2 gap-4">
            <Input
              value={fullName}
              onChange={({ target }) => setFullName(target.value)}
              label="Full Name"
              placeholder="John Doe"
              type="text"
            />

            <Input
              value={email}
              onChange={({ target }) => setEmail(target.value)}
              label="Email Address"
              placeholder="john@example.com"
              type="text"
            />

            {!showPasswordFields ? (
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordFields(true)}
                  className="text-primary text-sm underline"
                >
                  Change Password
                </button>
              </div>
            ) : (
              <>
                <Input
                  value={currentPassword}
                  onChange={({ target }) => setCurrentPassword(target.value)}
                  label="Current Password"
                  placeholder="Enter current password"
                  type="password"
                />

                <Input
                  value={newPassword}
                  onChange={({ target }) => setNewPassword(target.value)}
                  label="New Password"
                  placeholder="min 8 characters"
                  type="password"
                />

                <Input
                  value={confirmPassword}
                  onChange={({ target }) => setConfirmPassword(target.value)}
                  label="Confirm New Password"
                  placeholder="Confirm your new password"
                  type="password"
                />

                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordFields(false)}
                    className="text-red-600 text-sm underline"
                  >
                    Cancel password change
                  </button>
                </div>
              </>
            )}
          </div>

          {error && <p className="text-red-600 text-xs pb-2.5">{error}</p>}

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? "UPDATING..." : "UPDATE PROFILE"}
          </button>

          <p className="text-[13px] text-slate-800 mt-3">
            Want to go back?{" "}
            <Link 
              className="font-medium text-primary underline" 
              to={currentUser?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'}
            >
              Dashboard
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ProfileUpdate;