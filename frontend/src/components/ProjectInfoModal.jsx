import { X, MapPin, Users, Calendar, DollarSign, Heart, Crown } from "lucide-react";

const ProjectInfoModal = ({ project, onClose, onApply, onDonate, hasApplied, applicationStatus, currentUserId }) => {
  if (!project) return null;

  const isCreator = currentUserId && (project.creatorId?._id === currentUserId || project.creatorId === currentUserId);
  const progress = project.goal > 0 ? Math.round((project.raised / project.goal) * 100) : 0;

  const statusBadge = {
    pending: { bg: "bg-amber-100 text-amber-700", label: "Application Pending" },
    reviewed: { bg: "bg-blue-100 text-blue-700", label: "Under Review" },
    accepted: { bg: "bg-green-100 text-green-700", label: "Accepted" },
    rejected: { bg: "bg-red-100 text-red-700", label: "Rejected" },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Image */}
        <div className="relative h-48">
          <img
            src={project.image || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500&h=300&fit=crop"}
            alt={project.name}
            className="w-full h-full object-cover rounded-t-2xl"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-1.5 hover:bg-white transition"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
          <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/60 to-transparent p-4">
            <h2 className="text-xl font-bold text-white">{project.name}</h2>
            <p className="text-white/80 text-sm">
              {project.ngos?.length > 0 ? project.ngos.join(", ") : project.partners?.length > 0 ? project.partners.join(", ") : "KAMP Project"}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Creator/Head info */}
          {isCreator && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Crown className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-blue-800 font-bold text-sm">You are the Project Head</p>
                <p className="text-blue-600 text-xs text-opacity-80">You created this project and are managing its impact.</p>
              </div>
            </div>
          )}

          {/* Status badge if applied */}
          {!isCreator && hasApplied && applicationStatus && (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${statusBadge[applicationStatus]?.bg || statusBadge.pending.bg}`}>
              <span className="w-2 h-2 rounded-full bg-current" />
              {statusBadge[applicationStatus]?.label || "Applied"}
            </div>
          )}

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed">{project.description}</p>

          {/* Quick info grid */}
          <div className="grid grid-cols-2 gap-3">
            {project.districts?.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="truncate">{project.districts.join(", ")}</span>
              </div>
            )}
            {project.targetAudience?.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                <Users className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="truncate">{project.targetAudience.join(", ")}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
              <span>{project.status || "Active"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              <Heart className="w-4 h-4 text-red-400 shrink-0" />
              <span>{project.donors || 0} donors</span>
            </div>
          </div>

          {/* Categories */}
          {project.categories?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.categories.map((cat, i) => (
                <span key={i} className="text-xs font-medium bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">
                  {cat}
                </span>
              ))}
            </div>
          )}

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-semibold text-gray-800">${project.raised?.toLocaleString() || 0} raised</span>
              <span className="text-gray-500">${project.goal?.toLocaleString() || 0} goal</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-500 h-2.5 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
            <p className="text-right text-xs font-bold text-blue-600 mt-1">{progress}%</p>
          </div>

          {/* Action buttons */}
          {!isCreator && (
            <div className="flex gap-3 pt-2">
              {project.isOpenForDonations && (
                <button
                  onClick={() => onDonate(project)}
                  className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  Donate
                </button>
              )}
              {hasApplied ? (
                <div className={`flex-1 py-2.5 rounded-xl font-semibold text-center text-sm ${statusBadge[applicationStatus]?.bg || "bg-amber-100 text-amber-700"}`}>
                  {statusBadge[applicationStatus]?.label || "Applied"}
                </div>
              ) : (
                <button
                  onClick={() => onApply(project)}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                  Apply to Join
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoModal;
