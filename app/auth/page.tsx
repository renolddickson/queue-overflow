"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { AudioWaveform, Lock, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { checkUsernameAvailability, signIn, signUp } from "@/actions/auth"
import { Input } from "@/components/ui/input"
import { z } from "zod"

// Define Zod schema for sign up form validation
const signUpSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [username, setUsername] = useState("")
  const [usernameLoading, setUsernameLoading] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState(false)
  const router = useRouter()

  // Debounced check for username availability
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameAvailable(false)
      return
    }

    const timer = setTimeout(() => {
      checkUsername(username)
    }, 500)

    return () => clearTimeout(timer)
  }, [username])

  async function checkUsername(name: string) {
    setUsernameLoading(true)
    try {
      const { data,error } = await checkUsernameAvailability(name)
      if (error) {
        setUsernameAvailable(false)
      } else {
        // If no record found, username is available
        setUsernameAvailable(data?.length === 0)
      }
    } catch (err) {
      console.log(err)
      setUsernameAvailable(false)
    }
    setUsernameLoading(false)
  }

  // Handle form submission with optional Zod validation for sign up
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (e: React.FormEvent, action: any) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    const formData = new FormData(e.target as HTMLFormElement)

    // If this is a signUp submission, validate the data using Zod
    if (action === signUp) {
      try {
        signUpSchema.parse(Object.fromEntries(formData.entries()))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (err instanceof z.ZodError) {
          setError(err.errors[0].message)
          setIsLoading(false)
          return
        }
      }
    }

    try {
      const result = await action(formData)
      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        setSuccess(result.success)
        router.push("/")
      }
    } catch (err) {
      console.log(err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <AudioWaveform className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Authenticate Queue</h1>
          <p className="text-muted-foreground">
            Sign in or create an account to access documentation
          </p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <form onSubmit={(e) => handleSubmit(e, signIn)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="name@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <a href="#" className="text-xs text-primary hover:underline">
                        Forgot password?
                      </a>
                    </div>
                    <Input id="password" name="password" type="password" required />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <label htmlFor="remember" className="text-sm font-medium leading-none">
                      Remember me
                    </label>
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span className="ml-2">Signing in...</span>
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Register to access documentation and resources
                </CardDescription>
              </CardHeader>
              <form onSubmit={(e) => handleSubmit(e, signUp)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        required
                        onChange={(e) => setUsername(e.target.value)}
                      />
                      {usernameLoading && (
                        <div className="absolute inset-y-0 right-2 flex items-center">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                      )}
                      {(!usernameLoading && username && usernameAvailable) && (
                        <div className="absolute inset-y-0 right-2 flex items-center">
                          <Check className="h-5 w-5 text-green-500" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="name@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" required />
                    <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" required />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" required />
                    <label htmlFor="terms" className="text-sm font-medium">
                      I agree to the{" "}
                      <a href="#" className="text-primary hover:underline">
                        terms of service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-primary hover:underline">
                        privacy policy
                      </a>
                    </label>
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  {success && <p className="text-sm text-green-500">{success}</p>}
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading || !usernameAvailable}>
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span className="ml-2">Creating account...</span>
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex items-center justify-center">
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Your information is securely encrypted</span>
          </div>
        </div>
      </div>
    </div>
  )
}
