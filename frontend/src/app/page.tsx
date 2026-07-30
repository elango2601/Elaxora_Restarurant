import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1600&q=80" 
            alt="Restaurant Interior"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0c]/80 via-[#0a0a0c]/50 to-[#0a0a0c]"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl px-4 mt-[-10vh]">
          <h1 className="text-6xl md:text-8xl font-serif font-bold gold-text-gradient mb-6 tracking-wide drop-shadow-2xl">ELAXORA</h1>
          <p className="text-xl md:text-2xl text-gray-300 font-light tracking-widest uppercase mb-10">A Symphony of Taste and Refinement</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/reservations" className="bg-brand-gold hover:bg-yellow-600 text-black font-bold py-4 px-10 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)]">
              Reserve a Table
            </Link>
            <Link href="/menu" className="bg-transparent border border-white hover:bg-white hover:text-black text-white font-bold py-4 px-10 rounded-full transition-all duration-300">
              View Menu
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl glass-panel p-2">
            <img 
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80" 
              alt="Culinary Art" 
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold gold-text-gradient mb-6">Our Story</h2>
            <p className="text-xl text-gray-300 mb-6 font-light leading-relaxed">
              Founded in 1998, Elaxora has been serving exquisite culinary creations to our beloved guests in Coimbatore.
            </p>
            <p className="text-gray-400 mb-10 leading-relaxed">
              We believe that dining is not just about food, but an experience. Our master chefs craft each dish with passion, using only the freshest, locally sourced ingredients. Whether it's a romantic dinner or a family celebration, we ensure every moment is memorable.
            </p>
            <Link href="/about" className="text-brand-gold hover:text-white uppercase tracking-widest font-semibold text-sm transition-colors flex items-center gap-2">
              Discover More <span className="text-xl">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Section placeholder */}
      <section className="py-24 bg-[#050507]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-serif font-bold text-white mb-16">Chef's Signatures</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-panel p-6 rounded-2xl text-left hover:-translate-y-2 transition-transform duration-300">
                <div className="h-48 bg-gray-800 rounded-xl mb-6 animate-pulse"></div>
                <h3 className="text-xl font-bold mb-2">Signature Dish {i}</h3>
                <p className="text-gray-400 text-sm mb-4">Exquisite blend of seasonal truffles and aged balsamic.</p>
                <div className="flex justify-between items-center">
                  <span className="text-brand-gold font-bold">₹1250</span>
                  <Link href="/menu" className="text-xs uppercase tracking-wider border border-gray-600 px-4 py-2 rounded-full hover:border-brand-gold transition-colors">
                    Order
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <Link href="/menu" className="text-gray-400 hover:text-brand-gold transition-colors underline-offset-4 hover:underline">
              View Full Menu
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
