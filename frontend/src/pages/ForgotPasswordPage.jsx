import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { sendResetPasswordLink, clearError, clearPasswordResetState } from '../redux/slice/user.slice';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { passwordReset, error } = useSelector(state => state.user);

  useEffect(() => {
    // Clear any previous states when component mounts
    dispatch(clearError());
    dispatch(clearPasswordResetState());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      return;
    }

    try {
      await dispatch(sendResetPasswordLink(email)).unwrap();
      // Success is handled by the slice
    } catch (error) {
      // Error is handled by the slice
      console.error('Failed to send reset link:', error);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    // Clear error when user starts typing
    if (error) {
      dispatch(clearError());
    }
  };

  // If link was sent successfully, show success message
  if (passwordReset.linkSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-green-600">Check Your Email</CardTitle>
              <CardDescription>
                We've sent a password reset link to <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Click the link in the email to reset your password. The link will expire in 15 minutes.
              </p>

              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full"
                >
                  Back to Sign In
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    dispatch(clearPasswordResetState());
                    setEmail('');
                  }}
                  className="w-full"
                >
                  Send Another Link
                </Button>
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    onClick={() => dispatch(clearPasswordResetState())}
                    className="text-primary hover:text-primary/80 underline"
                  >
                    try again
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Forgot Password Form */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Forgot your password?</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter your email"
                  disabled={passwordReset.loading}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex">
                    <span className="text-destructive text-sm">⚠️ {error}</span>
                  </div>
                </div>
              )}

              {/* Success Message for password reset state */}
              {passwordReset.error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex">
                    <span className="text-destructive text-sm">⚠️ {passwordReset.error}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={passwordReset.loading || !email}
                className="w-full"
              >
                {passwordReset.loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending reset link...</span>
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back to Login Link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;