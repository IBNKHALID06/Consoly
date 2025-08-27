"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, Tag, Lock } from "lucide-react"
import { createPost } from "@/lib/actions"
import type { User } from "@/lib/types"

const EMOTION_TAGS = [
  { name: "grief", color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200" },
  { name: "anxiety", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  { name: "loneliness", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { name: "anger", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  { name: "hope", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { name: "betrayal", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  { name: "healing", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" },
  { name: "overwhelmed", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
]

interface CreatePostProps {
  currentUser: User | null
  onPostCreated: () => void
}

export function CreatePost({ currentUser, onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canPost = currentUser && !currentUser.isGuest && currentUser.isAuthenticated

  const handleTagToggle = (tagName: string) => {
    setSelectedTags((prev) => (prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]))
  }

  const handleSubmit = async () => {
    if (!content.trim() || !canPost) return

    setIsSubmitting(true)
    try {
      const result = await createPost(content, selectedTags, currentUser.id)
      if (result.success) {
        setContent("")
        setSelectedTags([])
        onPostCreated()
      } else {
        console.error("Failed to create post:", result.error)
      }
    } catch (error) {
      console.error("Failed to create post:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!canPost) {
    return (
      <Card className="border-2 border-dashed border-gray-200 dark:border-gray-800 bg-white/30 dark:bg-slate-900/30">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-muted-foreground">
            <Lock className="h-5 w-5" />
            <span className="text-lg font-medium">
              {currentUser?.isGuest ? "Create an account to share your feelings" : "Log in to share your feelings"}
            </span>
          </div>
          <p className="text-muted-foreground">
            {currentUser?.isGuest
              ? "Guest accounts can view posts but cannot create them. Create an authenticated anonymous account to participate."
              : "Create an authenticated anonymous account to share your thoughts and connect with others."}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-dashed border-indigo-200 dark:border-indigo-800 bg-white/50 dark:bg-slate-900/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Tag className="h-5 w-5 text-indigo-600" />
          <span>Share Your Feelings</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Posting as User #{currentUser.numericId} (authenticated anonymously)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="What's on your heart today? Share as much or as little as you'd like..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[120px] resize-none border-indigo-200 dark:border-indigo-800 focus:border-indigo-400 dark:focus:border-indigo-600"
          maxLength={1000}
        />

        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Tag your emotions (optional):</p>
          <div className="flex flex-wrap gap-2">
            {EMOTION_TAGS.map((tag) => (
              <Badge
                key={tag.name}
                variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                className={`cursor-pointer transition-all hover:scale-105 ${
                  selectedTags.includes(tag.name) ? tag.color : ""
                }`}
                onClick={() => handleTagToggle(tag.name)}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{content.length}/1000 characters</span>
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "Sharing..." : "Share Anonymously"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
