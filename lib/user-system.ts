"use server"

import type { User, FriendRequest, AuthCredentials } from "./types"
import bcrypt from "bcryptjs"
import crypto from "crypto"

// In-memory storage for demo purposes
const users: User[] = []
const friendRequests: FriendRequest[] = []
const usedNumericIds = new Set<number>()

// Encryption key for sensitive data (in production, use environment variable)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "your-32-character-secret-key-here"

// Encrypt sensitive data like emails
function encrypt(text: string): string {
  const cipher = crypto.createCipher("aes-256-cbc", ENCRYPTION_KEY)
  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")
  return encrypted
}

// Decrypt sensitive data
function decrypt(encryptedText: string): string {
  try {
    const decipher = crypto.createDecipher("aes-256-cbc", ENCRYPTION_KEY)
    let decrypted = decipher.update(encryptedText, "hex", "utf8")
    decrypted += decipher.final("utf8")
    return decrypted
  } catch (error) {
    console.error("Decryption error:", error)
    return encryptedText // Return as-is if decryption fails
  }
}

// Proper password hashing with bcrypt
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12 // High security level
  return await bcrypt.hash(password, saltRounds)
}

// Verify password against hash
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

// Generate a unique 6-digit numeric ID
function generateNumericId(): number {
  let numericId: number
  do {
    numericId = Math.floor(100000 + Math.random() * 900000) // 6-digit number
  } while (usedNumericIds.has(numericId))

  usedNumericIds.add(numericId)
  return numericId
}

// Generate guest session ID
function generateGuestId(): string {
  return `G-${Math.floor(1000 + Math.random() * 9000)}`
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Enhanced password validation
function isValidPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

export async function createUser(
  credentials: AuthCredentials,
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const { email, password } = credentials

    if (!isValidEmail(email)) {
      return { success: false, error: "Please enter a valid email address" }
    }

    if (!isValidPassword(password)) {
      return {
        success: false,
        error: "Password must be at least 8 characters long with uppercase, lowercase, and numbers",
      }
    }

    // Check if email already exists (decrypt existing emails to compare)
    const existingUser = users.find((user) => {
      if (user.email) {
        const decryptedEmail = decrypt(user.email)
        return decryptedEmail === email.toLowerCase()
      }
      return false
    })

    if (existingUser) {
      return { success: false, error: "An account with this email already exists" }
    }

    const numericId = generateNumericId()
    const user: User = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      numericId,
      isGuest: false,
      email: encrypt(email.toLowerCase()), // Encrypt email
      hashedPassword: await hashPassword(password), // Proper password hashing
      isAuthenticated: true,
      createdAt: new Date().toISOString(),
      friends: [],
      blockedUsers: [],
    }

    users.push(user)

    // Return user with decrypted email for display
    const userForReturn = { ...user, email: email.toLowerCase() }
    return { success: true, user: userForReturn }
  } catch (error) {
    console.error("Error creating user:", error)
    return { success: false, error: "Failed to create account" }
  }
}

export async function loginUser(
  credentials: AuthCredentials,
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const { email, password } = credentials

    if (!isValidEmail(email)) {
      return { success: false, error: "Please enter a valid email address" }
    }

    // Find user by decrypting stored emails
    const user = users.find((u) => {
      if (u.email) {
        const decryptedEmail = decrypt(u.email)
        return decryptedEmail === email.toLowerCase()
      }
      return false
    })

    if (!user || !user.hashedPassword) {
      return { success: false, error: "Invalid email or password" }
    }

    // Use proper password verification
    const isValidPassword = await verifyPassword(password, user.hashedPassword)
    if (!isValidPassword) {
      return { success: false, error: "Invalid email or password" }
    }

    // Update authentication status
    user.isAuthenticated = true

    // Return user with decrypted email for display
    const userForReturn = { ...user, email: email.toLowerCase() }
    return { success: true, user: userForReturn }
  } catch (error) {
    console.error("Error logging in user:", error)
    return { success: false, error: "Failed to log in" }
  }
}

export async function createGuestSession(): Promise<User> {
  const guestId = generateGuestId()
  const user: User = {
    id: guestId,
    numericId: 0, // Guests don't get permanent numeric IDs
    isGuest: true,
    sessionId: guestId,
    isAuthenticated: false, // Guests are not authenticated
    createdAt: new Date().toISOString(),
    friends: [],
    blockedUsers: [],
  }

  return user
}

export async function getUserByNumericId(numericId: number): Promise<User | null> {
  return users.find((user) => user.numericId === numericId && !user.isGuest) || null
}

export async function sendFriendRequest(
  fromUserId: string,
  toNumericId: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const fromUser = users.find((u) => u.id === fromUserId)
    const toUser = await getUserByNumericId(toNumericId)

    if (!fromUser || !toUser) {
      return { success: false, error: "User not found" }
    }

    if (fromUser.id === toUser.id) {
      return { success: false, error: "Cannot send friend request to yourself" }
    }

    // Check if request already exists
    const existingRequest = friendRequests.find(
      (req) => req.fromUserId === fromUserId && req.toUserId === toUser.id && req.status === "pending",
    )

    if (existingRequest) {
      return { success: false, error: "Friend request already sent" }
    }

    // Check if already friends
    if (fromUser.friends.includes(toUser.id)) {
      return { success: false, error: "Already friends with this user" }
    }

    const friendRequest: FriendRequest = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      fromUserId,
      toUserId: toUser.id,
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    friendRequests.push(friendRequest)
    return { success: true }
  } catch (error) {
    console.error("Error sending friend request:", error)
    return { success: false, error: "Failed to send friend request" }
  }
}

export async function getFriendRequests(userId: string): Promise<FriendRequest[]> {
  return friendRequests.filter((req) => req.toUserId === userId && req.status === "pending")
}

export async function respondToFriendRequest(
  requestId: string,
  accept: boolean,
): Promise<{ success: boolean; error?: string }> {
  try {
    const request = friendRequests.find((req) => req.id === requestId)
    if (!request) {
      return { success: false, error: "Friend request not found" }
    }

    request.status = accept ? "accepted" : "rejected"

    if (accept) {
      // Add each other as friends
      const fromUser = users.find((u) => u.id === request.fromUserId)
      const toUser = users.find((u) => u.id === request.toUserId)

      if (fromUser && toUser) {
        fromUser.friends.push(toUser.id)
        toUser.friends.push(fromUser.id)
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error responding to friend request:", error)
    return { success: false, error: "Failed to respond to friend request" }
  }
}

export async function getFriends(userId: string): Promise<User[]> {
  const user = users.find((u) => u.id === userId)
  if (!user) return []

  return users.filter((u) => user.friends.includes(u.id))
}
