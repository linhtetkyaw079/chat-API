"use client"

import { useState } from "react"
import LoginScreen from "./login-screen"
import RegisterPhoneScreen from "./register/register-phone-screen"
import RegisterVerificationScreen from "./register/register-verification-screen"
import RegisterProfileScreen from "./register/register-profile-screen"
import RegisterPasswordScreen from "./register/register-password-screen"
import RegisterSuccessScreen from "./register/register-success-screen"
import { AnimatePresence } from "framer-motion"

export type RegistrationData = {
  phoneNumber: string
  countryCode: string
  verificationCode: string
  fullName: string
  username: string
  password: string
  profileImage?: string
}

export default function AuthScreens() {
  const [currentScreen, setCurrentScreen] = useState<
    "login" | "register-phone" | "register-verification" | "register-profile" | "register-password" | "register-success"
  >("login")

  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    phoneNumber: "",
    countryCode: "+1",
    verificationCode: "",
    fullName: "",
    username: "",
    password: "",
  })

  const updateRegistrationData = (data: Partial<RegistrationData>) => {
    setRegistrationData((prev) => ({ ...prev, ...data }))
  }

  const handleStartRegistration = () => {
    setCurrentScreen("register-phone")
  }

  const handleBackToLogin = () => {
    setCurrentScreen("login")
  }

  const handlePhoneSubmit = (phoneNumber: string, countryCode: string) => {
    updateRegistrationData({ phoneNumber, countryCode })
    setCurrentScreen("register-verification")
  }

  const handleVerificationSubmit = (code: string) => {
    updateRegistrationData({ verificationCode: code })
    setCurrentScreen("register-profile")
  }

  const handleProfileSubmit = (fullName: string, username: string, profileImage?: string) => {
    updateRegistrationData({ fullName, username, profileImage })
    setCurrentScreen("register-password")
  }

  const handlePasswordSubmit = (password: string) => {
    updateRegistrationData({ password })
    setCurrentScreen("register-success")
  }

  const handleCompleteRegistration = () => {
    // In a real app, this would navigate to the main app
    setCurrentScreen("login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {currentScreen === "login" && <LoginScreen key="login" onRegister={handleStartRegistration} />}

        {currentScreen === "register-phone" && (
          <RegisterPhoneScreen
            key="register-phone"
            onBack={handleBackToLogin}
            onSubmit={handlePhoneSubmit}
            initialCountryCode={registrationData.countryCode}
            initialPhoneNumber={registrationData.phoneNumber}
          />
        )}

        {currentScreen === "register-verification" && (
          <RegisterVerificationScreen
            key="register-verification"
            onBack={() => setCurrentScreen("register-phone")}
            onSubmit={handleVerificationSubmit}
            phoneNumber={`${registrationData.countryCode} ${registrationData.phoneNumber}`}
          />
        )}

        {currentScreen === "register-profile" && (
          <RegisterProfileScreen
            key="register-profile"
            onBack={() => setCurrentScreen("register-verification")}
            onSubmit={handleProfileSubmit}
          />
        )}

        {currentScreen === "register-password" && (
          <RegisterPasswordScreen
            key="register-password"
            onBack={() => setCurrentScreen("register-profile")}
            onSubmit={handlePasswordSubmit}
          />
        )}

        {currentScreen === "register-success" && (
          <RegisterSuccessScreen
            key="register-success"
            userData={registrationData}
            onComplete={handleCompleteRegistration}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
