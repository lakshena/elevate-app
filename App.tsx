
import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, 
  GraduationCap, 
  Code, 
  Briefcase, 
  Github, 
  Award, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Download,
  Trash2,
  Plus,
  Loader2,
  CheckCircle2,
  Info,
  Eye,
  X,
  SortDesc,
  SortAsc,
  Trophy
} from 'lucide-react';
import { ResumeData, Project, Experience, Education, TemplateId } from './types';
import { fetchGithubRepos } from './services/githubService';
import { generateBulletPoints } from './services/geminiService';
import { ResumePreview } from './components/ResumeTemplates';

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
  const [githubRepos, setGithubRepos] = useState<Partial<Project>[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<TemplateId>('classic');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('elevate_resume_data_v3');
    if (saved) setResumeData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('elevate_resume_data_v3', JSON.stringify(resumeData));
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

  const handlePrint = () => {
    window.print();
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
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="fixed top-16 left-0 right-0 h-1 bg-slate-100 z-40 no-print">
        <div 
          className="h-full bg-indigo-600 transition-all duration-500 shadow-sm"
          style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
        ></div>
      </div>

      <main className="pt-28 pb-32 px-4 max-w-2xl mx-auto no-print">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm min-h-[500px]">
          {/* Step 1: Personal */}
          {currentStep === 0 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-slate-800">Contact Details</h2>
                <p className="text-slate-500">How should employers reach you?</p>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <input name="fullName" value={resumeData.personalInfo.fullName} onChange={handlePersonalChange} placeholder="Full Name" className="w-full p-4 bg-slate-50 rounded-2xl border outline-none focus:border-indigo-500 focus:bg-white" />
                <input name="headline" value={resumeData.personalInfo.headline} onChange={handlePersonalChange} placeholder="Professional Headline" className="w-full p-4 bg-slate-50 rounded-2xl border outline-none focus:border-indigo-500 focus:bg-white" />
                <div className="grid grid-cols-2 gap-4">
                  <input name="email" value={resumeData.personalInfo.email} onChange={handlePersonalChange} placeholder="Email" className="w-full p-4 bg-slate-50 rounded-2xl border outline-none focus:border-indigo-500 focus:bg-white" />
                  <input name="phone" value={resumeData.personalInfo.phone} onChange={handlePersonalChange} placeholder="Phone" className="w-full p-4 bg-slate-50 rounded-2xl border outline-none focus:border-indigo-500 focus:bg-white" />
                </div>
                <input name="linkedinUrl" value={resumeData.personalInfo.linkedinUrl} onChange={handlePersonalChange} placeholder="LinkedIn URL" className="w-full p-4 bg-slate-50 rounded-2xl border outline-none focus:border-indigo-500 focus:bg-white" />
              </div>
            </div>
          )}

          {/* Step 2: Education */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Education</h2>
                <button onClick={toggleEducationOrder} className="text-xs bg-slate-100 p-2 rounded-full flex gap-1 items-center">
                  {resumeData.settings.educationOrder === 'desc' ? <SortDesc size={14} /> : <SortAsc size={14} />}
                  Sort
                </button>
              </div>
              <div className="space-y-4">
                {resumeData.education.map((edu, idx) => (
                  <div key={edu.id} className="p-6 bg-slate-50 rounded-2xl relative border group">
                    <button onClick={() => removeItem('education', edu.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                    <input placeholder="University" className="font-bold text-lg bg-transparent w-full mb-2" value={edu.school} onChange={e => {
                      const n = [...resumeData.education]; n[idx].school = e.target.value; setResumeData(p => ({ ...p, education: n }));
                    }} />
                    <input placeholder="Degree" className="text-sm bg-transparent w-full mb-4" value={edu.degree} onChange={e => {
                      const n = [...resumeData.education]; n[idx].degree = e.target.value; setResumeData(p => ({ ...p, education: n }));
                    }} />
                    <div className="grid grid-cols-2 gap-4">
                      <input placeholder="Start Year" value={edu.startYear} className="p-3 bg-white rounded-xl text-sm border" onChange={e => {
                        const n = [...resumeData.education]; n[idx].startYear = e.target.value; setResumeData(p => ({ ...p, education: n }));
                      }} />
                      <input placeholder="End Year" value={edu.endYear} className="p-3 bg-white rounded-xl text-sm border" onChange={e => {
                        const n = [...resumeData.education]; n[idx].endYear = e.target.value; setResumeData(p => ({ ...p, education: n }));
                      }} />
                    </div>
                  </div>
                ))}
                <button onClick={() => addItem('education', { id: Math.random().toString(), school: '', degree: '', location: '', startYear: '', endYear: '' })} className="w-full py-4 border-2 border-dashed rounded-2xl text-slate-400 font-bold hover:border-indigo-200 hover:text-indigo-500 flex justify-center items-center gap-2"><Plus size={18} /> Add Education</button>
              </div>
            </div>
          )}

          {/* Step 3: Projects & GitHub */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">Projects</h2>
                <p className="text-slate-500">Show off your personal or academic coding projects.</p>
              </div>
              <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl space-y-4">
                <div className="flex items-center gap-2 font-bold text-indigo-900"><Github size={20} /> Import from GitHub</div>
                <div className="flex gap-2">
                  <input name="githubUsername" value={resumeData.personalInfo.githubUsername} onChange={handlePersonalChange} placeholder="Username" className="flex-1 p-3 bg-white rounded-xl border outline-none" />
                  <button onClick={handleFetchRepos} disabled={isGenerating === 'github'} className="bg-indigo-600 text-white px-4 rounded-xl font-bold disabled:opacity-50">{isGenerating === 'github' ? '...' : 'Fetch'}</button>
                </div>
                {githubRepos.length > 0 && (
                  <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                    {githubRepos.map(repo => (
                      <div key={repo.id} className="flex justify-between items-center p-2 bg-white rounded-lg border text-xs">
                        <span className="font-bold truncate max-w-[150px]">{repo.title}</span>
                        <button onClick={() => addRepoAsProject(repo)} className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md font-bold">Add</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {resumeData.projects.map((proj, idx) => (
                  <div key={proj.id} className="p-6 bg-slate-50 rounded-2xl border group relative">
                    <button onClick={() => removeItem('projects', proj.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                    <input placeholder="Project Title" className="font-bold text-lg bg-transparent w-full mb-2" value={proj.title} onChange={e => {
                      const n = [...resumeData.projects]; n[idx].title = e.target.value; setResumeData(p => ({ ...p, projects: n }));
                    }} />
                    <textarea placeholder="Description" className="w-full text-sm p-4 rounded-xl mb-3 h-20 outline-none border focus:border-indigo-300" value={proj.description} onChange={e => {
                      const n = [...resumeData.projects]; n[idx].description = e.target.value; setResumeData(p => ({ ...p, projects: n }));
                    }} />
                    <button onClick={() => handleGenerateBullets(proj.id, 'project')} disabled={isGenerating === proj.id} className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors">
                      {isGenerating === proj.id ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />} Improve with AI
                    </button>
                  </div>
                ))}
                <button onClick={() => addItem('projects', { id: Math.random().toString(), title: '', description: '', technologies: [], bulletPoints: [] })} className="w-full py-4 border-2 border-dashed rounded-2xl text-slate-400 font-bold hover:text-indigo-500 flex justify-center items-center gap-2"><Plus size={18} /> Add Project</button>
              </div>
            </div>
          )}

          {/* Step 4: Experience */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">Work Experience</h2>
                <p className="text-slate-500">Internships, volunteering, or part-time jobs.</p>
              </div>
              <div className="space-y-4">
                {resumeData.experience.map((exp, idx) => (
                  <div key={exp.id} className="p-6 bg-slate-50 rounded-2xl border group relative">
                    <button onClick={() => removeItem('experience', exp.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                    <input placeholder="Job Title / Role" className="font-bold text-lg bg-transparent w-full mb-2" value={exp.role} onChange={e => {
                      const n = [...resumeData.experience]; n[idx].role = e.target.value; setResumeData(p => ({ ...p, experience: n }));
                    }} />
                    <input placeholder="Company / Organization" className="text-sm bg-transparent w-full mb-4" value={exp.company} onChange={e => {
                      const n = [...resumeData.experience]; n[idx].company = e.target.value; setResumeData(p => ({ ...p, experience: n }));
                    }} />
                    <textarea placeholder="Briefly describe what you did..." className="w-full text-sm p-4 rounded-xl border h-20 outline-none focus:border-indigo-300" value={exp.description} onChange={e => {
                        const n = [...resumeData.experience]; n[idx].description = e.target.value; setResumeData(p => ({ ...p, experience: n }));
                    }} />
                    <button onClick={() => handleGenerateBullets(exp.id, 'experience')} disabled={isGenerating === exp.id} className="w-full mt-3 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold flex items-center justify-center gap-2">
                       {isGenerating === exp.id ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />} AI Bullet Points
                    </button>
                  </div>
                ))}
                <button onClick={() => addItem('experience', { id: Math.random().toString(), company: '', role: '', startDate: '', endDate: '', current: false, bulletPoints: [], description: '' })} className="w-full py-4 border-2 border-dashed rounded-2xl text-slate-400 font-bold hover:text-indigo-500 flex justify-center items-center gap-2"><Plus size={18} /> Add Experience</button>
              </div>
            </div>
          )}

          {/* Step 5: Skills, Certs & Activities */}
          {currentStep === 4 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Skills */}
              <section className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold">Skills</h2>
                  <p className="text-xs text-slate-500">List languages, frameworks, or tools you know.</p>
                </div>
                <div className="flex gap-2">
                  <input 
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
                    placeholder="e.g. JavaScript, Public Speaking" 
                    className="flex-1 p-3 bg-slate-50 rounded-xl border outline-none focus:border-indigo-500" 
                  />
                  <button onClick={handleAddSkill} className="bg-indigo-600 text-white px-4 rounded-xl font-bold flex items-center gap-1 hover:bg-indigo-700 transition-colors"><Plus size={16} /> Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.map((skill, idx) => (
                    <span key={idx} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2">
                      {skill}
                      <button onClick={() => removeItem('skills', idx)} className="hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                    </span>
                  ))}
                  {resumeData.skills.length === 0 && <p className="text-xs text-slate-300 italic">No skills added yet...</p>}
                </div>
              </section>

              {/* Certifications */}
              <section className="space-y-4 pt-6 border-t">
                <div className="flex items-center gap-2">
                  <Award className="text-indigo-500" size={20} />
                  <h2 className="text-xl font-bold">Certifications</h2>
                </div>
                <div className="space-y-2">
                  {resumeData.certifications.map((cert, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input 
                        value={cert} 
                        onChange={e => {
                          const n = [...resumeData.certifications]; n[idx] = e.target.value; setResumeData(p => ({ ...p, certifications: n }));
                        }} 
                        className="flex-1 p-3 bg-slate-50 rounded-xl border outline-none text-sm" 
                      />
                      <button onClick={() => removeItem('certifications', idx)} className="text-slate-300 hover:text-red-500"><Trash2 size={18} /></button>
                    </div>
                  ))}
                  <button onClick={() => addItem('certifications', 'New Certificate')} className="text-xs text-indigo-600 font-bold flex items-center gap-1 mt-2 px-2 py-1 bg-indigo-50 rounded-lg"><Plus size={14} /> Add Certification</button>
                </div>
              </section>

              {/* Co-curricular Activities */}
              <section className="space-y-4 pt-6 border-t">
                <div className="flex items-center gap-2">
                  <Trophy className="text-amber-500" size={20} />
                  <h2 className="text-xl font-bold">Co-curricular Activities</h2>
                </div>
                <p className="text-xs text-slate-500 italic leading-relaxed">Include sports, clubs, societies, or awards that show your personality and soft skills.</p>
                <div className="space-y-2">
                  {resumeData.activities.map((act, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input 
                        value={act} 
                        onChange={e => {
                          const n = [...resumeData.activities]; n[idx] = e.target.value; setResumeData(p => ({ ...p, activities: n }));
                        }} 
                        className="flex-1 p-3 bg-slate-50 rounded-xl border outline-none text-sm" 
                      />
                      <button onClick={() => removeItem('activities', idx)} className="text-slate-300 hover:text-red-500"><Trash2 size={18} /></button>
                    </div>
                  ))}
                  <button onClick={() => addItem('activities', 'President of Tech Club')} className="text-xs text-amber-600 font-bold flex items-center gap-1 mt-2 px-2 py-1 bg-amber-50 rounded-lg"><Plus size={14} /> Add Activity</button>
                </div>
              </section>
            </div>
          )}

          {/* Step 6: Review */}
          {currentStep === 5 && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 text-center py-8">
              <div className="w-20 h-20 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100"><CheckCircle2 size={40} /></div>
              <h2 className="text-3xl font-bold text-slate-800">Everything Looks Great!</h2>
              <p className="text-slate-500 max-w-sm mx-auto">Your resume is ready for the world. You can download it now or go back to edit any section.</p>
              
              <div className="flex flex-col gap-4 max-w-xs mx-auto pt-6">
                <button 
                  onClick={() => setIsPreviewOpen(true)}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                >
                  <Eye size={20} /> Preview Full Resume
                </button>
                <button 
                  onClick={handlePrint}
                  className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg active:scale-95 shadow-indigo-100"
                >
                  <Download size={20} /> Download PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Nav Controls */}
      <nav className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none no-print">
        <div className="max-w-2xl mx-auto flex justify-between pointer-events-auto">
          <button 
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} 
            disabled={currentStep === 0}
            className="px-8 py-3 bg-white border rounded-full font-bold shadow-lg disabled:opacity-0 active:scale-95"
          >
            Back
          </button>
          <button 
            onClick={() => setCurrentStep(Math.min(STEPS.length - 1, currentStep + 1))}
            disabled={currentStep === STEPS.length - 1}
            className="px-10 py-3 bg-indigo-600 text-white rounded-full font-bold shadow-xl active:scale-95 flex items-center gap-2"
          >
            {currentStep === STEPS.length - 2 ? 'Review' : 'Next'} <ChevronRight size={18} />
          </button>
        </div>
      </nav>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-slate-100 w-full max-w-6xl h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl">
            <header className="p-6 bg-white border-b flex items-center justify-between">
              <button onClick={() => setIsPreviewOpen(false)} className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200"><X size={20} /></button>
              <div className="flex gap-2">
                {(['classic', 'modern', 'minimal'] as TemplateId[]).map(t => (
                  <button key={t} onClick={() => setActiveTemplate(t)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTemplate === t ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500'}`}>{t}</button>
                ))}
              </div>
              <button onClick={handlePrint} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg"><Download size={18} /> PDF</button>
            </header>
            <div className="flex-1 overflow-y-auto p-12 flex justify-center bg-slate-200">
               <ResumePreview data={resumeData} templateId={activeTemplate} />
            </div>
          </div>
        </div>
      )}

      {/* Print rendering */}
      <div className="hidden print:block">
        <ResumePreview data={resumeData} templateId={activeTemplate} />
      </div>
    </div>
  );
};

export default App;
