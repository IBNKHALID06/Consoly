"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, Users, Hash, UserCheck, UserX, LogIn, UserMinus, Mail, Lock, Eye, EyeOff } from "lucide-react"
import {
  createUser,
  loginUser,
  createGuestSession,
  sendFriendRequest,
  getFriendRequests,
  respondToFriendRequest,
  getFriends,
} from "@/lib/user-system"
import type { User, FriendRequest, AuthCredentials } from "@/lib/types"

interface UserSystemProps {
  currentUser: User | null
  onUserChange: (user: User | null) => void
}

export function UserSystem({ currentUser, onUserChange }: UserSystemProps) {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [friendIdInput, setFriendIdInput] = useState("")
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [friends, setFriends] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (currentUser && !currentUser.isGuest && currentUser.isAuthenticated) {
      loadFriendRequests()
      loadFriends()
    }
  }, [currentUser])

  const loadFriendRequests = async () => {
    if (!currentUser) return
    try {
      const requests = await getFriendRequests(currentUser.id)
      setFriendRequests(requests)
    } catch (error) {
      console.error("Failed to load friend requests:", error)
    }
  }

  const loadFriends = async () => {
    if (!currentUser) return
    try {
      const userFriends = await getFriends(currentUser.id)
      setFriends(userFriends)
    } catch (error) {
      console.error("Failed to load friends:", error)
    }
  }

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setMessage({ type: "error", text: "Please fill in all fields" })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const credentials: AuthCredentials = { email: email.trim(), password }

      if (authMode === "signup") {
        const result = await createUser(credentials)
        if (result.success && result.user) {
          onUserChange(result.user)
          setMessage({ type: "success", text: `Account created! Your anonymous ID is #${result.user.numericId}` })
          setEmail("")
          setPassword("")
        } else {
          setMessage({ type: "error", text: result.error || "Failed to create account" })
        }
      } else {
        const result = await loginUser(credentials)
        if (result.success && result.user) {
          onUserChange(result.user)
          setMessage({ type: "success", text: `Welcome back! Your ID is #${result.user.numericId}` })
          setEmail("")
          setPassword("")
        } else {
          setMessage({ type: "error", text: result.error || "Failed to log in" })
        }
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestSession = async () => {
    setIsLoading(true)
    try {
      const guestUser = await createGuestSession()
      onUserChange(guestUser)
      setMessage({
        type: "success",
        text: `Guest session started! Note: You can only view posts as a guest. Create an account to post and comment.`,
      })
    } catch (error) {
      setMessage({ type: "error", text: "Failed to create guest session" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendFriendRequest = async () => {
    if (!currentUser || !friendIdInput.trim()) return

    const numericId = Number.parseInt(friendIdInput.trim())
    if (isNaN(numericId)) {
      setMessage({ type: "error", text: "Please enter a valid numeric ID" })
      return
    }

    setIsLoading(true)
    try {
      const result = await sendFriendRequest(currentUser.id, numericId)
      if (result.success) {
        setMessage({ type: "success", text: "Friend request sent!" })
        setFriendIdInput("")
      } else {
        setMessage({ type: "error", text: result.error || "Failed to send friend request" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to send friend request" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFriendRequestResponse = async (requestId: string, accept: boolean) => {
    setIsLoading(true)
    try {
      const result = await respondToFriendRequest(requestId, accept)
      if (result.success) {
        setMessage({ type: "success", text: accept ? "Friend request accepted!" : "Friend request rejected" })
        await loadFriendRequests()
        await loadFriends()
      } else {
        setMessage({ type: "error", text: result.error || "Failed to respond to friend request" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to respond to friend request" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    onUserChange(null)
    setFriendRequests([])
    setFriends([])
    setMessage(null)
    setEmail("")
    setPassword("")
  }

  if (!currentUser) {
    return (
      <Card className="bg-white/50 dark:bg-slate-900/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Hash className="h-5 w-5 text-indigo-600" />
            <span>Anonymous Identity</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Create an anonymous account with email authentication, or browse as a guest.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as "login" | "signup")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      onKeyPress={(e) => e.key === "Enter" && handleAuth()}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={handleAuth}
                  disabled={isLoading || !email.trim() || !password.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  {isLoading ? "Logging in..." : "Log In"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password (min 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      onKeyPress={(e) => e.key === "Enter" && handleAuth()}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={handleAuth}
                  disabled={isLoading || !email.trim() || !password.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {isLoading ? "Creating account..." : "Create Anonymous Account"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button onClick={handleGuestSession} disabled={isLoading} variant="outline" className="w-full">
            <LogIn className="h-4 w-4 mr-2" />
            Browse as Guest (View Only)
          </Button>

          {message && (
            <Alert
              className={
                message.type === "error"
                  ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
                  : "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
              }
            >
              <AlertDescription
                className={
                  message.type === "error" ? "text-red-800 dark:text-red-200" : "text-green-800 dark:text-green-200"
                }
              >
                {message.text}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Info */}
      <Card className="bg-white/50 dark:bg-slate-900/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Hash className="h-5 w-5 text-indigo-600" />
              <span>{currentUser.isGuest ? `Guest ${currentUser.sessionId}` : `User #${currentUser.numericId}`}</span>
              {currentUser.isAuthenticated && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                >
                  Authenticated
                </Badge>
              )}
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <UserMinus className="h-4 w-4 mr-2" />
              {currentUser.isGuest ? "End Session" : "Logout"}
            </Button>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {currentUser.isGuest
              ? "Guest mode - You can view posts but cannot post or comment. Create an account for full access."
              : `Your authenticated anonymous account. You can post, comment, and connect with others.`}
          </p>
        </CardHeader>
      </Card>

      {/* Friend System - Only for authenticated users */}
      {!currentUser.isGuest && currentUser.isAuthenticated && (
        <>
          {/* Add Friend */}
          <Card className="bg-white/50 dark:bg-slate-900/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-indigo-600" />
                <span>Connect with Others</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter user ID (e.g., 326524)"
                  value={friendIdInput}
                  onChange={(e) => setFriendIdInput(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSendFriendRequest} disabled={isLoading || !friendIdInput.trim()}>
                  Send Request
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Friend Requests */}
          {friendRequests.length > 0 && (
            <Card className="bg-white/50 dark:bg-slate-900/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  <span>Friend Requests</span>
                  <Badge variant="secondary">{friendRequests.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {friendRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm">User #{request.fromUserId} wants to connect</span>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleFriendRequestResponse(request.id, true)}
                        disabled={isLoading}
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFriendRequestResponse(request.id, false)}
                        disabled={isLoading}
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Friends List */}
          {friends.length > 0 && (
            <Card className="bg-white/50 dark:bg-slate-900/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  <span>Your Connections</span>
                  <Badge variant="secondary">{friends.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {friends.map((friend) => (
                    <div key={friend.id} className="flex items-center space-x-2 p-2 border rounded">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">User #{friend.numericId}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {message && (
        <Alert
          className={
            message.type === "error"
              ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
              : "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
          }
        >
          <AlertDescription
            className={
              message.type === "error" ? "text-red-800 dark:text-red-200" : "text-green-800 dark:text-green-200"
            }
          >
            {message.text}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
