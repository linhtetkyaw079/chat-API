"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle2 } from "lucide-react"
import type { RegistrationData } from "../auth-screens"

interface RegisterSuccessScreenProps {
  userData: RegistrationData
  onComplete: () => void
}

export default function RegisterSuccessScreen({ userData, onComplete }: RegisterSuccessScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md"
    >
      <Card className="border-none shadow-lg overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-500 to-teal-400 animate-gradient" />

        <CardHeader className="space-y-1 pt-6">
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-teal-100 p-3 mb-4">
              <CheckCircle2 className="h-12 w-12 text-teal-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Account Created!</CardTitle>
            <CardDescription className="text-center">Your account has been successfully created</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col items-center space-y-6">
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="h-24 w-24 border-2 border-white shadow-md">
                {userData.profileImage ? (
                  <AvatarImage src={userData.profileImage || "/placeholder.svg"} alt={userData.fullName} />
                ) : (
                  <AvatarFallback className="bg-teal-100 text-teal-800 text-xl">
                    {userData.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <h3 className="font-bold text-lg">{userData.fullName}</h3>
              <p className="text-gray-500">@{userData.username}</p>
            </div>

            <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                You can now sign in with your phone number
                <br />
                <span className="font-medium">
                  {userData.countryCode} {userData.phoneNumber}
                </span>
              </p>
            </div>

            <Button onClick={onComplete} className="w-full bg-teal-600 hover:bg-teal-700">
              Continue to Login
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 px-6 pb-6 pt-0">
          <div className="text-center">
            <p className="text-xs text-gray-500">Thank you for joining our community!</p>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
