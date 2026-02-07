import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section 
        className="relative bg-cover bg-center text-white py-40"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&h=600&fit=crop')`,
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
            Empowering Karamoja <br /> Through Transparent Aid
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto mb-10">
            KAMP connects NGOs, donors, and communities to fight corruption and
            ensure every resource reaches the people of Karamoja. Track projects,
            manage funds, and make a real difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/get-started"
              className="bg-white text-blue-700 px-8 py-3 rounded-lg font-bold text-lg hover:bg-blue-50 transition"
            >
              Get Started
            </Link>
            <Link
              to="/projects"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-700 transition"
            >
              View Projects
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            How KAMP Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-xl overflow-hidden bg-gray-50 shadow-lg hover:shadow-xl transition">
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop"
                alt="NGOs Create Projects"
                className="w-full h-48 object-cover"
              />
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  NGOs Create Projects
                </h3>
                <p className="text-gray-600">
                  Verified NGOs create and publish projects that address real needs
                  in the Karamoja region.
                </p>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden bg-gray-50 shadow-lg hover:shadow-xl transition">
              <img 
                src="https://images.unsplash.com/photo-1469169504649-88b996d3dd5f?w=500&h=300&fit=crop"
                alt="Donors Fund Projects"
                className="w-full h-48 object-cover"
              />
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Donors Fund Projects
                </h3>
                <p className="text-gray-600">
                  Individuals and organizations donate directly to projects they
                  believe in, with full transparency.
                </p>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden bg-gray-50 shadow-lg hover:shadow-xl transition">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop"
                alt="Track Every Shilling"
                className="w-full h-48 object-cover"
              />
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Track Every Shilling
                </h3>
                <p className="text-gray-600">
                  Every transaction is tracked and visible. NGOs manage funds while
                  donors monitor spending in real time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Our Mission
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Corruption, mismanagement, and misuse of funds have plagued
            humanitarian efforts in Karamoja for too long. KAMP exists to
            change that — by creating a platform where every project is
            accountable, every donation is traceable, and every stakeholder has
            visibility into the impact being made.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            Whether you're an NGO looking to create impact or an individual
            wanting to donate, KAMP is your platform for transparent aid.
          </p>
          <Link
            to="/get-started"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition inline-block"
          >
            Join KAMP Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
