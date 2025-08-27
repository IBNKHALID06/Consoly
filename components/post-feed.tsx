"use client"

import { useState, useEffect } from "react"
import { PostCard } from "@/components/post-card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, TrendingUp, Filter } from "lucide-react"
import { getPosts } from "@/lib/actions"
import type { Post, User } from "@/lib/types"

const FILTER_TAGS = ["all", "grief", "anxiety", "loneliness", "anger", "hope", "betrayal", "healing", "overwhelmed"]

interface PostFeedProps {
  currentUser: User | null
}

export function PostFeed({ currentUser }: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPosts()
  }, [])

  useEffect(() => {
    filterAndSortPosts()
  }, [posts, selectedFilter, sortBy])

  const loadPosts = async () => {
    try {
      const fetchedPosts = await getPosts()
      setPosts(fetchedPosts)
    } catch (error) {
      console.error("Failed to load posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortPosts = () => {
    let filtered = posts

    if (selectedFilter !== "all") {
      filtered = posts.filter((post) => post.tags.includes(selectedFilter))
    }

    if (sortBy === "popular") {
      filtered = [...filtered].sort((a, b) => b.reactions.length - a.reactions.length)
    } else {
      filtered = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    setFilteredPosts(filtered)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-white/50 dark:bg-slate-900/50 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as "recent" | "popular")}>
          <TabsList>
            <TabsTrigger value="recent" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Recent</span>
            </TabsTrigger>
            <TabsTrigger value="popular" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Popular</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-2">
            {FILTER_TAGS.map((tag) => (
              <Badge
                key={tag}
                variant={selectedFilter === tag ? "default" : "outline"}
                className="cursor-pointer hover:scale-105 transition-all capitalize"
                onClick={() => setSelectedFilter(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">No posts found.</p>
            <p className="text-sm">Be the first to share your feelings.</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={currentUser} onUpdate={loadPosts} />
          ))
        )}
      </div>
    </div>
  )
}
