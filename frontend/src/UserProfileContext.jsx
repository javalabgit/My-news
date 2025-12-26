import React, { createContext, useContext, useState, useEffect } from "react";

const UserProfileContext = createContext();

export function UserProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("user_profile_v2");
    if (saved) {
      setProfile(JSON.parse(saved));
    } else {
      setShowOnboarding(true);
    }
  }, []);

  const saveProfile = (data) => {
    setProfile(data);
    localStorage.setItem("user_profile_v2", JSON.stringify(data));
    setShowOnboarding(false);
  };

  const clearProfile = () => {
      localStorage.removeItem("user_profile_v2");
      setProfile(null);
      setShowOnboarding(true);
  }

  return (
    <UserProfileContext.Provider value={{ profile, showOnboarding, saveProfile, clearProfile }}>
      {children}
      {showOnboarding && <DetailedOnboardingModal onSave={saveProfile} />}
    </UserProfileContext.Provider>
  );
}

export const useUserProfile = () => useContext(UserProfileContext);

// --- MULTI-STEP WIZARD COMPONENT ---

function DetailedOnboardingModal({ onSave }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    age_group: "",
    city: "",
    state: "",
    profession: "",
    job_level: "Mid-Level",
    industry: "",
    goals: "",
    worries: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = (e) => {
    e.preventDefault();
    setStep(step + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <h2 className="text-3xl font-bold">Setup Your AI Intelligence</h2>
          <p className="opacity-90 mt-2 text-sm">
            {step === 1 ? "Step 1: The Basics" : "Step 2: Deep Context"}
          </p>
          {/* Progress Bar */}
          <div className="w-full bg-blue-900/30 h-2 rounded-full mt-4">
            <div 
                className="bg-white h-2 rounded-full transition-all duration-500" 
                style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8 overflow-y-auto flex-1">
          <form className="space-y-6">
            
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                    <input name="name" placeholder="First Name" onChange={handleChange} className="input-field" autoFocus />
                    <input name="age_group" placeholder="Age Group (e.g., 20s, 30s)" onChange={handleChange} className="input-field" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <input name="city" placeholder="City" onChange={handleChange} className="input-field" />
                    <input name="state" placeholder="State" onChange={handleChange} className="input-field" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <input name="profession" placeholder="Job Title (e.g., Developer)" onChange={handleChange} className="input-field" />
                    <input name="industry" placeholder="Industry (e.g., Fintech)" onChange={handleChange} className="input-field" />
                </div>
                <div>
                    <label className="text-sm text-gray-500 mb-1 block">Seniority Level</label>
                    <select name="job_level" onChange={handleChange} className="input-field">
                        <option>Student</option>
                        <option>Junior / Entry Level</option>
                        <option>Mid-Level</option>
                        <option>Senior / Lead</option>
                        <option>Executive / Founder</option>
                    </select>
                </div>
                <button onClick={nextStep} className="btn-primary w-full mt-4">
                    Next: Personalize Strategy →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <p className="text-sm text-blue-800">
                        🔒 <strong>Privacy Note:</strong> This data is stored 100% locally on your device. It is only sent to the AI for analysis and never saved on our servers.
                    </p>
                </div>

                <div>
                    <label className="block font-semibold mb-2 text-gray-700">What are your top goals right now?</label>
                    <textarea 
                        name="goals" 
                        rows="3"
                        placeholder="e.g., Buying a home in 2 years, Switching to a Management role..." 
                        onChange={handleChange} 
                        className="input-field" 
                    />
                </div>

                <div>
                    <label className="block font-semibold mb-2 text-gray-700">What are your biggest worries?</label>
                    <textarea 
                        name="worries" 
                        rows="3"
                        placeholder="e.g., Tech layoffs, Rising rent costs..." 
                        onChange={handleChange} 
                        className="input-field" 
                    />
                </div>

                <div className="flex gap-3 mt-6">
                    <button onClick={(e) => {e.preventDefault(); setStep(1)}} className="btn-secondary flex-1">
                        ← Back
                    </button>
                    <button onClick={(e) => {e.preventDefault(); onSave(formData)}} className="btn-primary flex-1">
                        Complete Setup 🚀
                    </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
