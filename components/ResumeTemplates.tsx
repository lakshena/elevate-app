
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
      const getYear = (year: string) => (year.toLowerCase() === 'present' || !year ? 9999 : parseInt(year));
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
    <div className="mb-6 text-center border-b pb-4">
      <h1 className="text-3xl font-bold uppercase tracking-tight text-slate-900">{personalInfo.fullName || 'Your Name'}</h1>
      <p className="text-sm text-slate-600 mt-1">{personalInfo.headline}</p>
      <div className="flex flex-wrap justify-center gap-3 mt-2 text-xs text-slate-600">
        {personalInfo.email && <span>{personalInfo.email}</span>}
        {personalInfo.phone && <span>• {personalInfo.phone}</span>}
        {personalInfo.location && <span>• {personalInfo.location}</span>}
        {personalInfo.linkedinUrl && <span className="text-blue-600 font-medium">LinkedIn</span>}
        {personalInfo.githubUsername && <span className="text-slate-800 font-medium">GitHub</span>}
      </div>
    </div>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800 border-b border-slate-200 mb-2 mt-4">{title}</h2>
  );

  return (
    <div id="resume-document" className={`bg-white p-8 shadow-2xl mx-auto min-h-[1056px] w-[816px] overflow-hidden text-left ${templateId === 'modern' ? 'font-sans' : 'font-serif'}`}>
      {renderHeader()}

      <div className="space-y-4">
        {/* Education */}
        <section>
          <SectionTitle title="Education" />
          {sortedEducation.map((edu) => (
            <div key={edu.id} className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-sm">{edu.school}</h3>
                <p className="text-xs italic">{edu.degree}</p>
              </div>
              <div className="text-right text-xs">
                <p>{edu.location}</p>
                <p>{edu.startYear} - {edu.endYear || 'Present'}</p>
                {edu.gpa && <p className="font-medium">GPA: {edu.gpa}</p>}
              </div>
            </div>
          ))}
        </section>

        {/* Skills */}
        <section>
          <SectionTitle title="Skills" />
          <div className="flex flex-wrap gap-2 text-xs">
            {skills.map((skill, idx) => (
              <span key={idx} className="bg-slate-50 px-2 py-0.5 border border-slate-200 rounded">
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Experience */}
        {experience.length > 0 && (
          <section>
            <SectionTitle title="Experience" />
            {experience.map((exp) => (
              <div key={exp.id} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm">{exp.role}</h3>
                    <p className="text-xs text-slate-700">{exp.company}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p>{exp.location}</p>
                    <p>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                  </div>
                </div>
                <ul className="list-disc ml-4 mt-1 text-xs space-y-0.5 text-slate-700">
                  {exp.bulletPoints.map((bp, i) => <li key={i}>{bp}</li>)}
                </ul>
              </div>
            ))}
          </section>
        )}

        {/* Projects */}
        <section>
          <SectionTitle title="Academic & Personal Projects" />
          {projects.map((proj) => (
            <div key={proj.id} className="mb-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm">
                  {proj.title} <span className="text-xs font-normal text-slate-500 ml-2">| {proj.technologies.join(', ')}</span>
                </h3>
              </div>
              <ul className="list-disc ml-4 mt-1 text-xs space-y-0.5 text-slate-700">
                {proj.bulletPoints.map((bp, i) => <li key={i}>{bp}</li>)}
                {proj.bulletPoints.length === 0 && <li className="italic opacity-50">Draft details to showcase impact...</li>}
              </ul>
            </div>
          ))}
        </section>

        {/* Certifications */}
        {certifications.length > 0 && (
          <section>
            <SectionTitle title="Certifications" />
            <ul className="list-disc ml-4 text-xs space-y-0.5 text-slate-700">
              {certifications.map((cert, i) => <li key={i}>{cert}</li>)}
            </ul>
          </section>
        )}

        {/* Co-curricular Activities */}
        {activities.length > 0 && (
          <section>
            <SectionTitle title="Co-curricular Activities" />
            <ul className="list-disc ml-4 text-xs space-y-0.5 text-slate-700">
              {activities.map((act, i) => <li key={i}>{act}</li>)}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};
