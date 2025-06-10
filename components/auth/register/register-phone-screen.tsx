"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import PhoneInput from "../phone-input"

interface RegisterPhoneScreenProps {
  onBack: () => void
  onSubmit: (phoneNumber: string, countryCode: string) => void
  initialPhoneNumber?: string
  initialCountryCode?: string
}

export default function RegisterPhoneScreen({
  onBack,
  onSubmit,
  initialPhoneNumber = "",
  initialCountryCode = "+1",
}: RegisterPhoneScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber)
  const [countryCode, setCountryCode] = useState(initialCountryCode)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      onSubmit(phoneNumber, countryCode)
    }, 1000)
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
            <CardTitle className="text-2xl font-bold">Your Phone</CardTitle>
          </div>
          <CardDescription>
            Please enter your phone number. We'll send a verification code to this number.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <PhoneInput
                value={phoneNumber}
                onChange={setPhoneNumber}
                countryCode={countryCode}
                onCountryCodeChange={setCountryCode}
              />
              <p className="text-xs text-gray-500">
                By continuing, you agree to receive an SMS for verification. Message and data rates may apply.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={isLoading || !phoneNumber.trim()}
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
                  Sending Code...
                </div>
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 px-6 pb-6 pt-0">
          <div className="text-center">
            <p className="text-xs text-gray-500">We'll never share your phone number with anyone else.</p>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
