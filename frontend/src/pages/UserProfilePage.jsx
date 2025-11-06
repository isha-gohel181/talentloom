import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  getCurrentUser,
  updateUserProfile,
  updateUserAvatar,
  changeUserPassword,
  deleteUserAccount,
  fetchUserStats,
  clearError
} from '../redux/slice/user.slice';
import Loader from '../components/common/Loader';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  User,
  Camera,
  Mail,
  Phone,
  Globe,
  Github,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Lock,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  AlertTriangle,
  MessageSquare,
  ThumbsUp,
  Award,
  TrendingUp,
  Calendar
} from 'lucide-react';

const UserProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error, message, stats } = useSelector(state => state.user);
  const fileInputRef = useRef(null);

  // Form states
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    social_links: {
      youtube: '',
      instagram: '',
      linkedin: '',
      twitter: '',
      github: '',
      website: ''
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [activeSection, setActiveSection] = useState('profile');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [errors, setErrors] = useState({});

  // Load user data on component mount
  useEffect(() => {
    if (!user) {
      dispatch(getCurrentUser());
    } else {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
        social_links: {
          youtube: user.social_links?.youtube || '',
          instagram: user.social_links?.instagram || '',
          linkedin: user.social_links?.linkedin || '',
          twitter: user.social_links?.twitter || '',
          github: user.social_links?.github || '',
          website: user.social_links?.website || ''
        }
      });
      setAvatarPreview(user.avatar?.secure_url);
      
      // Fetch user stats
      dispatch(fetchUserStats(user._id));
    }
  }, [user, dispatch]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleProfileInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field-specific errors
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSocialLinkChange = (platform, value) => {
    setProfileData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }));

    // Clear social link errors
    if (errors[`social_${platform}`]) {
      setErrors(prev => ({
        ...prev,
        [`social_${platform}`]: ''
      }));
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear password errors
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        avatar: 'Please select a valid image file (JPEG, PNG, GIF, WebP)'
      }));
      return;
    }

    // Validate file size (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      setErrors(prev => ({
        ...prev,
        avatar: 'Image size must be less than 2MB'
      }));
      return;
    }

    setSelectedAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));

    // Clear avatar error
    if (errors.avatar) {
      setErrors(prev => ({
        ...prev,
        avatar: ''
      }));
    }
  };

  const removeAvatar = () => {
    setSelectedAvatar(null);
    setAvatarPreview(user?.avatar?.secure_url || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateProfileForm = () => {
    const newErrors = {};

    if (!profileData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (profileData.fullName.length < 4) {
      newErrors.fullName = 'Full name must be at least 4 characters';
    }

    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!profileData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[1-9]\d{9}$/.test(profileData.phone.toString())) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Validate social links
    Object.entries(profileData.social_links).forEach(([platform, url]) => {
      if (url && url.trim()) {
        try {
          const parsed = new URL(url);
          if (parsed.protocol !== 'https:') {
            newErrors[`social_${platform}`] = `${platform} link must start with https://`;
          } else if (platform !== 'website' && !parsed.hostname.includes(`${platform}.com`)) {
            newErrors[`social_${platform}`] = `${platform} link must be a valid ${platform}.com domain`;
          }
        } catch (e) {
          newErrors[`social_${platform}`] = `Please enter a valid ${platform} URL`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'New password must be at least 8 characters';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    if (!validateProfileForm()) return;

    try {
      const result = await dispatch(updateUserProfile(profileData)).unwrap();
      // Profile updated successfully
    } catch (error) {
      // Error handled by Redux
    }
  };

  const handleAvatarUpdate = async () => {
    if (!selectedAvatar) return;

    try {
      await dispatch(updateUserAvatar(selectedAvatar)).unwrap();
      setSelectedAvatar(null);
    } catch (error) {
      // Error handled by Redux
    }
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) return;

    try {
      await dispatch(changeUserPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })).unwrap();

      // Clear password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      // Error handled by Redux
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await dispatch(deleteUserAccount()).unwrap();
      navigate('/login');
    } catch (error) {
      // Error handled by Redux
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getSocialIcon = (platform) => {
    const icons = {
      youtube: Youtube,
      instagram: Instagram,
      linkedin: Linkedin,
      twitter: Twitter,
      github: Github,
      website: Globe
    };
    return icons[platform] || Globe;
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <Loader size="large" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account settings and profile information
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'security', label: 'Security', icon: Lock },
          { id: 'account', label: 'Account', icon: Trash2 }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSection === tab.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Profile Section */}
      {activeSection === 'profile' && (
        <div className="space-y-6">
          {/* Profile Picture */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>
                Upload a profile picture to personalize your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={avatarPreview} alt={user.fullName} />
                    <AvatarFallback className="text-lg">
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    className="hidden"
                  />

                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change Picture
                    </Button>

                    {avatarPreview && avatarPreview !== user?.avatar?.secure_url && (
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          onClick={handleAvatarUpdate}
                          disabled={loading}
                          size="sm"
                        >
                          {loading ? <Loader size="small" /> : 'Save Changes'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={removeAvatar}
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>

                  {errors.avatar && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                      {errors.avatar}
                    </p>
                  )}

                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    JPG, PNG, GIF, WebP. Max size 2MB.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={profileData.fullName}
                      onChange={(e) => handleProfileInputChange('fullName', e.target.value)}
                      className={errors.fullName ? 'border-red-500' : ''}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleProfileInputChange('email', e.target.value)}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleProfileInputChange('phone', e.target.value)}
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={profileData.gender}
                      onValueChange={(value) => handleProfileInputChange('gender', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="not specified">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Role Badge */}
                <div className="flex items-center space-x-2">
                  <Label>Account Type:</Label>
                  <Badge variant={user.role === 'instructor' ? 'default' : 'secondary'}>
                    {user.role === 'instructor' ? 'Instructor' : 'Student'}
                  </Badge>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader size="small" /> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>
                Connect your social media profiles and professional links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                {Object.entries(profileData.social_links).map(([platform, url]) => {
                  const Icon = getSocialIcon(platform);
                  return (
                    <div key={platform} className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 w-32">
                        <Icon className="w-5 h-5 text-gray-500" />
                        <Label className="capitalize">{platform}</Label>
                      </div>
                      <div className="flex-1">
                        <Input
                          placeholder={`https://${platform}.com/your-profile`}
                          value={url}
                          onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                          className={errors[`social_${platform}`] ? 'border-red-500' : ''}
                        />
                        {errors[`social_${platform}`] && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            {errors[`social_${platform}`]}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader size="small" /> : <><Save className="w-4 h-4 mr-2" /> Save Social Links</>}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Activity Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Statistics</CardTitle>
              <CardDescription>
                Your contribution and engagement on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{stats.totalPosts || 0}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Posts</div>
                </div>

                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{stats.totalReplies || 0}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Replies</div>
                </div>

                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <ThumbsUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">{stats.upvotesReceived || 0}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Upvotes</div>
                </div>

                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <Award className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">{stats.reputation || 0}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Reputation</div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-green-600" />
                  <span>Accepted Answers: {stats.acceptedAnswers || 0}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Member Since: {stats.memberSince ? new Date(stats.memberSince).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span>Accepted Replies: {stats.acceptedReplies || 0}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={user?.role === 'instructor' ? 'default' : 'secondary'} className="text-xs">
                    {user?.role === 'instructor' ? 'Instructor' : 'Student'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Section */}
      {activeSection === 'security' && (
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChangeSubmit} className="space-y-6">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password *</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    className={errors.currentPassword ? 'border-red-500' : ''}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password *</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className={errors.newPassword ? 'border-red-500' : ''}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader size="small" /> : <><Lock className="w-4 h-4 mr-2" /> Update Password</>}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Account Section */}
      {activeSection === 'account' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions that will affect your account permanently
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Account Information */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Account Information</h3>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <p>Member since: {new Date(user.createdAt).toLocaleDateString()}</p>
                  <p>Last updated: {new Date(user.updatedAt).toLocaleDateString()}</p>
                  <p>Email verified: {user.isVerified ? 'Yes' : 'No'}</p>
                </div>
              </div>

              <Separator />

              {/* Delete Account */}
              <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-red-900 dark:text-red-100">Delete Account</h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>

                  <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          <span>Delete Account</span>
                        </DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete your account? This action cannot be undone and will permanently remove:
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>All your posts and replies</li>
                            <li>Your profile information</li>
                            <li>All associated data</li>
                          </ul>
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setShowDeleteDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                          disabled={loading}
                        >
                          {loading ? <Loader size="small" /> : 'Delete Account'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Global Error/Success Messages */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {message && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <p className="text-green-600 dark:text-green-400">{message}</p>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;