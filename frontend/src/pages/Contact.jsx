// Simple contact page with our location, working hours and email address.
// No form submission yet — links directly to email for now.
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const Contact = () => {
  return (
    <div>
      {/* Header */}
      <section 
        className="relative bg-cover bg-center text-white py-20"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=500&fit=crop')`,
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Have questions, suggestions, or want to partner with us? We'd love
            to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          {/* Contact Info */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Get in Touch
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Reach out to us through any of the channels below. We&apos;re always happy to connect.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-md transition">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-7 h-7 text-blue-600" />
                </div>
              <h3 className="font-bold text-gray-800 mb-2 text-lg">Email</h3>
              <p className="text-gray-600">info@kamp.org</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-md transition">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-7 h-7 text-green-600" />
                </div>
              <h3 className="font-bold text-gray-800 mb-2 text-lg">Phone</h3>
              <p className="text-gray-600">+256 700 000 000</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-md transition">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-7 h-7 text-purple-600" />
                </div>
              <h3 className="font-bold text-gray-800 mb-2 text-lg">Address</h3>
              <p className="text-gray-600">
                Moroto Town, Karamoja Region
                <br />
                Uganda, East Africa
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-md transition">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-7 h-7 text-amber-600" />
                </div>
              <h3 className="font-bold text-gray-800 mb-2 text-lg">
                Office Hours
              </h3>
              <p className="text-gray-600">
                Monday – Friday: 8:00 AM – 5:00 PM (EAT)
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
