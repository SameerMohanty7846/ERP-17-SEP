// import React, { useState } from 'react';
// import apiClient from '@/api/axiosConfig';
// import { toast } from 'sonner';
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Spinner } from '@/components/ui/spinner';

// const ChangePasswordTab = () => {
//     const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' });
//     const [loading, setLoading] = useState(false);

//     const handleChange = (e) => {
//         setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         try {
//             await apiClient.put('/account/me/password', passwordData);
//             toast.success("Password changed successfully!");
//             setPasswordData({ oldPassword: '', newPassword: '' });
//         } catch (error) {
//             toast.error(error.response?.data?.message || "Failed to change password.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <form onSubmit={handleSubmit}>
//             <Card>
//                 <CardHeader>
//                     <CardTitle>Change Password</CardTitle>
//                     <CardDescription>Enter your old password and a new one. Your new password must be at least 6 characters long.</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                     <div className="space-y-2">
//                         <Label htmlFor="oldPassword">Old Password</Label>
//                         <Input id="oldPassword" name="oldPassword" type="password" value={passwordData.oldPassword} onChange={handleChange} required />
//                     </div>
//                     <div className="space-y-2">
//                         <Label htmlFor="newPassword">New Password</Label>
//                         <Input id="newPassword" name="newPassword" type="password" value={passwordData.newPassword} onChange={handleChange} required />
//                     </div>
//                 </CardContent>
//                 <CardFooter>
//                     <Button type="submit" disabled={loading}>
//                         {loading && <Spinner  />}
//                         Update Password
//                     </Button>
//                 </CardFooter>
//             </Card>
//         </form>
//     );
// }

// const AccountSettingsPage = () => {
//     return (
//         <div className="container mx-auto max-w-4xl py-6">
//             <h1 className="text-3xl font-bold mb-6">Settings</h1>
//             <Tabs defaultValue="password">
//                 <TabsList className="grid w-full grid-cols-2">
//                     <TabsTrigger value="password">Password</TabsTrigger>
//                     {/* <TabsTrigger value="notifications" disabled>Notifications</TabsTrigger> */}
//                 </TabsList>
//                 <TabsContent value="password">
//                     <ChangePasswordTab />
//                 </TabsContent>
//                 {/* <TabsContent value="notifications">
//                 </TabsContent> */}
//             </Tabs>
//         </div>
//     );
// };

// export default AccountSettingsPage;

import React, { useState } from "react";
import apiClient from "@/api/axiosConfig";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";

const ChangePasswordTab = () => {
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "",
    colorClass: "",
  });
  const [verifyingOldPassword, setVerifyingOldPassword] = useState(false);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[\W_]/.test(password)) strength += 1;

    let label = "";
    let colorClass = "";

    switch (strength) {
      case 1:
        label = "Very Weak";
        colorClass = "bg-red-500";
        break;
      case 2:
        label = "Weak";
        colorClass = "bg-yellow-400";
        break;
      case 3:
        label = "Moderate";
        colorClass = "bg-yellow-500";
        break;
      case 4:
        label = "Strong";
        colorClass = "bg-green-400";
        break;
      case 5:
        label = "Very Strong";
        colorClass = "bg-green-600";
        break;
      default:
        label = "";
        colorClass = "";
    }

    return { score: strength, label, colorClass };
  };

  // Verify current password onBlur
  const verifyOldPassword = async () => {
    const oldPassword = passwordData.oldPassword.trim();
    if (!oldPassword) {
      // If empty, clear any previous error
      setErrors((prev) => ({ ...prev, oldPassword: null }));
      return;
    }

    setVerifyingOldPassword(true);

    try {
      await apiClient.post(
        "/account/me/verify",
        { password: oldPassword }
      );
      // Password verified, clear error if any
      setErrors((prev) => ({ ...prev, oldPassword: null }));
    } catch (error) {
      // Set error message if verification fails
      setErrors((prev) => ({
        ...prev,
        oldPassword:
          error.response?.data?.message || "Old password is incorrect.",
      }));
    } finally {
      setVerifyingOldPassword(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));

    // Clear error on input change for that field
    setErrors((prev) => ({ ...prev, [name]: "" }));

    // Update password strength when newPassword changes
    if (name === "newPassword") {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!passwordData.oldPassword.trim()) {
      newErrors.oldPassword = "Old password is required.";
    }

    if (!passwordData.newPassword.trim()) {
      newErrors.newPassword = "New password is required.";
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "New password must be at least 8 characters.";
    }

    if (!passwordData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your new password.";
    } else if (passwordData.confirmPassword !== passwordData.newPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await apiClient.put("/account/me/password", {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password changed successfully!");
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setErrors({});
      setPasswordStrength({ score: 0, label: "", colorClass: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate width of strength meter bar for smooth animation
  const strengthPercentage = Math.min((passwordStrength.score / 5) * 100, 100);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Enter your old password and a new one. Your new password must be at
            least 8 characters long.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="oldPassword">Old Password</Label>
            <Input
              id="oldPassword"
              name="oldPassword"
              type="password"
              value={passwordData.oldPassword}
              onChange={handleChange}
              onBlur={verifyOldPassword} // <-- verify on blur
              aria-invalid={errors.oldPassword ? "true" : "false"}
              aria-describedby="oldPassword-error"
              disabled={loading}
            />
            {verifyingOldPassword && (
              <p className="text-sm text-gray-500 mt-1">Verifying password...</p>
            )}
            {errors.oldPassword && (
              <p
                id="oldPassword-error"
                className="text-red-600 text-sm mt-1"
                role="alert"
              >
                {errors.oldPassword}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handleChange}
              aria-invalid={errors.newPassword ? "true" : "false"}
              aria-describedby="newPassword-error passwordStrength-label"
              placeholder="At least 8 characters"
              disabled={loading}
            />
            {errors.newPassword && (
              <p
                id="newPassword-error"
                className="text-red-600 text-sm mt-1"
                role="alert"
              >
                {errors.newPassword}
              </p>
            )}

            {/* Password Strength Meter */}
            {passwordStrength.label && (
              <>
                <div className="w-full bg-gray-300 h-2 rounded mt-1 mb-1">
                  <div
                    className={`h-2 rounded transition-all duration-300 ${passwordStrength.colorClass}`}
                    style={{ width: `${Math.max(strengthPercentage, 5)}%` }}
                  />
                </div>
                <p
                  id="passwordStrength-label"
                  className="text-sm font-semibold text-gray-700 h-5"
                >
                  {passwordStrength.label}
                </p>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handleChange}
              aria-invalid={errors.confirmPassword ? "true" : "false"}
              aria-describedby="confirmPassword-error"
              disabled={loading}
            />
            {errors.confirmPassword && (
              <p
                id="confirmPassword-error"
                className="text-red-600 text-sm mt-1"
                role="alert"
              >
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading && <Spinner />} Update Password
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

const AccountSettingsPage = () => {
  return (
    <div className="container mx-auto max-w-4xl py-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <Tabs defaultValue="password">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="password">Password</TabsTrigger>
          {/* <TabsTrigger value="notifications" disabled>Notifications</TabsTrigger> */}
        </TabsList>
        <TabsContent value="password">
          <ChangePasswordTab />
        </TabsContent>
        {/* <TabsContent value="notifications"></TabsContent> */}
      </Tabs>
    </div>
  );
};

export default AccountSettingsPage;
