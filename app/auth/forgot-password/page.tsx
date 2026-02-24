"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { resetPassword } from "@/actions/auth"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    const formData = new FormData(e.target as HTMLFormElement)

    try {
      const result = await resetPassword(formData)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(result.success || "Check your email for reset instructions.")
      }
    } catch (err) {
      console.log(err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Link href="/auth/signin" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-4">
          <ArrowLeft size={14} />
          Back to Sign In
        </Link>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Reset password
        </h1>
        <p className="text-slate-500 text-sm font-medium leading-relaxed">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
          <input 
            name="email" 
            type="email" 
            required 
            placeholder="name@company.com"
            className="w-full bg-transparent border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900 transition-colors" 
          />
        </div>

        {error && <div className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">{error}</div>}
        {success && <div className="text-[11px] font-bold text-green-500 uppercase tracking-wider">{success}</div>}

        <div className="pt-2">
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-12 bg-slate-900 text-white rounded-lg font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isLoading ? "Please wait..." : "Send Reset Link"}
          </button>
        </div>
      </form>
    </div>
  )
}
