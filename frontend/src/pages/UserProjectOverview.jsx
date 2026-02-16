import { useOutletContext } from "react-router-dom";
import { Calendar, DollarSign, Users, MapPin, Target, TrendingUp, Mail, Phone, Globe } from "lucide-react";

const UserProjectOverview = () => {
  const { project } = useOutletContext();

  if (!project) return null;

  const progress = project.goal > 0 
    ? Math.round((project.raised / project.goal) * 100) 
    : 0;

  const daysLeft = project.endDate 
    ? Math.ceil((new Date(project.endDate) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="space-y-6">
      {/* Hero Section with Image */}
      {project.image && (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
          <div className="h-64 md:h-96 overflow-hidden">
            <img 
              src={project.image} 
              alt={project.name} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">About This Project</h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
              {project.description}
            </p>
          </div>

          {/* Goals & Objectives */}
          {project.objectives && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900">Objectives</h2>
              </div>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {project.objectives}
              </p>
            </div>
          )}

          {/* Impact & Progress */}
          {project.impact && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-bold text-slate-900">Impact & Results</h2>
              </div>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {project.impact}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Funding Progress */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Funding Progress</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-2xl font-bold text-slate-900">
                    ${(project.raised || 0).toLocaleString()}
                  </span>
                  <span className="text-sm text-slate-500">
                    of ${(project.goal || 0).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-slate-500 mt-2">
                  <span>{progress}% funded</span>
                  <span>{project.donors || 0} donors</span>
                </div>
              </div>

              {daysLeft > 0 && (
                <div className="flex items-center gap-2 text-sm text-slate-600 border-t border-slate-100 pt-4">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">{daysLeft} days left</span>
                </div>
              )}
            </div>
          </div>

          {/* Project Details */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Project Details</h3>
            
            <div className="space-y-4">
              {project.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Location</p>
                    <p className="text-sm text-slate-700 font-semibold">{project.location}</p>
                  </div>
                </div>
              )}

              {project.category && (
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Category</p>
                    <p className="text-sm text-slate-700 font-semibold">{project.category}</p>
                  </div>
                </div>
              )}

              {project.endDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">End Date</p>
                    <p className="text-sm text-slate-700 font-semibold">
                      {new Date(project.endDate).toLocaleDateString("en-US", { 
                        year: "numeric", 
                        month: "long", 
                        day: "numeric" 
                      })}
                    </p>
                  </div>
                </div>
              )}

              {project.beneficiaries && (
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Beneficiaries</p>
                    <p className="text-sm text-slate-700 font-semibold">{project.beneficiaries}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          {(project.contactEmail || project.contactPhone || project.website) && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Contact</h3>
              
              <div className="space-y-3">
                {project.contactEmail && (
                  <a 
                    href={`mailto:${project.contactEmail}`}
                    className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700 transition"
                  >
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="break-all">{project.contactEmail}</span>
                  </a>
                )}

                {project.contactPhone && (
                  <a 
                    href={`tel:${project.contactPhone}`}
                    className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700 transition"
                  >
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{project.contactPhone}</span>
                  </a>
                )}

                {project.website && (
                  <a 
                    href={project.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700 transition"
                  >
                    <Globe className="w-4 h-4 flex-shrink-0" />
                    <span className="break-all">Visit Website</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Status Badge */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-blue-900 uppercase tracking-wider">
                You&apos;re a Partner
              </span>
            </div>
            <p className="text-xs text-blue-700">
              You are officially involved in this project as a partner organisation/advocate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProjectOverview;
