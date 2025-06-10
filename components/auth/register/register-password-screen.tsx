"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Eye, EyeOff, Lock, Check, X } from "lucide-react"

interface RegisterPasswordScreenProps {
  onBack: () => void
  onSubmit: (password: string) => void
}

export default function RegisterPasswordScreen({ onBack, onSubmit }: RegisterPasswordScreenProps) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Password validation criteria
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  const passwordsMatch = password === confirmPassword && password !== ""

  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (isPasswordValid && passwordsMatch) {
      setIsLoading(true)

      // Simulate API call
      setTimeout(() => {
        setIsLoading(false)
        onSubmit(password)
      }, 1000)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md"
    >
      <Card className="border-none shadow-lg overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-500 to-teal-400 animate-gradient" />

        <CardHeader className="space-y-1 pt-6">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 -ml-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <CardTitle className="text-2xl font-bold">Create Password</CardTitle>
          </div>
          <CardDescription>Choose a secure password for your account</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <Lock size={16} />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <Lock size={16} />
                  </div>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                <p className="text-sm font-medium mb-2">Password must contain:</p>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center">
                    {hasMinLength ? (
                      <Check size={16} className="text-green-500 mr-2" />
                    ) : (
                      <X size={16} className="text-gray-400 mr-2" />
                    )}
                    <span className={hasMinLength ? "text-green-700 dark:text-green-500" : "text-gray-600"}>
                      At least 8 characters
                    </span>
                  </li>
                  <li className="flex items-center">
                    {hasUppercase ? (
                      <Check size={16} className="text-green-500 mr-2" />
                    ) : (
                      <X size={16} className="text-gray-400 mr-2" />
                    )}
                    <span className={hasUppercase ? "text-green-700 dark:text-green-500" : "text-gray-600"}>
                      At least one uppercase letter
                    </span>
                  </li>
                  <li className="flex items-center">
                    {hasLowercase ? (
                      <Check size={16} className="text-green-500 mr-2" />
                    ) : (
                      <X size={16} className="text-gray-400 mr-2" />
                    )}
                    <span className={hasLowercase ? "text-green-700 dark:text-green-500" : "text-gray-600"}>
                      At least one lowercase letter
                    </span>
                  </li>
                  <li className="flex items-center">
                    {hasNumber ? (
                      <Check size={16} className="text-green-500 mr-2" />
                    ) : (
                      <X size={16} className="text-gray-400 mr-2" />
                    )}
                    <span className={hasNumber ? "text-green-700 dark:text-green-500" : "text-gray-600"}>
                      At least one number
                    </span>
                  </li>
                  <li className="flex items-center">
                    {hasSpecialChar ? (
                      <Check size={16} className="text-green-500 mr-2" />
                    ) : (
                      <X size={16} className="text-gray-400 mr-2" />
                    )}
                    <span className={hasSpecialChar ? "text-green-700 dark:text-green-500" : "text-gray-600"}>
                      At least one special character
                    </span>
                  </li>
                  <li className="flex items-center mt-2">
                    {passwordsMatch ? (
                      <Check size={16} className="text-green-500 mr-2" />
                    ) : (
                      <X size={16} className="text-gray-400 mr-2" />
                    )}
                    <span className={passwordsMatch ? "text-green-700 dark:text-green-500" : "text-gray-600"}>
                      Passwords match
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={isLoading || !isPasswordValid || !passwordsMatch}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
