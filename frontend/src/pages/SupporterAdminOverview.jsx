import { useOutletContext } from "react-router-dom";
import { Mail, Phone, MapPin, Calendar, Briefcase, FileText, Heart } from "lucide-react";

const SupporterAdminOverview = () => {
  const { supporter } = useOutletContext();

  const InfoCard = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-sm font-medium text-gray-900 break-words">{value || "Not provided"}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard icon={Heart} label="Full Name" value={supporter.userId?.name} />
            <InfoCard icon={Mail} label="Email" value={supporter.userId?.email} />
            <InfoCard icon={Phone} label="Phone" value={supporter.phone} />
            <InfoCard icon={MapPin} label="Location" value={supporter.location} />
            <InfoCard icon={Briefcase} label="Occupation" value={supporter.occupation} />
            <InfoCard icon={FileText} label="Primary Interest" value={supporter.interest} />
          </div>
        </div>
      </div>

      {/* Account Status */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Account Status</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Current Status</p>
              <p className={`text-sm font-medium ${
                supporter.setupStatus === "verified" 
                  ? "text-green-700"
                  : supporter.setupStatus === "banned"
                  ? "text-red-700"
                  : supporter.setupStatus === "suspended"
                  ? "text-orange-700"
                  : "text-yellow-700"
              }`}>
                {supporter.setupStatus.replace("_", " ").toUpperCase()}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Registered On</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(supporter.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Last Updated</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(supporter.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      {supporter.bio && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">About</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-700 leading-relaxed">
              {supporter.bio}
            </p>
          </div>
        </div>
      )}

      {/* Areas of Interest */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Areas of Interest</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            {supporter.areasOfInterest && supporter.areasOfInterest.length > 0 ? (
              supporter.areasOfInterest.map((area, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                  {area}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-500">No areas specified</p>
            )}
          </div>
        </div>
      </div>

      {/* How They Heard About KAMP */}
      {supporter.howHeard && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">How They Heard About KAMP</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-700">{supporter.howHeard}</p>
          </div>
        </div>
      )}

      {/* Action Reason (if banned/suspended) */}
      {supporter.actionReason && (
        <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-200 bg-red-50">
            <h2 className="text-lg font-semibold text-red-900">Restriction Reason</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-red-700">{supporter.actionReason}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupporterAdminOverview;
