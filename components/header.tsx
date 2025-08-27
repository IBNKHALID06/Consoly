"use client"

import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Heart, Shield, Users, Phone, ExternalLink, BookOpen, AlertTriangle, Menu } from "lucide-react"

export function Header() {
  const [communityOpen, setCommunityOpen] = useState(false)
  const [safetyOpen, setSafetyOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Community Guidelines Content Component
  const CommunityContent = () => (
    <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Our Community Values</h3>
        <div className="grid gap-4">
          <div className="flex items-start space-x-3">
            <Heart className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium">Empathy & Support</h4>
              <p className="text-sm text-muted-foreground">
                We're here to listen and support each other through difficult times.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium">Respect & Privacy</h4>
              <p className="text-sm text-muted-foreground">
                Everyone deserves to feel safe and respected in this space.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <BookOpen className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium">Authentic Expression</h4>
              <p className="text-sm text-muted-foreground">Share your genuine feelings without fear of judgment.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Community Rules</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start space-x-2">
            <span className="font-medium text-indigo-600 flex-shrink-0">1.</span>
            <span>Be kind and supportive to others sharing their experiences</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium text-indigo-600 flex-shrink-0">2.</span>
            <span>No harassment, bullying, or discriminatory language</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium text-indigo-600 flex-shrink-0">3.</span>
            <span>Respect others' privacy and anonymity</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium text-indigo-600 flex-shrink-0">4.</span>
            <span>No spam, self-promotion, or off-topic content</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium text-indigo-600 flex-shrink-0">5.</span>
            <span>Use content warnings for sensitive topics</span>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-950 p-4 rounded-lg">
        <p className="text-sm text-indigo-800 dark:text-indigo-200">
          <strong>Remember:</strong> This is a healing space. Your words have power to help or hurt. Choose kindness,
          and help us maintain a supportive environment for everyone.
        </p>
      </div>
    </div>
  )

  // Safety Resources Content Component
  const SafetyContent = () => (
    <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto">
      <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <h3 className="font-semibold text-red-800 dark:text-red-200">Crisis Support</h3>
            <p className="text-sm text-red-700 dark:text-red-300">
              If you're having thoughts of self-harm or suicide, please reach out for help immediately.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Emergency Resources</h3>
        <div className="grid gap-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div>
                <h4 className="font-medium">988 Suicide & Crisis Lifeline</h4>
                <p className="text-sm text-muted-foreground">24/7 crisis support</p>
              </div>
            </div>
            <Button size="sm" asChild>
              <a href="tel:988" className="flex items-center space-x-1">
                <span>Call</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Crisis Text Line</h4>
                <p className="text-sm text-muted-foreground">Text HOME to 741741</p>
              </div>
            </div>
            <Button size="sm" variant="outline" asChild>
              <a href="sms:741741?body=HOME" className="flex items-center space-x-1">
                <span>Text</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <ExternalLink className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <h4 className="font-medium">National Alliance on Mental Illness</h4>
                <p className="text-sm text-muted-foreground">Mental health resources and support</p>
              </div>
            </div>
            <Button size="sm" variant="outline" asChild>
              <a
                href="https://nami.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1"
              >
                <span>Visit</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Platform Safety</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start space-x-2">
            <span className="font-medium text-green-600 flex-shrink-0">•</span>
            <span>All posts are monitored by AI for harmful content</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium text-green-600 flex-shrink-0">•</span>
            <span>Report any concerning posts using the report button</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium text-green-600 flex-shrink-0">•</span>
            <span>Your identity remains anonymous with numeric IDs</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium text-green-600 flex-shrink-0">•</span>
            <span>Block users who make you uncomfortable</span>
          </div>
        </div>
      </div>

      <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
        <p className="text-sm text-green-800 dark:text-green-200">
          <strong>You are not alone.</strong> If you're struggling, please reach out for professional help. This
          platform is for support, but it's not a substitute for professional mental health care.
        </p>
      </div>
    </div>
  )

  return (
    <>
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-indigo-600" />
            <span className="font-semibold text-lg">Consoly</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Dialog open={communityOpen} onOpenChange={setCommunityOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                  onClick={() => setCommunityOpen(true)}
                >
                  <Users className="h-4 w-4" />
                  <span>Community</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-indigo-600" />
                    <span>Community Guidelines</span>
                  </DialogTitle>
                </DialogHeader>
                <CommunityContent />
              </DialogContent>
            </Dialog>

            <Dialog open={safetyOpen} onOpenChange={setSafetyOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 hover:bg-green-50 dark:hover:bg-green-950"
                  onClick={() => setSafetyOpen(true)}
                >
                  <Shield className="h-4 w-4" />
                  <span>Safety</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span>Safety & Crisis Resources</span>
                  </DialogTitle>
                </DialogHeader>
                <SafetyContent />
              </DialogContent>
            </Dialog>
          </nav>

          {/* Mobile Navigation */}
          <div className="flex items-center space-x-2">
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(true)}>
                    <Menu className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="flex items-center space-x-2">
                      <Heart className="h-5 w-5 text-indigo-600" />
                      <span>Consoly Menu</span>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Community Guidelines
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] max-h-[90vh]">
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2">
                            <Users className="h-5 w-5 text-indigo-600" />
                            <span>Community Guidelines</span>
                          </DialogTitle>
                        </DialogHeader>
                        <CommunityContent />
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Safety & Crisis Resources
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] max-h-[90vh]">
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2">
                            <Shield className="h-5 w-5 text-green-600" />
                            <span>Safety & Crisis Resources</span>
                          </DialogTitle>
                        </DialogHeader>
                        <SafetyContent />
                      </DialogContent>
                    </Dialog>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>
    </>
  )
}
