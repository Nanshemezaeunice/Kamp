import { useState } from "react";

const KARAMOJA_DISTRICTS = [
  "Abim", "Amudat", "Kaabong", "Karenga", 
  "Kotido", "Moroto", "Nabilatuk", "Nakapiripirit", "Napak"
];

const TARGET_AUDIENCES = ["Men", "Women", "Kids", "Elderly", "All Communities"];

const CreateProjectModal = ({ isOpen, onClose, onCreate, verifiedNGOs, projectCategories }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [newProject, setNewProject] = useState({
    name: "",
    ngos: [],
    categories: [],
    districts: [],
    targetAudience: [],
    status: "Planned",
    startDate: "",
    endDate: "",
    goal: "",
    budgetBreakdown: "",
    ngoRoles: "",
    description: "",
    milestones: "",
    impactGoals: "",
    schedulingType: "Planned",
    verificationLinks: "",
    isPublic: true,
    isOpenForDonations: true,
    isOpenForOrganizations: true,
    complianceAgreed: false,
    image: "",
    imageType: "link", // 'link' or 'upload'
  });

  const [imagePreview, setImagePreview] = useState("");

  if (!isOpen) return null;

  const toggleSelection = (list, item, field) => {
    const updated = list.includes(item) 
      ? list.filter(i => i !== item) 
      : [...list, item];
    setNewProject({ ...newProject, [field]: updated });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setNewProject({ ...newProject, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      return;
    }
    if (!newProject.complianceAgreed) {
      alert("Please agree to the anti-corruption compliance.");
      return;
    }
    onCreate(newProject);
    setNewProject({
      name: "", ngos: [], categories: [], districts: [], targetAudience: [],
      status: "Planned", startDate: "", endDate: "", goal: "", 
      budgetBreakdown: "", ngoRoles: "", description: "", milestones: "", 
      impactGoals: "", schedulingType: "Planned", verificationLinks: "", 
      isPublic: true, 
      isOpenForDonations: true,
      isOpenForOrganizations: true,
      complianceAgreed: false, image: "", imageType: "link"
    });
    setImagePreview("");
    setCurrentStep(1);
  };

  const steps = [
    { id: 1, title: "Identity", icon: "🏢" },
    { id: 2, title: "Scope", icon: "📍" },
    { id: 3, title: "Logistics", icon: "�" },
    { id: 4, title: "Impact", icon: "✨" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-fadeIn border border-slate-100 flex flex-col h-[90vh]">
        {/* Modern Header with Stepper */}
        <div className="bg-linear-to-r from-blue-700 to-indigo-800 p-6 text-white shrink-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Deploy New Project</h2>
              <p className="text-blue-100 text-xs mt-0.5 opacity-80 font-medium tracking-wide">PHASE {currentStep} OF {steps.length}: {steps[currentStep-1].title.toUpperCase()}</p>
            </div>
            <button onClick={onClose} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-between relative px-8">
            <div className="absolute top-5 left-12 right-12 h-0.5 bg-white/20 z-0" />
            {steps.map((step) => (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 border-2 ${
                  currentStep >= step.id 
                    ? "bg-white text-blue-700 border-white scale-110 shadow-lg" 
                    : "bg-blue-600/50 text-white/50 border-white/10"
                }`}>
                  {currentStep > step.id ? "✓" : step.id}
                </div>
                <span className={`text-[9px] mt-2 font-black uppercase tracking-widest ${currentStep >= step.id ? "text-white" : "text-white/40"}`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-slate-50/50 p-10">
          <div className="max-w-3xl mx-auto">
            {currentStep === 1 && (
              <div className="space-y-8 animate-fadeIn">
                <section>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Project Classification</label>
                  <div className="grid grid-cols-1 gap-8">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Platform Official Title</label>
                      <input
                        required
                        type="text"
                        value={newProject.name}
                        onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                        placeholder="e.g. Kotido Solar-Powered Water Pump Installation"
                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <label className="block text-sm font-bold text-slate-700 mb-4 text-center">Vertical Categories</label>
                      <div className="flex flex-wrap justify-center gap-2">
                        {projectCategories.map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => toggleSelection(newProject.categories, cat, 'categories')}
                            className={`px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all border ${
                              newProject.categories.includes(cat)
                                ? "bg-blue-600 text-white border-blue-700 shadow-lg shadow-blue-100"
                                : "bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <label className="block text-sm font-bold text-slate-700 mb-4 text-center">Deployment Partners</label>
                      <div className="flex flex-wrap justify-center gap-2">
                        {verifiedNGOs.map(ngo => (
                          <button
                            key={ngo}
                            type="button"
                            onClick={() => toggleSelection(newProject.ngos, ngo, 'ngos')}
                            className={`px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all border ${
                              newProject.ngos.includes(ngo)
                                ? "bg-emerald-600 text-white border-emerald-700 shadow-lg shadow-emerald-100"
                                : "bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100"
                            }`}
                          >
                            {ngo}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8 animate-fadeIn">
                <section>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Geographic & Demographic Reach</label>
                  <div className="grid grid-cols-1 gap-8">
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                      <label className="block text-sm font-bold text-slate-700 mb-5">Primary Districts (Select All That Apply)</label>
                      <div className="grid grid-cols-3 gap-3">
                        {KARAMOJA_DISTRICTS.map(dist => (
                          <button
                            key={dist}
                            type="button"
                            onClick={() => toggleSelection(newProject.districts, dist, 'districts')}
                            className={`px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                              newProject.districts.includes(dist)
                                ? "bg-indigo-600 text-white border-indigo-700 shadow-xl shadow-indigo-100"
                                : "bg-slate-50 text-slate-500 border-slate-50 hover:border-indigo-200"
                            }`}
                          >
                            {dist}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                      <label className="block text-sm font-bold text-slate-700 mb-5">High-Priority Beneficiary Groups</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {TARGET_AUDIENCES.map(target => (
                          <button
                            key={target}
                            type="button"
                            onClick={() => toggleSelection(newProject.targetAudience, target, 'targetAudience')}
                            className={`group relative overflow-hidden px-6 py-5 rounded-2xl text-sm font-bold transition-all border-2 flex flex-col items-center gap-2 ${
                              newProject.targetAudience.includes(target)
                                ? "bg-slate-900 text-white border-slate-900 shadow-xl"
                                : "bg-white text-slate-600 border-slate-100 hover:border-slate-300"
                            }`}
                          >
                            <span className="text-xl">
                              {target === 'Men' ? '🧔' : target === 'Women' ? '👩' : target === 'Kids' ? '🧒' : target === 'Elderly' ? '👵' : '🌍'}
                            </span>
                            {target}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-8 animate-fadeIn">
                <section>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Timelines & Financials</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Commencement</label>
                          <input
                            required
                            type="date"
                            value={newProject.startDate}
                            onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                            className="w-full px-5 py-4 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Completion Goal</label>
                          <input
                            required
                            type="date"
                            value={newProject.endDate}
                            onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
                            className="w-full px-5 py-4 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                      <label className="block text-sm font-bold text-slate-700 mb-3">Funding Target</label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                        <input
                          required
                          type="number"
                          value={newProject.goal}
                          onChange={(e) => setNewProject({...newProject, goal: e.target.value})}
                          placeholder="50,000"
                          className="w-full pl-10 pr-5 py-5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-xl font-bold"
                        />
                      </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center">
                      <label className="block text-sm font-bold text-slate-700 mb-3">Initial Status</label>
                      <select
                        value={newProject.status}
                        onChange={(e) => setNewProject({...newProject, status: e.target.value})}
                        className="w-full px-5 py-5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-600 appearance-none shadow-sm cursor-pointer"
                      >
                        <option>Planned</option>
                        <option>Ongoing</option>
                        <option>Completed</option>
                      </select>
                    </div>

                    <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                      <label className="block text-sm font-bold text-slate-700 mb-3">Transparency: Budget Allocation</label>
                      <textarea
                        value={newProject.budgetBreakdown}
                        onChange={(e) => setNewProject({...newProject, budgetBreakdown: e.target.value})}
                        placeholder="Provide a high-level split of the funds (e.g. Labor 30%, Materials 60%, Admin 10%)"
                        className="w-full px-6 py-5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 h-32 tracking-wider placeholder:text-slate-300 border-none"
                      />
                    </div>
                  </div>
                </section>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-10 animate-fadeIn">
                <section>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 text-center">Narrative & Compliance</label>
                  
                  <div className="space-y-8">
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                      <label className="block text-sm font-bold text-slate-700 mb-4">Detailed Project Brief</label>
                      <textarea
                        required
                        value={newProject.description}
                        onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                        placeholder="Focus on the impact, strategy, and long-term sustainability..."
                        className="w-full px-6 py-5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 h-40 border-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-white p-6 rounded-2xl border border-slate-100">
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Milestones</label>
                        <textarea
                          value={newProject.milestones}
                          onChange={(e) => setNewProject({...newProject, milestones: e.target.value})}
                          placeholder="Phase 1: Foundation..."
                          className="w-full bg-slate-50 p-4 rounded-xl outline-none h-24 text-sm border-none"
                        />
                      </div>
                      <div className="bg-white p-6 rounded-2xl border border-slate-100">
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Impact Metrics</label>
                        <textarea
                          value={newProject.impactGoals}
                          onChange={(e) => setNewProject({...newProject, impactGoals: e.target.value})}
                          placeholder="Beneficiaries reached, disease reduction..."
                          className="w-full bg-slate-50 p-4 rounded-xl outline-none h-24 text-sm border-none"
                        />
                      </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                      <label className="block text-sm font-bold text-slate-700 mb-5">High-Definition Imagery</label>
                      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit mb-6">
                        <button
                          type="button"
                          onClick={() => setNewProject({...newProject, imageType: 'link'})}
                          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${newProject.imageType === 'link' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500'}`}
                        > Direct Link </button>
                        <button
                          type="button"
                          onClick={() => setNewProject({...newProject, imageType: 'upload'})}
                          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${newProject.imageType === 'upload' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500'}`}
                        > Upload File </button>
                      </div>

                      {newProject.imageType === 'link' ? (
                        <input
                          type="text"
                          value={newProject.image}
                          onChange={(e) => {
                            setNewProject({...newProject, image: e.target.value});
                            setImagePreview(e.target.value);
                          }}
                          placeholder="https://images.unsplash.com/source-url"
                          className="w-full px-6 py-4 bg-slate-50 border-none rounded-xl shadow-inner outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="group relative w-full h-40 border-2 border-slate-200 border-dashed rounded-3xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer">
                          <svg className="w-10 h-10 mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <p className="text-xs font-bold text-slate-400">SELECT BRAND IMAGERY</p>
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleImageUpload} />
                        </div>
                      )}

                      {(imagePreview || newProject.image) && (
                        <div className="mt-8 relative h-60 w-full rounded-3xl overflow-hidden shadow-2xl group border-4 border-white">
                          <img src={imagePreview || newProject.image} alt="Preview" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => {
                              setImagePreview("");
                              setNewProject({...newProject, image: ""});
                            }}
                            className="absolute top-4 right-4 p-3 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-xl transition-all scale-0 group-hover:scale-100"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                      <label className="block text-sm font-bold text-slate-700 mb-5 text-center">Engagement Settings</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setNewProject({...newProject, isOpenForDonations: !newProject.isOpenForDonations})}
                          className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                            newProject.isOpenForDonations 
                              ? "bg-emerald-50 border-emerald-500 text-emerald-900" 
                              : "bg-slate-50 border-slate-200 text-slate-400"
                          }`}
                        >
                          <div className="text-left">
                            <p className="text-sm font-black uppercase tracking-tight">Open for Donations</p>
                            <p className="text-[10px] font-bold opacity-70">Allow public to contribute</p>
                          </div>
                          <div className={`w-12 h-6 rounded-full relative transition-colors ${newProject.isOpenForDonations ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newProject.isOpenForDonations ? 'right-1' : 'left-1'}`} />
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setNewProject({...newProject, isOpenForOrganizations: !newProject.isOpenForOrganizations})}
                          className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                            newProject.isOpenForOrganizations 
                              ? "bg-blue-50 border-blue-500 text-blue-900" 
                              : "bg-slate-50 border-slate-200 text-slate-400"
                          }`}
                        >
                          <div className="text-left">
                            <p className="text-sm font-black uppercase tracking-tight">NGO Collaboration</p>
                            <p className="text-[10px] font-bold opacity-70">Allow other Orgs to apply</p>
                          </div>
                          <div className={`w-12 h-6 rounded-full relative transition-colors ${newProject.isOpenForOrganizations ? 'bg-blue-500' : 'bg-slate-300'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newProject.isOpenForOrganizations ? 'right-1' : 'left-1'}`} />
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="bg-linear-to-br from-slate-900 to-slate-800 text-white p-10 rounded-[3rem] shadow-2xl">
                      <div className="flex items-start gap-6">
                        <div className="shrink-0 mt-1">
                          <input
                            required
                            type="checkbox"
                            checked={newProject.complianceAgreed}
                            onChange={(e) => setNewProject({...newProject, complianceAgreed: e.target.checked})}
                            className="w-7 h-7 accent-blue-500 rounded-lg cursor-pointer"
                          />
                        </div>
                        <div>
                          <p className="font-black text-lg tracking-tight mb-2">The KAMP Accountability Standard</p>
                          <p className="text-xs text-slate-400 leading-relaxed font-medium">
                            By finalizing this deployment, I confirm this project meets all <span className="text-blue-400">Transparency & Anti-Corruption</span> guidelines. 
                            I acknowledge that this data will be visible to donors and subject to external auditing by the Uganda Ministry of Local Government.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </form>

        {/* Action Footer */}
        <div className="p-8 bg-white border-t border-slate-100 flex items-center justify-between gap-6 shrink-0">
          <button
            type="button"
            onClick={currentStep === 1 ? onClose : () => setCurrentStep(currentStep - 1)}
            className="px-10 py-4 text-slate-400 hover:text-slate-600 font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all"
          >
            {currentStep === 1 ? "Discard Deployment" : "Previous Stage"}
          </button>
          
          <div className="flex items-center gap-4 flex-1 max-w-sm">
            <button
              onClick={handleSubmit}
              className="w-full bg-linear-to-r from-blue-600 to-indigo-700 text-white font-black text-[11px] uppercase tracking-[0.2em] py-5 px-8 rounded-2xl hover:shadow-2xl hover:shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {currentStep === 4 ? (
                <>
                  <span>Deploy to Live Platform</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </>
              ) : (
                <>
                  <span>Navigate to Next Phase</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
