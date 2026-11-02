import { config, repo, type AgentConfig } from './config';
import { withBase } from './url';

/** One install command for one agent. Every snippet is rendered into the
    page; the header dropdown decides which one is visible. */
export interface InstallSnippet {
  agent: AgentConfig;
  script: string;
}

/** Site-relative URL of a skill's downloadable `.skill` archive. */
export function downloadUrl(name: string): string {
  return withBase(`/downloads/${name}.skill`);
}

/** Link to the skill's source folder in the GitHub repository. */
export function sourceUrl(name: string): string {
  return `https://github.com/${repo.slug}/tree/${repo.branch}/skills/${name}`;
}

/** `npx skills add` for the whole library, one per agent. */
export function librarySnippets(): InstallSnippet[] {
  return config.agents.map((agent) => ({
    agent,
    script: `npx skills add ${repo.slug} -a ${agent.skillsAgent}`,
  }));
}

/** `npx skills add` for a single skill, one per agent. */
export function skillSnippets(name: string): InstallSnippet[] {
  return config.agents.map((agent) => ({
    agent,
    script: `npx skills add ${repo.slug} --skill ${name} -a ${agent.skillsAgent}`,
  }));
}
