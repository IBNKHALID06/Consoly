"use client"

import { useState } from "react"
import { PostFeed } from "@/components/post-feed"
import { CreatePost } from "@/components/create-post"
import { UserSystem } from "@/components/user-system"
import { RefinedConsolyBot } from "@/components/refined-consoly-bot"
import { Header } from "@/components/header"
import { SafetyBanner } from "@/components/safety-banner"
import type { User } from "@/lib/types"

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handlePostCreated = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      <SafetyBanner />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Consoly
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A safe space to express your emotions anonymously. Connect with others through numeric IDs while
              maintaining your privacy. Chat with ConsolyBot for immediate support.
            </p>
          </div>

          <UserSystem currentUser={currentUser} onUserChange={setCurrentUser} />
          <CreatePost currentUser={currentUser} onPostCreated={handlePostCreated} />
          <PostFeed key={refreshKey} currentUser={currentUser} />
        </div>
      </main>

      {/* ConsolyBot - Available to all users */}
      <RefinedConsolyBot currentUser={currentUser} />
    </div>
  )
}
