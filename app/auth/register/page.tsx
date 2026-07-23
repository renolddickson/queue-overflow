"use client"

import { useState, useEffect } from "react"
import { Github, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { signInWithGithub, signInWithGoogle, signUp, checkUsernameAvailability } from "@/actions/auth"
import Link from "next/link"
import { z } from "zod"

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

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [username, setUsername] = useState("")
  const [usernameLoading, setUsernameLoading] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState(false)
  const router = useRouter()

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
      const { data, error } = await checkUsernameAvailability(name)
      if (error) {
        setUsernameAvailable(false)
      } else {
        setUsernameAvailable(data?.length === 0)
      }
    } catch (err) {
      console.log(err)
      setUsernameAvailable(false)
    }
    setUsernameLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    const formData = new FormData(e.target as HTMLFormElement)

    try {
      signUpSchema.parse(Object.fromEntries(formData.entries()))
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message)
        setIsLoading(false)
        return
      }
    }

    try {
      const result = await signUp(formData)
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
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Create account
        </h1>
        <p className="text-slate-500 text-sm font-medium leading-relaxed">
          Enter your information to start your 14-day free trial.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">First Name</label>
            <input name="firstname" type="text" required className="w-full bg-transparent border-b border-slate-200 py-1.5 text-sm outline-none focus:border-slate-900 transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last Name</label>
            <input name="lastname" type="text" required className="w-full bg-transparent border-b border-slate-200 py-1.5 text-sm outline-none focus:border-slate-900 transition-colors" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Username</label>
          <div className="relative">
            <input 
              name="username" 
              type="text" 
              required 
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-transparent border-b border-slate-200 py-1.5 pl-4 text-sm outline-none focus:border-slate-900 transition-colors" 
            />
            <span className="absolute left-0 bottom-1.5 text-slate-400">@</span>
            <div className="absolute right-0 bottom-1.5">
              {usernameLoading ? (
                <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              ) : username && (
                usernameAvailable ? <Check size={14} className="text-green-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              )}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
          <input name="email" type="email" required className="w-full bg-transparent border-b border-slate-200 py-1.5 text-sm outline-none focus:border-slate-900 transition-colors" />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</label>
          <input 
            name="password" 
            type="password" 
            required 
            className="w-full bg-transparent border-b border-slate-200 py-1.5 text-sm outline-none focus:border-slate-900 transition-colors" 
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confirm Password</label>
          <input name="confirmPassword" type="password" required className="w-full bg-transparent border-b border-slate-200 py-1.5 text-sm outline-none focus:border-slate-900 transition-colors" />
        </div>

        {error && <div className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">{error}</div>}
        {success && <div className="text-[11px] font-bold text-green-500 uppercase tracking-wider">{success}</div>}

        <div className="pt-2">
          <button 
            type="submit" 
            disabled={isLoading || !usernameAvailable}
            className="w-full h-11 bg-slate-900 text-white rounded-lg font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isLoading ? "Please wait..." : "Create Account"}
          </button>
        </div>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100" /></div>
        <div className="relative flex justify-center text-[10px] font-black tracking-widest text-slate-400 uppercase"><span className="bg-white px-4">Or continue with</span></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button 
          type="button" 
          onClick={() => signInWithGithub()}
          className="h-11 flex items-center justify-center gap-3 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
        >
          <Github size={18} />
          GitHub
        </button>
        <button 
          type="button" 
          onClick={() => signInWithGoogle()}
          className="h-11 flex items-center justify-center gap-3 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </button>
      </div>

      <p className="text-center text-sm text-slate-500 font-medium">
        Already have an account?{" "}
        <Link href="/auth/signin" className="text-slate-900 font-bold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
