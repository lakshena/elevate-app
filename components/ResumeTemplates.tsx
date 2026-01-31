
import React, { useMemo } from 'react';
import { ResumeData, TemplateId, Education } from '../types';

interface TemplateProps {
  data: ResumeData;
  templateId: TemplateId;
}

export const ResumePreview: React.FC<TemplateProps> = ({ data, templateId }) => {
  const { personalInfo, education, skills, projects, experience, certifications, activities, settings } = data;

  const sortedEducation = useMemo(() => {
    return [...education].sort((a, b) => {
      const getYear = (year: string) => {
        const y = year.toLowerCase();
        return y === 'present' || !year ? 9999 : parseInt(year);
      };
      const yearA = getYear(a.endYear);
      const yearB = getYear(b.endYear);
      
      if (yearA !== yearB) {
        return settings.educationOrder === 'desc' ? yearB - yearA : yearA - yearB;
      }
      
      const startA = parseInt(a.startYear) || 0;
      const startB = parseInt(b.startYear) || 0;
      return settings.educationOrder === 'desc' ? startB - startA : startA - startB;
    });
  }, [education, settings.educationOrder]);

  const renderHeader = () => (
    <div className="mb-6 text-center border-b pb-6">
      <h1 className="text-4xl font-extrabold uppercase tracking-tighter text-slate-900 mb-1">
        {personalInfo.fullName || 'Your Name'}
      </h1>
      <p className="text-sm font-semibold text-indigo-600 uppercase tracking-widest mb-3">
        {personalInfo.headline}
      </p>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-slate-500 font-medium">
        {personalInfo.email && <span className="flex items-center">{personalInfo.email}</span>}
        {personalInfo.phone && <span className="flex items-center">• {personalInfo.phone}</span>}
        {personalInfo.location && <span className="flex items-center">• {personalInfo.location}</span>}
        {personalInfo.linkedinUrl && <span className="flex items-center">• {personalInfo.linkedinUrl.replace(/^https?:\/\//, '')}</span>}
        {personalInfo.githubUsername && <span className="flex items-center">• github.com/{personalInfo.githubUsername}</span>}
      </div>
    </div>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <div className="flex items-center gap-3 mb-3 mt-6 first:mt-0">
      <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{title}</h2>
      <div className="flex-1 h-[1px] bg-slate-100"></div>
    </div>
  );

  return (
    <div 
      id="resume-document" 
      className={`bg-white p-12 shadow-2xl mx-auto w-full max-w-[816px] overflow-hidden text-left ${
        templateId === 'modern' ? 'font-sans' : 'font-serif'
      }`}
      style={{ minHeight: '1056px' }}
    >
      {renderHeader()}

      <div className="space-y-2">
        {/* Education Timeline */}
        <section>
          <SectionTitle title="Education" />
          <div className="relative pl-4 ml-1 space-y-6">
            {/* Timeline Vertical Line */}
            {sortedEducation.length > 0 && (
              <div className="absolute left-0 top-1 bottom-1 w-[1px] bg-slate-100"></div>
            )}
            
            {sortedEducation.length > 0 ? sortedEducation.map((edu) => (
              <div key={edu.id} className="relative">
                {/* Timeline Dot */}
                <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full border border-white bg-indigo-500 shadow-[0_0_0_2px_rgba(99,102,241,0.1)]"></div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-[13px] text-slate-900">{edu.school}</h3>
                    <p className="text-[12px] text-indigo-600 font-medium">{edu.degree}</p>
                  </div>
                  <div className="text-right text-[11px] text-slate-500">
                    <p className="font-bold uppercase tracking-wider">{edu.startYear} — {edu.endYear || 'Present'}</p>
                    {edu.gpa && <p className="font-medium">GPA: {edu.gpa}</p>}
                  </div>
                </div>
              </div>
            )) : <p className="text-[11px] text-slate-400 italic pl-2">No education entries added yet.</p>}
          </div>
        </section>

        {/* Skills */}
        <section>
          <SectionTitle title="Core Competencies" />
          <div className="flex flex-wrap gap-x-3 gap-y-2">
            {skills.length > 0 ? skills.map((skill, idx) => (
              <span key={idx} className="text-[11px] font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                {skill}
              </span>
            )) : <p className="text-[11px] text-slate-400 italic">No skills listed.</p>}
          </div>
        </section>

        {/* Experience */}
        {experience.length > 0 && (
          <section>
            <SectionTitle title="Professional Experience" />
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-[13px] text-slate-900">{exp.role}</h3>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">{exp.startDate} — {exp.current ? 'Present' : exp.endDate}</p>
                  </div>
                  <p className="text-[12px] font-semibold text-indigo-600 mb-1">{exp.company}</p>
                  <ul className="list-disc ml-4 space-y-1">
                    {exp.bulletPoints.map((bp, i) => (
                      <li key={i} className="text-[11px] leading-relaxed text-slate-700">{bp}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        <section>
          <SectionTitle title="Technical Projects" />
          <div className="space-y-4">
            {projects.length > 0 ? projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-[13px] text-slate-900">{proj.title}</h3>
                  <div className="flex gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                    {proj.technologies.slice(0, 3).map((t, i) => <span key={i}>{t}</span>)}
                  </div>
                </div>
                <ul className="list-disc ml-4 mt-1 space-y-1">
                  {proj.bulletPoints.map((bp, i) => (
                    <li key={i} className="text-[11px] leading-relaxed text-slate-700">{bp}</li>
                  ))}
                  {proj.bulletPoints.length === 0 && <li className="text-[11px] text-slate-400 italic">Describe your project achievements...</li>}
                </ul>
              </div>
            )) : <p className="text-[11px] text-slate-400 italic">No projects listed.</p>}
          </div>
        </section>

        {/* Co-curricular & Certifications */}
        {(certifications.length > 0 || activities.length > 0) && (
          <div className="grid grid-cols-2 gap-8">
            {certifications.length > 0 && (
              <section>
                <SectionTitle title="Certifications" />
                <ul className="list-disc ml-4 space-y-1">
                  {certifications.map((cert, i) => (
                    <li key={i} className="text-[11px] text-slate-700">{cert}</li>
                  ))}
                </ul>
              </section>
            )}
            {activities.length > 0 && (
              <section>
                <SectionTitle title="Activities" />
                <ul className="list-disc ml-4 space-y-1">
                  {activities.map((act, i) => (
                    <li key={i} className="text-[11px] text-slate-700">{act}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
