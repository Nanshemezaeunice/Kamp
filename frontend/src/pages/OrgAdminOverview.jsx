import { useOutletContext } from "react-router-dom";
import { Mail, Phone, Globe, MapPin, Calendar, Users, FileText, Target, Building2 } from "lucide-react";

const OrgAdminOverview = () => {
  const { organization } = useOutletContext();

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
            <InfoCard icon={Building2} label="Organization Name" value={organization.userId?.name} />
            <InfoCard icon={Mail} label="Email" value={organization.userId?.email} />
            <InfoCard icon={Phone} label="Phone" value={organization.phone} />
            <InfoCard icon={Globe} label="Website" value={organization.website} />
            <InfoCard icon={MapPin} label="Address" value={organization.address} />
            <InfoCard icon={FileText} label="Registration Number" value={organization.registrationNumber} />
            <InfoCard icon={Calendar} label="Year Founded" value={organization.foundingYear} />
            <InfoCard icon={Users} label="Team Size" value={organization.teamSize} />
          </div>
        </div>
      </div>

      {/* Category & Status */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Category & Status</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Category</p>
              <p className="text-sm font-medium text-blue-700">{organization.category}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Account Status</p>
              <p className={`text-sm font-medium ${
                organization.setupStatus === "verified" 
                  ? "text-green-700"
                  : organization.setupStatus === "banned"
                  ? "text-red-700"
                  : organization.setupStatus === "suspended"
                  ? "text-orange-700"
                  : "text-yellow-700"
              }`}>
                {organization.setupStatus.replace("_", " ").toUpperCase()}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Registered On</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(organization.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Last Updated</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(organization.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Mission */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">About the Organization</h2>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-gray-500" />
              <h3 className="font-medium text-gray-900">Description</h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed pl-7">
              {organization.description || "No description provided"}
            </p>
          </div>
          
          {organization.missionStatement && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-gray-500" />
                <h3 className="font-medium text-gray-900">Mission Statement</h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed pl-7">
                {organization.missionStatement}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Areas & Projects */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Operations & Experience</h2>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Areas of Operation</h3>
            <div className="flex flex-wrap gap-2">
              {organization.areasOfOperation && organization.areasOfOperation.length > 0 ? (
                organization.areasOfOperation.map((area, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    {area}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">No areas specified</p>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Previous Projects</h3>
            <div className="flex flex-wrap gap-2">
              {organization.previousProjects && organization.previousProjects.length > 0 ? (
                organization.previousProjects.map((project, idx) => (
                  <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                    {project}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">No previous projects listed</p>
              )}
            </div>
          </div>

          {organization.actionReason && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-medium text-red-900 mb-2">Action Reason</h3>
              <p className="text-sm text-red-700">{organization.actionReason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrgAdminOverview;
