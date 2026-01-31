
import React, { useState, useEffect } from 'react';
import { 
  User, 
  GraduationCap, 
  Code, 
  Briefcase, 
  Github, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Download,
  Trash2,
  Plus,
  Loader2,
  CheckCircle2,
  Eye,
  X,
  SortDesc,
  SortAsc,
  Trophy,
  Printer,
  FileDown
} from 'lucide-react';
import { ResumeData, Project, Experience, Education, TemplateId } from './types';
import { fetchGithubRepos } from './services/githubService';
import { generateBulletPoints } from './services/geminiService';
import { ResumePreview } from './components/ResumeTemplates';

// Global declaration for html2pdf (loaded via CDN in index.html)
declare var html2pdf: any;

const STEPS = [
  { id: 'personal', title: 'Personal', icon: User },
  { id: 'education', title: 'Education', icon: GraduationCap },
  { id: 'github', title: 'GitHub', icon: Github },
  { id: 'experience', title: 'Experience', icon: Briefcase },
  { id: 'skills', title: 'Skills & More', icon: Code },
  { id: 'review', title: 'Final Review', icon: CheckCircle2 },
];

const INITIAL_DATA: ResumeData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedinUrl: '',
    githubUsername: '',
    portfolioUrl: '',
    headline: 'Aspiring Software Engineer & Student',
  },
  education: [],
  skills: [],
  projects: [],
  experience: [],
  certifications: [],
  activities: [],
  settings: {
    educationOrder: 'desc'
  }
};

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_DATA);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [githubRepos, setGithubRepos] = useState<Partial<Project>[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<TemplateId>('classic');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('elevate_resume_v4');
    if (saved) {
      try {
        setResumeData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('elevate_resume_v4', JSON.stringify(resumeData));
  }, [resumeData]);

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setResumeData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [name]: value }
    }));
  };

  const addItem = (section: keyof ResumeData, item: any) => {
    setResumeData(prev => ({
      ...prev,
      [section]: [...(prev[section] as any[]), item]
    }));
  };

  const removeItem = (section: keyof ResumeData, id: string | number) => {
    setResumeData(prev => ({
      ...prev,
      [section]: typeof id === 'string' 
        ? (prev[section] as any[]).filter(item => item.id !== id)
        : (prev[section] as any[]).filter((_, idx) => idx !== id)
    }));
  };

  const handleFetchRepos = async () => {
    if (!resumeData.personalInfo.githubUsername) return;
    setIsGenerating('github');
    const repos = await fetchGithubRepos(resumeData.personalInfo.githubUsername);
    setGithubRepos(repos);
    setIsGenerating(null);
  };

  const addRepoAsProject = (repo: Partial<Project>) => {
    const newProject: Project = {
      id: repo.id || Math.random().toString(),
      title: repo.title || '',
      description: repo.description || '',
      technologies: repo.technologies || [],
      githubUrl: repo.githubUrl || '',
      bulletPoints: []
    };
    addItem('projects', newProject);
  };

  const handleGenerateBullets = async (itemId: string, context: 'project' | 'experience') => {
    setIsGenerating(itemId);
    const item = context === 'project' 
      ? resumeData.projects.find(p => p.id === itemId)
      : resumeData.experience.find(e => e.id === itemId);
    
    if (item) {
      const title = context === 'project' ? (item as Project).title : (item as Experience).role;
      const description = context === 'project' ? (item as Project).description : (item as Experience).description || '';
      
      const bullets = await generateBulletPoints(title, description, context);
      setResumeData(prev => ({
        ...prev,
        [context === 'project' ? 'projects' : 'experience']: (prev[context === 'project' ? 'projects' : 'experience'] as any[]).map(i => 
          i.id === itemId ? { ...i, bulletPoints: bullets } : i
        )
      }));
    }
    setIsGenerating(null);
  };

  const toggleEducationOrder = () => {
    setResumeData(prev => ({
      ...prev,
      settings: { ...prev.settings, educationOrder: prev.settings.educationOrder === 'desc' ? 'asc' : 'desc' }
    }));
  };

  const handleAddSkill = () => {
    const val = skillInput.trim();
    if (val && !resumeData.skills.includes(val)) {
      setResumeData(prev => ({ ...prev, skills: [...prev.skills, val] }));
      setSkillInput('');
    }
  };

  const handleExportPDF = async () => {
    if (isExporting) return;
    setIsExporting(true);

    const element = document.getElementById('resume-document');
    if (!element) {
      setIsExporting(false);
      return;
    }

    const name = resumeData.personalInfo.fullName.replace(/\s+/g, '_') || 'Resume';
    const filename = `${name}_Elevate_Resume.pdf`;

    const opt = {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF Export Error:', err);
      alert("Failed to export PDF. Please try the Print option instead.");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    const name = resumeData.personalInfo.fullName.replace(/\s+/g, '_') || 'Resume';
    document.title = `${name}_Elevate_Resume`;
    window.print();
    setTimeout(() => { document.title = originalTitle; }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-b z-40 no-print">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-indigo-200 shadow-lg">E</div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Elevate</h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-slate-200"
            >
              <Eye size={16} />
              <span className="hidden sm:inline">Preview Resume</span>
            </button>
          </div>
        </div>
      </header>

      {/* Progress Line */}
      <div className="fixed top-16 left-0 right-0 h-1 bg-slate-100 z-40 no-print">
        <div 
          className="h-full bg-indigo-600 transition-all duration-500 shadow-sm"
          style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
        ></div>
      </div>

      <main className="pt-28 pb-32 px-4 max-w-2xl mx-auto no-print">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm min-h-[500px]">
          
          {/* Step 1: Personal Details */}
          {currentStep === 0 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-slate-800">Contact Details</h2>
                <p className="text-slate-500">Recruiters need to know who you are.</p>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <input name="fullName" value={resumeData.personalInfo.fullName} onChange={handlePersonalChange} placeholder="Full Name" className="w-full p-4 bg-slate-50 rounded-2xl border outline-none focus:border-indigo-500 focus:bg-white transition-all" />
                <input name="headline" value={resumeData.personalInfo.headline} onChange={handlePersonalChange} placeholder="Professional Headline" className="w-full p-4 bg-slate-50 rounded-2xl border outline-none focus:border-indigo-500 focus:bg-white transition-all" />
                <div className="grid grid-cols-2 gap-4">
                  <input name="email" value={resumeData.personalInfo.email} onChange={handlePersonalChange} placeholder="Email" className="w-full p-4 bg-slate-50 rounded-2xl border outline-none focus:border-indigo-500 focus:bg-white transition-all" />
                  <input name="phone" value={resumeData.personalInfo.phone} onChange={handlePersonalChange} placeholder="Phone" className="w-full p-4 bg-slate-50 rounded-2xl border outline-none focus:border-indigo-500 focus:bg-white transition-all" />
                </div>
                <input name="linkedinUrl" value={resumeData.personalInfo.linkedinUrl} onChange={handlePersonalChange} placeholder="LinkedIn Profile URL" className="w-full p-4 bg-slate-50 rounded-2xl border outline-none focus:border-indigo-500 focus:bg-white transition-all" />
              </div>
            </div>
          )}

          {/* Step 2: Education */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Education Timeline</h2>
                <button onClick={toggleEducationOrder} className="text-xs bg-slate-100 p-2 px-4 rounded-full flex gap-1 items-center font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                  {resumeData.settings.educationOrder === 'desc' ? <SortDesc size={14} /> : <SortAsc size={14} />}
                  {resumeData.settings.educationOrder === 'desc' ? 'Recent First' : 'Oldest First'}
                </button>
              </div>
              <div className="space-y-4">
                {resumeData.education.map((edu, idx) => (
                  <div key={edu.id} className="p-6 bg-slate-50 rounded-2xl relative border group hover:border-indigo-200 transition-all">
                    <button onClick={() => removeItem('education', edu.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                    <input placeholder="University or High School" className="font-bold text-lg bg-transparent w-full mb-2 outline-none" value={edu.school} onChange={e => {
                      const n = [...resumeData.education]; n[idx].school = e.target.value; setResumeData(p => ({ ...p, education: n }));
                    }} />
                    <input placeholder="Degree or Major" className="text-sm bg-transparent w-full mb-4 outline-none text-slate-600" value={edu.degree} onChange={e => {
                      const n = [...resumeData.education]; n[idx].degree = e.target.value; setResumeData(p => ({ ...p, education: n }));
                    }} />
                    <div className="grid grid-cols-2 gap-4">
                      <input placeholder="Start Year" value={edu.startYear} className="p-3 bg-white rounded-xl text-sm border outline-none focus:border-indigo-300" onChange={e => {
                        const n = [...resumeData.education]; n[idx].startYear = e.target.value; setResumeData(p => ({ ...p, education: n }));
                      }} />
                      <input placeholder="End Year (or Present)" value={edu.endYear} className="p-3 bg-white rounded-xl text-sm border outline-none focus:border-indigo-300" onChange={e => {
                        const n = [...resumeData.education]; n[idx].endYear = e.target.value; setResumeData(p => ({ ...p, education: n }));
                      }} />
                    </div>
                  </div>
                ))}
                <button onClick={() => addItem('education', { id: Math.random().toString(), school: '', degree: '', location: '', startYear: '', endYear: '' })} className="w-full py-4 border-2 border-dashed rounded-2xl text-slate-400 font-bold hover:border-indigo-200 hover:text-indigo-500 flex justify-center items-center gap-2 transition-all"><Plus size={18} /> Add Institution</button>
              </div>
            </div>
          )}

          {/* Step 3: Projects & GitHub */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold">Project Portfolio</h2>
              <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl space-y-4">
                <div className="flex items-center gap-2 font-bold text-indigo-900"><Github size={20} /> GitHub Smart Import</div>
                <div className="flex gap-2">
                  <input name="githubUsername" value={resumeData.personalInfo.githubUsername} onChange={handlePersonalChange} placeholder="Username" className="flex-1 p-3 bg-white rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500" />
                  <button onClick={handleFetchRepos} disabled={isGenerating === 'github'} className="bg-indigo-600 text-white px-6 rounded-xl font-bold disabled:opacity-50 transition-all active:scale-95">{isGenerating === 'github' ? <Loader2 className="animate-spin" size={16}/> : 'Fetch'}</button>
                </div>
                {githubRepos.length > 0 && (
                  <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                    {githubRepos.map(repo => (
                      <div key={repo.id} className="flex justify-between items-center p-3 bg-white rounded-xl border text-xs hover:border-indigo-400 transition-all">
                        <span className="font-bold truncate max-w-[150px]">{repo.title}</span>
                        <button onClick={() => addRepoAsProject(repo)} className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg font-bold hover:bg-indigo-100 transition-colors">Add</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {resumeData.projects.map((proj, idx) => (
                  <div key={proj.id} className="p-6 bg-slate-50 rounded-2xl border group relative hover:border-indigo-200 transition-all">
                    <button onClick={() => removeItem('projects', proj.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                    <input placeholder="Project Title" className="font-bold text-lg bg-transparent w-full mb-2 outline-none" value={proj.title} onChange={e => {
                      const n = [...resumeData.projects]; n[idx].title = e.target.value; setResumeData(p => ({ ...p, projects: n }));
                    }} />
                    <textarea placeholder="Describe what you built and why..." className="w-full text-sm p-4 rounded-xl mb-3 h-20 outline-none border focus:border-indigo-300 transition-all" value={proj.description} onChange={e => {
                      const n = [...resumeData.projects]; n[idx].description = e.target.value; setResumeData(p => ({ ...p, projects: n }));
                    }} />
                    <button onClick={() => handleGenerateBullets(proj.id, 'project')} disabled={isGenerating === proj.id} className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors shadow-sm active:scale-[0.98]">
                      {isGenerating === proj.id ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />} Rewrite with AI
                    </button>
                  </div>
                ))}
                <button onClick={() => addItem('projects', { id: Math.random().toString(), title: '', description: '', technologies: [], bulletPoints: [] })} className="w-full py-4 border-2 border-dashed rounded-2xl text-slate-400 font-bold hover:border-indigo-200 hover:text-indigo-500 flex justify-center items-center gap-2 transition-all"><Plus size={18} /> New Project</button>
              </div>
            </div>
          )}

          {/* Step 4: Experience */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h2 className="text-2xl font-bold">Experience</h2>
               <div className="space-y-4">
                 {resumeData.experience.map((exp, idx) => (
                   <div key={exp.id} className="p-6 bg-slate-50 rounded-2xl border group relative hover:border-indigo-200 transition-all">
                      <button onClick={() => removeItem('experience', exp.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                      <input placeholder="Job Title / Role" className="font-bold text-lg bg-transparent w-full mb-1 outline-none" value={exp.role} onChange={e => {
                         const n = [...resumeData.experience]; n[idx].role = e.target.value; setResumeData(p => ({ ...p, experience: n }));
                      }} />
                      <input placeholder="Company Name" className="text-sm font-medium text-slate-500 bg-transparent w-full mb-4 outline-none" value={exp.company} onChange={e => {
                         const n = [...resumeData.experience]; n[idx].company = e.target.value; setResumeData(p => ({ ...p, experience: n }));
                      }} />
                      <textarea placeholder="Briefly describe your responsibilities..." className="w-full text-sm p-4 rounded-xl border h-20 outline-none focus:border-indigo-300" value={exp.description} onChange={e => {
                          const n = [...resumeData.experience]; n[idx].description = e.target.value; setResumeData(p => ({ ...p, experience: n }));
                      }} />
                      <button onClick={() => handleGenerateBullets(exp.id, 'experience')} disabled={isGenerating === exp.id} className="w-full mt-3 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors active:scale-[0.98]">
                         {isGenerating === exp.id ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />} AI Bullet Points
                      </button>
                   </div>
                 ))}
                 <button onClick={() => addItem('experience', { id: Math.random().toString(), company: '', role: '', startDate: '', endDate: '', current: false, bulletPoints: [], description: '' })} className="w-full py-4 border-2 border-dashed rounded-2xl text-slate-400 font-bold hover:border-indigo-200 hover:text-indigo-500 flex justify-center items-center gap-2 transition-all"><Plus size={18} /> Add Role</button>
               </div>
            </div>
          )}

          {/* Step 5: Skills & Activities */}
          {currentStep === 4 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section className="space-y-4">
                <h2 className="text-xl font-bold">Skills</h2>
                <div className="flex gap-2">
                  <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddSkill()} placeholder="Skill Name (e.g. Java, Public Speaking)" className="flex-1 p-3 bg-slate-50 rounded-xl border outline-none focus:border-indigo-500 transition-all" />
                  <button onClick={handleAddSkill} className="bg-indigo-600 text-white px-6 rounded-xl font-bold hover:bg-indigo-700 transition-colors active:scale-95"><Plus size={18}/></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.map((skill, idx) => (
                    <span key={idx} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-bold border border-indigo-100 flex items-center gap-2 group transition-all hover:bg-indigo-100">
                      {skill}
                      <button onClick={() => removeItem('skills', idx)} className="opacity-40 group-hover:opacity-100 hover:text-red-500 transition-all"><X size={14}/></button>
                    </span>
                  ))}
                  {resumeData.skills.length === 0 && <p className="text-xs text-slate-300 italic">No skills added yet...</p>}
                </div>
              </section>
              
              <section className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2"><Trophy className="text-amber-500" size={20} /> <h2 className="text-xl font-bold">Activities & Achievements</h2></div>
                <div className="space-y-2">
                  {resumeData.activities.map((act, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input value={act} onChange={e => {
                        const n = [...resumeData.activities]; n[idx] = e.target.value; setResumeData(p => ({ ...p, activities: n }));
                      }} className="flex-1 p-3 bg-slate-50 rounded-xl border outline-none text-sm focus:border-indigo-300 transition-all" />
                      <button onClick={() => removeItem('activities', idx)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                    </div>
                  ))}
                  <button onClick={() => addItem('activities', 'New Entry')} className="text-xs text-indigo-600 font-bold bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors active:scale-95"><Plus size={14} className="inline mr-1" /> Add Entry</button>
                </div>
              </section>
            </div>
          )}

          {/* Step 6: Review & Export */}
          {currentStep === 5 && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 text-center py-8">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-50"><CheckCircle2 size={40} /></div>
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Ready to Apply!</h2>
              <p className="text-slate-500 max-w-sm mx-auto">Your resume is perfectly formatted and ready. Choose your preferred export method below.</p>
              
              <div className="flex flex-col gap-4 max-w-xs mx-auto pt-6">
                <button 
                  onClick={() => setIsPreviewOpen(true)}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                >
                  <Eye size={20} /> View Full Preview
                </button>
                <button 
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50"
                >
                  {isExporting ? <Loader2 className="animate-spin" size={20} /> : <FileDown size={20} />}
                  {isExporting ? 'Generating PDF...' : 'Download PDF'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Persistent Navigation Footer */}
      <nav className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none no-print">
        <div className="max-w-2xl mx-auto flex justify-between pointer-events-auto">
          <button 
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} 
            disabled={currentStep === 0}
            className="px-8 py-3 bg-white border border-slate-200 rounded-full font-bold shadow-lg disabled:opacity-0 active:scale-95 transition-all hover:bg-slate-50"
          >
            Back
          </button>
          <button 
            onClick={() => setCurrentStep(Math.min(STEPS.length - 1, currentStep + 1))}
            disabled={currentStep === STEPS.length - 1}
            className="px-10 py-3 bg-indigo-600 text-white rounded-full font-bold shadow-xl active:scale-95 flex items-center gap-2 hover:bg-indigo-700 transition-all"
          >
            {currentStep === STEPS.length - 2 ? 'Final Review' : 'Next Step'} <ChevronRight size={18} />
          </button>
        </div>
      </nav>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 no-print">
          <div className="bg-slate-100 w-full max-w-6xl h-[92vh] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl">
            <header className="px-8 py-5 bg-white border-b flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setIsPreviewOpen(false)} className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors"><X size={20} /></button>
                <div className="hidden md:flex gap-1 bg-slate-100 p-1 rounded-xl">
                  {(['classic', 'modern', 'minimal'] as TemplateId[]).map(t => (
                    <button key={t} onClick={() => setActiveTemplate(t)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTemplate === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-bold hover:bg-slate-200 transition-all"><Printer size={18} /> Print</button>
                <button 
                  onClick={handleExportPDF} 
                  disabled={isExporting}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  {isExporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                  {isExporting ? 'Exporting...' : 'Export PDF'}
                </button>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto p-12 flex justify-center bg-slate-200/50 custom-scrollbar">
               <ResumePreview data={resumeData} templateId={activeTemplate} />
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Target */}
      <div className="hidden print:block print-view-container">
        <ResumePreview data={resumeData} templateId={activeTemplate} />
      </div>
    </div>
  );
};

export default App;
