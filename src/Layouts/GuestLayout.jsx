// GuestLayout.jsx
import ApplicationLogo from '@/Components/ApplicationLogo';
import Login from '@/Pages/Auth/Login';
import Register from '@/Pages/Auth/Register';
import ForgotPassword from '@/Pages/Auth/ForgotPassword';
import ResetPassword from '@/Pages/Auth/ResetPassword';
import ConfirmPassword from '@/Pages/Auth/ConfirmPassword';
import VerifyEmail from '@/Pages/Auth/VerifyEmail';
import ForceChangePassword from '@/Pages/Auth/ForceChangePassword';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/Stores/authStore';
import { Carousel, CarouselContent, CarouselItem } from "@/Components/ui/carousel";
import { ShieldCheck, UserPlus, Lock, Mail, Zap, Users } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Dashboard from '@/pages/Dashboard';
import LoadingIndicator from './LoadingIndicator';

// Map paths to components
const AuthPages = {
  login: Login,
  register: Register,
  "forgot-password": ForgotPassword,
  "reset-password": ResetPassword,
  "confirm-password": ConfirmPassword,
  "verify-email": VerifyEmail,
  "force-change-password": ForceChangePassword,
};

export default function GuestLayout() {
  const { user, loading, initAuth, forcePasswordChange } = useAuthStore();
  const [api, setApi] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  console.log("user guest: ", user);
  console.log("loading: ", loading);
  console.log("forcePasswordChange: ", forcePasswordChange);

  // Fetch current user on mount if not already loaded
  useEffect(() => {
    if (!user) initAuth();
  }, [user, initAuth]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
        <LoadingIndicator/>
    );
  }

  // Determine current auth page from URL
  const pathName = location.pathname.replace("/", "") || "login";
  const isForcePasswordChangePage = pathName === "force-change-password";

  // If user is authenticated and must change password, allow access to force-change-password page
  if (user && forcePasswordChange && isForcePasswordChangePage) {
    // Allow access to this page
    return (
      <div className="min-h-screen w-full flex">
        <div className="flex w-full justify-center items-center bg-gray-50 p-4">
          <div className="w-full max-w-md">
            <div className="flex justify-center mb-3">
              <ApplicationLogo size={30} />
            </div>
            <ForceChangePassword />
          </div>
        </div>
      </div>
    );
  }

  // If user must change password but is not on the force-change-password page, redirect them there
  if (user && forcePasswordChange && !isForcePasswordChangePage) {
    return <Navigate to="/force-change-password" replace />;
  }

  // Redirect authenticated users (who don't need to change password) to dashboard
  if (user && !forcePasswordChange) {
    return <Navigate to="/dashboard" replace />;
  }

  const CurrentComponent = AuthPages[pathName] || Login;

  // Carousel content per auth page
  const getCarouselContent = () => {
    const contentMap = {
      login: [
        {
          icon: ShieldCheck,
          title: "Welcome Back",
          description: "Securely access your InternTrack dashboard and manage your team.",
          action: { text: "Don't have an account?", linkText: "Sign up here", href: "/register" },
        },
        {
          icon: Zap,
          title: "Track Performance",
          description: "Monitor intern progress, evaluate performance, and provide real-time feedback.",
          action: null,
        },
        {
          icon: Users,
          title: "Manage Your Team",
          description: "Centralize all intern management tasks in one powerful dashboard.",
          action: null,
        },
      ],
      register: [
        {
          icon: UserPlus,
          title: "Join InternTrack",
          description: "Create your account and start managing your internship program today.",
          action: { text: "Already have an account?", linkText: "Log in here", href: "/login" },
        },
        {
          icon: ShieldCheck,
          title: "Secure & Reliable",
          description: "Your data is protected with enterprise-grade security and encryption.",
          action: null,
        },
        {
          icon: Zap,
          title: "Get Started Fast",
          description: "Set up your workspace in minutes and invite your team members instantly.",
          action: null,
        },
      ],
      "forgot-password": [
        {
          icon: Lock,
          title: "Reset Your Password",
          description: "Enter your email address and we will send you a secure reset link.",
          action: { text: "Remember your password?", linkText: "Log in here", href: "/login" },
        },
        {
          icon: Mail,
          title: "Check Your Email",
          description: "The password reset link will arrive within a few minutes.",
          action: null,
        },
        {
          icon: ShieldCheck,
          title: "Secure Process",
          description: "All password resets are encrypted and expire after 60 minutes for your security.",
          action: null,
        },
      ],
    };
    return contentMap[pathName] || contentMap.login;
  };

  const carouselSlides = getCarouselContent();

  return (
    <div className="min-h-screen w-full flex">
      {/* LEFT IMAGE / CAROUSEL */}
      <div className="hidden md:flex w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{ backgroundImage: "url('/interns.png')" }}
        />
        <div className="absolute inset-0 backdrop-blur-md bg-black/60" />
        <div className="relative z-10 w-full flex items-center justify-center p-12 translate-y-[50px]">
          <Carousel
            opts={{ align: "start", loop: true }}
            plugins={[Autoplay({ delay: 4000 })]}
            setApi={setApi}
            className="w-full max-w-lg"
          >
            <CarouselContent>
              {carouselSlides.map((slide, index) => (
                <CarouselItem key={index}>
                  <div className="flex flex-col items-center text-center space-y-6 p-8">
                    <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                      <slide.icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-3xl font-bold text-white">{slide.title}</h2>
                      <p className="text-lg text-gray-200 leading-relaxed max-w-md">
                        {slide.description}
                      </p>
                    </div>
                    {slide.action && (
                      <div className="pt-4">
                        <p className="text-sm text-gray-300">
                          {slide.action.text}{" "}
                          <Link
                            to={slide.action.href}
                            className="text-primary-300 font-semibold hover:underline"
                          >
                            {slide.action.linkText}
                          </Link>
                        </p>
                      </div>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Carousel indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {carouselSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className="w-2 h-2 rounded-full bg-white/40 hover:bg-white transition-all"
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </Carousel>
        </div>
      </div>

      {/* RIGHT FORM */}
      <div className="flex w-full md:w-1/2 justify-center items-center bg-gray-50 p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-3">
            <button onClick={() => navigate("/login")}>
              <ApplicationLogo size={30} />
            </button>
          </div>

          {/* Render current auth page */}
          {CurrentComponent && (
            <CurrentComponent
              navigate={(pageName) => navigate(`/${pageName}`)}
            />
          )}
        </div>
      </div>
    </div>
  );
}