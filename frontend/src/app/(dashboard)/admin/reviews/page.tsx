'use client'

import { useState, useEffect } from 'react'
import { Trash2, Star, Loader2, MessageSquare, Quote } from 'lucide-react'

type Review = {
  id: number
  customer_name: string
  rating: number
  comment: string
  created_at: number
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchReviews = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('elaxora_token='))?.split('=')[1]
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/admin/reviews`, {
        headers: { 'ngrok-skip-browser-warning': 'true', 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.data) {
        setReviews(data.data.sort((a: Review, b: Review) => b.created_at - a.created_at))
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    
    const token = document.cookie.split('; ').find(row => row.startsWith('elaxora_token='))?.split('=')[1]
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'ngrok-skip-browser-warning': 'true', 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        setReviews(reviews.filter(r => r.id !== id))
      }
    } catch (error) {
      console.error(error)
    }
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif gold-text-gradient">Customer Reviews</h1>
          <p className="text-gray-400 mt-1">Monitor and manage customer feedback.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold">
            <Star size={32} className="fill-brand-gold" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Average Rating</p>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-bold text-white">{averageRating.toFixed(1)}</h3>
              <span className="text-gray-500 mb-1">/ 5.0</span>
            </div>
          </div>
        </div>
        
        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-blue-400/10 flex items-center justify-center text-blue-400">
            <MessageSquare size={32} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Reviews</p>
            <h3 className="text-3xl font-bold text-white">{reviews.length}</h3>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-gold" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-12 text-center text-gray-500">
            <Quote className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No customer reviews yet.</p>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 group hover:border-brand-gold/30 transition-colors relative">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-lg text-white">{review.customer_name}</h4>
                  <p className="text-xs text-gray-500">
                    {new Date(review.created_at * 1000).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1 text-brand-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < review.rating ? "fill-brand-gold" : "text-gray-700"} />
                  ))}
                </div>
              </div>
              <p className="text-gray-300 italic">"{review.comment}"</p>
              
              <button 
                onClick={() => handleDelete(review.id)}
                className="absolute top-6 right-6 p-2 bg-black/50 border border-white/5 text-gray-500 hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
