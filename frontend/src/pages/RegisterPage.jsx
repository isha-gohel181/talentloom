import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../redux/slice/user.slice';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(state => state.user);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Password strength calculation
  useEffect(() => {
    const calculateStrength = (password) => {
      let strength = 0;
      if (password.length >= 8) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[a-z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;
      return strength;
    };

    setPasswordStrength(calculateStrength(formData.password));
  }, [formData.password]);

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0: return { text: '', color: '' };
      case 1: return { text: 'Very Weak', color: 'bg-red-500' };
      case 2: return { text: 'Weak', color: 'bg-orange-500' };
      case 3: return { text: 'Fair', color: 'bg-yellow-500' };
      case 4: return { text: 'Good', color: 'bg-blue-500' };
      case 5: return { text: 'Strong', color: 'bg-green-500' };
      default: return { text: '', color: '' };
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!acceptTerms) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    if (passwordStrength < 3) {
      return;
    }

    try {
      await dispatch(registerUser({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        gender: formData.gender || undefined
      })).unwrap();
      // Navigation will happen via useEffect
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const passwordMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
  const passwordMismatch = formData.confirmPassword && !passwordMatch;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Registration Form */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Join our community</CardTitle>
            <CardDescription>Create your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Gender (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="gender">Gender <span className="text-gray-500">(Optional)</span></Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
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

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthText().color}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {getPasswordStrengthText().text}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Use at least 8 characters with uppercase, lowercase, numbers, and symbols
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className={`pr-10 ${
                      passwordMismatch
                        ? 'border-destructive focus:ring-destructive'
                        : passwordMatch
                        ? 'border-green-500'
                        : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {passwordMismatch && (
                  <p className="text-destructive text-xs mt-1">Passwords do not match</p>
                )}
                {passwordMatch && formData.confirmPassword && (
                  <p className="text-green-600 text-xs mt-1">✓ Passwords match</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2">
                <input
                  id="accept-terms"
                  name="accept-terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-border rounded mt-0.5"
                  required
                />
                <Label htmlFor="accept-terms" className="text-sm leading-relaxed">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary hover:text-primary/80">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary hover:text-primary/80">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex">
                    <span className="text-destructive text-sm">⚠️ {error}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || !acceptTerms || passwordStrength < 3 || passwordMismatch}
                className="w-full"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;