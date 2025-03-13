"use client"

import type React from "react"

import { useState } from "react"
import { redirect, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Star } from "lucide-react"
import Confetti from "react-confetti"
import { useWindowSize } from "react-use"
import { submitData } from "@/actions/document"

export default function FeedbackForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [showDialog, setShowDialog] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const { width, height } = useWindowSize()

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault()
    try{
      await submitData('feedback',{name,message,rating})
      setShowDialog(true)
      setShowConfetti(true)
      setTimeout(() => {
        setShowConfetti(false)
      }, 5000)
    }
    catch(err){
      console.log(err)
      redirect('/')
    }
  }

  const handleClose = () => {
    setShowDialog(false)
    router.push("/")
  }

  return (
    <div className="mx-auto p-4 sm:p-6 w-full sm:w-3/4 lg:w-1/2">
      <h1 className="text-2xl font-bold mb-6">Share Your Feedback</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Your feedback"
            required
            className="min-h-[120px]"
          />
        </div>

        <div className="space-y-2">
          <Label>Rating</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoverRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={!name || !message || rating === 0}>
          Submit Feedback
        </Button>
      </form>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        {showConfetti && <Confetti width={width} height={height} recycle={false} />}
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Thank you for your feedback!</DialogTitle>
            <DialogDescription className="text-center">
              We appreciate you for sharing your thoughts with us.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button onClick={handleClose}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

