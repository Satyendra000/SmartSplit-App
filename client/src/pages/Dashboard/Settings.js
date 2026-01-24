import { useConfirm } from "../../components/common/ConfirmModal";
import { useState, useEffect, useRef } from "react";
import {
  Users,
  Bell,
  Lock,
  Save,
  Camera,
  Upload,
  X,
  Download,
  Trash2,
  Shield,
  FileText,
} from "lucide-react";
import DashboardSidebar from "../../components/dashboard/Sidebar";

const settingsTabs = [
  { id: "profile", label: "Profile", icon: Users },
  { id: "privacy", label: "Privacy", icon: Bell },
  { id: "security", label: "Security", icon: Lock },
];

const Settings = ({ toast }) => {
  const { confirm, ConfirmModal } = useConfirm();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loading2FA, setLoading2FA] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const userName = localStorage.getItem("userName") || "Alex Doe";
  const userEmail = localStorage.getItem("userEmail") || "alex@example.com";
  const avatar = JSON.parse(localStorage.getItem("user")).avatar;

  const [exportingData, setExportingData] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: true,
    activitySharing: false,
    dataCollection: true,
    marketingEmails: false,
  });

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    avatar: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const load2FAStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:5000/api/auth/2fa-status",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();
        if (data.success) {
          setTwoFactorEnabled(data.data.twoFactorEnabled);
        }
      } catch (error) {
        console.error("Error loading 2FA status:", error);
        toast.error("Error loading 2FA status");
      }
    };

    load2FAStatus();
    loadUserData();
  }, []);

  const handle2FAToggle = async (enabled) => {
    try {
      setLoading2FA(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/auth/toggle-2fa",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ enabled }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setTwoFactorEnabled(enabled);
        toast.success(
          `Two-factor authentication ${enabled ? "enabled" : "disabled"} successfully`,
        );
      } else {
        toast.error(data.message || "Failed to update 2FA settings");
      }
    } catch (error) {
      console.error("Error toggling 2FA:", error);
      toast.error("Failed to update 2FA settings");
    } finally {
      setLoading2FA(false);
    }
  };

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://localhost:5000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        const user = data.data;
        const name = user.name.split(" ");

        setProfileData({
          firstName: name[0] || "",
          lastName: name.slice(1).join(" ") || "",
          email: user.email || "",
          phone: user.phone || "",
          bio: user.bio || "",
          avatar: user.avatar || "",
        });

        if (user.avatar && user.avatar !== "https://via.placeholder.com/150") {
          setAvatarPreview(user.avatar);
        }

        localStorage.setItem("userName", user.name);
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("user", JSON.stringify(user));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setAvatarFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) {
      toast.error("Please select an image first");
      return;
    }

    try {
      setUploadingAvatar(true);

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;

        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:5000/api/auth/update-avatar",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ avatar: base64Image }),
          },
        );

        const data = await response.json();

        if (data.success) {
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          user.avatar = data.data.avatar;
          localStorage.setItem("user", JSON.stringify(user));

          setProfileData({ ...profileData, avatar: data.data.avatar });
          setAvatarFile(null);
          toast.success("Profile photo updated successfully!");

          setTimeout(() => window.location.reload(), 1500);
        } else {
          toast.error(data.message || "Failed to upload photo");
        }
      };

      reader.readAsDataURL(avatarFile);
    } catch (error) {
  console.error("Error uploading avatar:", error);
  toast.error("Failed to upload photo. Please try again.");
}finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setProfileData({ ...profileData, avatar: "" });
  };

  const handleProfileUpdate = async () => {
    if (!profileData.firstName.trim() || !profileData.email.trim()) {
      toast.error("Please fill in required fields (First Name and Email)");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const fullName =
        `${profileData.firstName} ${profileData.lastName}`.trim();

      const response = await fetch(
        "http://localhost:5000/api/auth/update-profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: fullName,
            email: profileData.email,
            phone: profileData.phone.trim() || "",
            bio: profileData.bio.trim() || "",
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("userName", fullName);
        localStorage.setItem("userEmail", profileData.email);

        const user = JSON.parse(localStorage.getItem("user") || "{}");
        user.name = fullName;
        user.email = profileData.email;
        user.phone = profileData.phone.trim();
        user.bio = profileData.bio.trim();
        localStorage.setItem("user", JSON.stringify(user));

        toast.success("Profile updated successfully!");
        await loadUserData();
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/auth/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        toast.success("Password changed successfully!");
      } else {
        toast.error(data.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyUpdate = async () => {
    try {
      setLoading(true);
      localStorage.setItem("privacySettings", JSON.stringify(privacySettings));
      toast.success("Privacy settings updated successfully!");
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      toast.error("Failed to update privacy settings");
    } finally {
      setLoading(false);
    }
  };

  const handleDataExport = async () => {
    try {
      setExportingData(true);

      const userData = {
        profile: JSON.parse(localStorage.getItem("user") || "{}"),
        exportDate: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `expense-tracker-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Your data has been exported successfully!");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data. Please try again.");
    } finally {
      setExportingData(false);
    }
  };

 const handleAccountDeletion = async () => {
   try {
     setLoading(true);
     const token = localStorage.getItem("token");

     const response = await fetch(
       "http://localhost:5000/api/auth/delete-account",
       {
         method: "DELETE",
         headers: {
           Authorization: `Bearer ${token}`,
         },
       },
     );

     const data = await response.json();

     if (data?.success || !token) {
       toast.success("Account deleted successfully. Redirecting...");
       setTimeout(() => {
         localStorage.clear();
         window.location.href = "/login";
       }, 2000);
     } else {
       toast.error(data.message || "Failed to delete account");
     }
   } catch (error) {
     console.error("Error deleting account:", error);
     toast.error("Failed to delete account. Please try again.");
   } finally {
     setLoading(false);
   }
 };

 const confirmAccountDeletion = () => {
   confirm({
     title: "Delete Account Permanently?",
     message:
       "This action cannot be undone. All your data, expenses, and groups will be permanently deleted.",
     confirmText: "Yes, Delete My Account",
     cancelText: "Cancel",
     type: "danger",
     onConfirm: handleAccountDeletion,
   });
 };

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      <DashboardSidebar
        userName={userName}
        userEmail={userEmail}
        Index={4}
        avatar={avatar}
      />

      <main className="lg:ml-64 p-4 sm:p-6 lg:p-8 relative z-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8 mt-16 lg:mt-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            Settings
          </h1>
          <p className="text-sm sm:text-base text-white/50">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/5 lg:sticky lg:top-8">
              <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 -mx-2 px-2 lg:mx-0 lg:px-0 scrollbar-hide">
                {settingsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 whitespace-nowrap flex-shrink-0 lg:w-full ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20"
                        : "text-white/60 hover:bg-white/5 hover:text-white/90"
                    }`}
                  >
                    <tab.icon
                      className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                      strokeWidth={1.5}
                    />
                    <span className="font-medium text-xs sm:text-sm lg:text-base">
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-9">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 lg:p-8 border border-white/5">
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">
                  Profile Information
                </h2>

                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-white/5">
                  <div className="relative group">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Profile"
                        className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover border-4 border-orange-500/20"
                      />
                    ) : (
                      <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xl sm:text-2xl font-semibold border-4 border-orange-500/20">
                        {profileData.firstName[0] || "U"}
                        {profileData.lastName[0] || ""}
                      </div>
                    )}

                    <button
                      onClick={handleAvatarClick}
                      className="absolute bottom-0 right-0 p-1.5 sm:p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full text-white hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/20"
                    >
                      <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>

                    {avatarPreview && (
                      <button
                        onClick={handleRemoveAvatar}
                        className="absolute -top-2 -right-2 p-1 sm:p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition-all shadow-lg"
                      >
                        <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </button>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>

                  <div className="flex-1 text-center sm:text-left w-full">
                    <h3 className="font-semibold text-white text-base sm:text-lg">
                      {userName}
                    </h3>
                    <p className="text-sm sm:text-base text-white/60">
                      {userEmail}
                    </p>
                    <p className="text-xs sm:text-sm text-white/50 mt-1">
                      Member since {new Date().getFullYear()}
                    </p>

                    {avatarFile && (
                      <button
                        onClick={handleUploadAvatar}
                        disabled={uploadingAvatar}
                        className="mt-3 flex items-center justify-center sm:justify-start gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 w-full sm:w-auto mx-auto sm:mx-0"
                      >
                        {uploadingAvatar ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>Upload Photo</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Profile Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-white mb-2">
                      First Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      value={profileData.firstName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          firstName: e.target.value,
                        })
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                      placeholder="Enter first name"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-white mb-2">
                      Last Name
                    </label>
                    <input
                      value={profileData.lastName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          lastName: e.target.value,
                        })
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                      placeholder="Enter last name"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-white mb-2">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                      placeholder="your.email@example.com"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-white mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          phone: e.target.value,
                        })
                      }
                      placeholder="+91 98765 43210"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                    />
                    <p className="text-[10px] sm:text-xs text-white/40 mt-1">
                      Optional - for account recovery
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-white mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData({ ...profileData, bio: e.target.value })
                      }
                      className="w-full h-20 sm:h-24 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all resize-none"
                      placeholder="Tell us about yourself..."
                    />
                    <p className="text-[10px] sm:text-xs text-white/40 mt-1">
                      {profileData.bio.length}/200 characters
                    </p>
                  </div>
                </div>

                <div className="flex justify-end mt-6 sm:mt-8">
                  <button
                    onClick={handleProfileUpdate}
                    disabled={loading}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm sm:text-base font-semibold rounded-lg shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === "privacy" && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 lg:p-8 border border-white/5">
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-6">
                  Privacy & Data Management
                </h2>

                {/* Privacy Toggles */}
                <div className="space-y-4 mb-8">
                  {[
                    {
                      key: "profileVisibility",
                      title: "Profile Visibility",
                      desc: "Allow others to see your profile in shared groups",
                    },
                    {
                      key: "activitySharing",
                      title: "Activity Sharing",
                      desc: "Share your expense activity with group members",
                    },
                    {
                      key: "dataCollection",
                      title: "Analytics & Improvement",
                      desc: "Help improve the app by sharing anonymous usage data",
                    },
                    {
                      key: "marketingEmails",
                      title: "Marketing Emails",
                      desc: "Receive feature updates and tips by email",
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-4 rounded-lg border border-white/5 hover:bg-white/5 transition"
                    >
                      <div>
                        <p className="text-white font-medium text-sm sm:text-base">
                          {item.title}
                        </p>
                        <p className="text-white/50 text-xs sm:text-sm">
                          {item.desc}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          setPrivacySettings({
                            ...privacySettings,
                            [item.key]: !privacySettings[item.key],
                          })
                        }
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                          privacySettings[item.key]
                            ? "bg-orange-500"
                            : "bg-white/20"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            privacySettings[item.key] ? "translate-x-6" : ""
                          }`}
                        ></div>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Save Privacy */}
                <div className="flex justify-end mb-10">
                  <button
                    onClick={handlePrivacyUpdate}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-lg hover:shadow-xl transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    Save Privacy Settings
                  </button>
                </div>

                {/* Data Export */}
                <div className="border-t border-white/10 pt-6 mb-8">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-500" />
                    Export Your Data
                  </h3>
                  <p className="text-white/50 text-sm mb-4">
                    Download all your account data in JSON format.
                  </p>

                  <button
                    onClick={handleDataExport}
                    disabled={exportingData}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    {exportingData ? "Exporting..." : "Export Data"}
                  </button>
                </div>

                {/* Delete Account */}
                <div className="border-t border-red-500/20 pt-6">
                  <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    Delete Account
                  </h3>
                  <p className="text-white/50 text-sm mb-4">
                    This action is permanent and cannot be undone.
                  </p>

                  <button
                    onClick={confirmAccountDeletion}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete My Account
                  </button>
                </div>
              </div>
            )}
            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 lg:p-8 border border-white/5">
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-6">
                  Security Settings
                </h2>

                {/* Change Password */}
                <div className="space-y-4 max-w-md mb-10">
                  {[
                    { key: "currentPassword", label: "Current Password" },
                    { key: "newPassword", label: "New Password" },
                    { key: "confirmPassword", label: "Confirm New Password" },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm text-white mb-2">
                        {field.label}
                      </label>
                      <input
                        type="password"
                        value={passwordData[field.key]}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            [field.key]: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/50 transition"
                      />
                    </div>
                  ))}

                  <button
                    onClick={handlePasswordChange}
                    disabled={loading}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-lg hover:shadow-xl transition disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" />
                    Change Password
                  </button>
                </div>

                {/* Two Factor Authentication */}
                <div className="border-t border-white/10 pt-6 max-w-md">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-orange-500" />
                    Two-Factor Authentication
                  </h3>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-white/5 hover:bg-white/5 transition">
                    <div>
                      <p className="text-white font-medium">Enable 2FA</p>
                      <p className="text-white/50 text-sm">
                        Add an extra layer of account security
                      </p>
                    </div>

                    <button
                      onClick={() => handle2FAToggle(!twoFactorEnabled)}
                      disabled={loading2FA}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                        twoFactorEnabled ? "bg-green-500" : "bg-white/20"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          twoFactorEnabled ? "translate-x-6" : ""
                        }`}
                      ></div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <ConfirmModal />
    </div>
  );
};

export default Settings;
