export default function GalleryPage() {
  return (
    <div className="py-24 px-4 max-w-7xl mx-auto text-center">
      <h1 className="text-5xl font-serif font-bold gold-text-gradient mb-12">Gallery</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80",
          "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
          "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800&q=80"
        ].map((src, i) => (
          <div key={i} className="aspect-square rounded-2xl overflow-hidden glass-panel p-2">
            <img src={src} alt={`Gallery ${i}`} className="w-full h-full object-cover rounded-xl hover:scale-110 transition-transform duration-500" />
          </div>
        ))}
      </div>
    </div>
  )
}
