"use client"

import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Phone, X, ExternalLink } from "lucide-react"

export function SafetyBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <Alert className="mx-4 mt-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
      <Phone className="h-4 w-4 text-red-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <strong>Crisis Support:</strong> If you're in immediate danger, please contact emergency services or call{" "}
          <Button variant="link" className="p-0 h-auto text-red-600 font-semibold" asChild>
            <a href="tel:988" className="flex items-center space-x-1">
              <span>988 Suicide & Crisis Lifeline</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)} className="ml-4">
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  )
}
