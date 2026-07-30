'use client'

import { useReservationStore } from '@/store/reservationStore'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const customerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  company: z.string().optional(),
})

type CustomerFormValues = z.infer<typeof customerSchema>

export default function Step6Customer() {
  const { data, updateData, setStep } = useReservationStore()

  const { register, handleSubmit, formState: { errors } } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: data.customer
  })

  const onSubmit = (values: CustomerFormValues) => {
    updateData({ customer: values })
    setStep(7)
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 font-serif tracking-wide gold-text-gradient">Customer Information</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl mx-auto mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
          <input 
            {...register('name')}
            className={`w-full bg-transparent border ${errors.name ? 'border-red-500' : 'border-gray-600 focus:border-brand-gold'} rounded-lg px-4 py-3 text-white outline-none transition-colors`}
            placeholder="John Doe"
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number *</label>
            <input 
              {...register('phone')}
              className={`w-full bg-transparent border ${errors.phone ? 'border-red-500' : 'border-gray-600 focus:border-brand-gold'} rounded-lg px-4 py-3 text-white outline-none transition-colors`}
              placeholder="+1 (555) 000-0000"
            />
            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
            <input 
              {...register('email')}
              className={`w-full bg-transparent border ${errors.email ? 'border-red-500' : 'border-gray-600 focus:border-brand-gold'} rounded-lg px-4 py-3 text-white outline-none transition-colors`}
              placeholder="john@example.com"
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Company Name (Optional)</label>
          <input 
            {...register('company')}
            className="w-full bg-transparent border border-gray-600 focus:border-brand-gold rounded-lg px-4 py-3 text-white outline-none transition-colors"
            placeholder="Acme Corp"
          />
        </div>

        <div className="flex justify-between pt-6">
          <button 
            type="button"
            onClick={() => {
              // We optionally can save partial data on back if we wanted to
              setStep(5)
            }} 
            className="bg-transparent border border-gray-600 hover:border-white text-white font-bold py-3 px-8 rounded-full transition-colors"
          >
            Back
          </button>
          <button 
            type="submit"
            className="bg-brand-gold hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-full transition-colors"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  )
}
