const About = () => {
  return (
    <div>
      {/* Header */}
      <section 
        className="relative bg-cover bg-center text-white py-20"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&h=500&fit=crop')`,
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">About KAMP</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Karamoja Aid Management Platform — built to end corruption and bring
            transparency to every humanitarian project.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Story</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              The Karamoja region of Uganda has long been one of the most
              underserved areas in East Africa. Despite billions of shillings in
              humanitarian aid flowing into the region over the years, progress
              has been painfully slow. Why? Corruption, mismanagement, and lack
              of accountability.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              KAMP was born from a simple belief: if we make every shilling
              traceable and every project transparent, we can break the cycle of
              wasted resources and empower actual change. Our platform connects
              legitimate NGOs with genuine donors, ensuring that the right people
              are involved and every resource reaches its intended destination.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              We believe that technology, combined with accountability, is the
              key to transforming humanitarian work in Karamoja and beyond.
            </p>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1469169504649-88b996d3dd5f?w=600&h=500&fit=crop"
            alt="Our Story"
            className="rounded-xl shadow-lg"
          />
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Transparency
              </h3>
              <p className="text-gray-600">
                Every transaction, every allocation, every expense — fully
                visible to all stakeholders. No hidden agendas.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Accountability
              </h3>
              <p className="text-gray-600">
                NGOs are held responsible for how they use funds. Donors can
                monitor progress and challenge discrepancies.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="text-4xl mb-4">❤️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Real Impact
              </h3>
              <p className="text-gray-600">
                We focus on results, not paperwork. KAMP ensures that aid
                translates to tangible improvements in people's lives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold">50+</p>
              <p className="text-blue-200 mt-1">Active Projects</p>
            </div>
            <div>
              <p className="text-4xl font-bold">30+</p>
              <p className="text-blue-200 mt-1">Partner NGOs</p>
            </div>
            <div>
              <p className="text-4xl font-bold">$2M+</p>
              <p className="text-blue-200 mt-1">Funds Tracked</p>
            </div>
            <div>
              <p className="text-4xl font-bold">100K+</p>
              <p className="text-blue-200 mt-1">Lives Impacted</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
