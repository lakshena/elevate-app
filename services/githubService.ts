
import { Project } from '../types';

export const fetchGithubRepos = async (username: string): Promise<Partial<Project>[]> => {
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
    if (!response.ok) throw new Error('User not found');
    const data = await response.json();
    
    return data.map((repo: any) => ({
      id: String(repo.id),
      title: repo.name,
      description: repo.description || '',
      technologies: repo.language ? [repo.language] : [],
      githubUrl: repo.html_url,
      bulletPoints: []
    }));
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    return [];
  }
};
