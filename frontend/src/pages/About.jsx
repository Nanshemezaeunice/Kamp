import { useState, useEffect } from "react";
import { api } from "../config";
import { Eye, Handshake, Heart } from "lucide-react";

const About = () => {
  const [stats, setStats] = useState({
    activeProjects: 0,
    partnerOrgs: 0,
    fundsTracked: 0,
    // livesImpacted removed per request
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(api("/api/stats/about"));
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };
    fetchStats();
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M+`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K+`;
    return `$${num.toLocaleString()}`;
  };

  const formatCount = (num) => {
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K+`;
    return num.toString();
  };

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

      {/* How The Platform Works - explicit summary */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">How the Platform Works</h2>
          <p className="mb-2">
            Organisations and advocates can register on KAMP, create projects, and receive donations.
            Organisations can monitor their projects in detail, tracking milestones, performance, and funds over time.
          </p>
          <p>
            Unauthenticated users can view projects and donate, but cannot register or create projects. To publish or manage projects you must be a verified organisation or advocate on the platform.
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
              legitimate organisations with genuine donors, ensuring that the right people
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
                <div className="mb-4 flex items-center justify-center">
                  <Eye className="w-12 h-12 text-blue-600" />
                </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Transparency
              </h3>
              <p className="text-gray-600">
                Every transaction, every allocation, every expense — fully
                visible to all stakeholders. No hidden agendas.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="mb-4 flex items-center justify-center">
                <Handshake className="w-12 h-12 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Accountability
              </h3>
              <p className="text-gray-600">
                Organisations are held responsible for how they use funds. Donors can
                monitor progress and challenge discrepancies.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="mb-4 flex items-center justify-center">
                <Heart className="w-12 h-12 text-rose-600" />
              </div>
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold">{formatCount(stats.activeProjects)}</p>
              <p className="text-blue-200 mt-1">Active Projects</p>
            </div>
            <div>
              <p className="text-4xl font-bold">{formatCount(stats.partnerOrgs)}</p>
              <p className="text-blue-200 mt-1">Partner Organisations</p>
            </div>
            <div>
              <p className="text-4xl font-bold">{formatNumber(stats.fundsTracked)}</p>
              <p className="text-blue-200 mt-1">Funds Tracked</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
