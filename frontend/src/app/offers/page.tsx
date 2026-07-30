export default function OffersPage() {
  return (
    <div className="py-24 px-4 max-w-5xl mx-auto text-center">
      <h1 className="text-5xl font-serif font-bold gold-text-gradient mb-12">Exclusive Offers</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-8 rounded-2xl border-brand-gold/50">
          <h2 className="text-2xl font-bold mb-4 text-brand-gold">Weekend Special</h2>
          <h3 className="text-5xl font-bold mb-4 text-white">20% OFF</h3>
          <p className="text-gray-400 mb-6">Enjoy a 20% discount on all Signature Chef Dishes this weekend.</p>
          <div className="inline-block bg-white/10 px-4 py-2 rounded-full text-sm">Valid until Sunday</div>
        </div>
        <div className="glass-panel p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4 text-brand-gold">Wine Tasting</h2>
          <h3 className="text-5xl font-bold mb-4 text-white">Complimentary</h3>
          <p className="text-gray-400 mb-6">Free wine tasting experience for reservations of 4 or more guests.</p>
          <div className="inline-block bg-white/10 px-4 py-2 rounded-full text-sm">Valid all month</div>
        </div>
      </div>
    </div>
  )
}
