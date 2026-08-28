import { config, repo, type AgentConfig } from './config';
import { withBase } from './url';

export type ItemType = 'skill' | 'command';

export interface InstallSnippet {
  agent: AgentConfig;
  /** Shell commands that install the item for this agent. */
  script: string;
  /** Where the item ends up, for the manual-install note. */
  destination: string;
}

/** Expands the `{placeholder}` tokens allowed in config.yaml agent entries. */
function expand(template: string, tokens: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => tokens[key] ?? match);
}

/** Absolute URL of the downloadable artifact for an item. */
export function downloadUrl(type: ItemType, name: string, site: URL | undefined): string {
  const path = withBase(`/downloads/${name}${type === 'skill' ? '.skill' : '.md'}`);
  return site ? new URL(path, site).href : path;
}

/** Link to the item's source in the GitHub repository. */
export function sourceUrl(type: ItemType, name: string): string {
  const path = type === 'skill' ? `skills/${name}` : `commands/${name}.md`;
  return `https://github.com/${repo.slug}/blob/${repo.branch}/${path}`;
}

export interface MarketplaceSnippet {
  agent: AgentConfig;
  /** The command that installs the whole library for this agent. */
  script: string;
}

/**
 * One "install the whole library" command per agent that has a plugin
 * ecosystem. Agents without a `marketplace` entry in config.yaml are omitted,
 * and the hero hides its block for them.
 */
export function marketplaceSnippets(): MarketplaceSnippet[] {
  // flatMap rather than filter+map so the narrowing survives into the body.
  return config.agents.flatMap((agent) =>
    agent.marketplace
      ? [
          {
            agent,
            script: expand(agent.marketplace, {
              owner: repo.owner,
              repo: repo.name,
              slug: repo.slug,
              branch: repo.branch,
            }),
          },
        ]
      : [],
  );
}

/**
 * Builds one install snippet per configured agent. Every snippet is rendered
 * into the page; the header dropdown decides which one is visible.
 */
export function installSnippets(type: ItemType, name: string, site: URL | undefined): InstallSnippet[] {
  const url = downloadUrl(type, name, site);

  return config.agents.map((agent) => {
    const tokens = {
      name,
      owner: repo.owner,
      repo: repo.name,
      slug: repo.slug,
      branch: repo.branch,
      downloadUrl: url,
      skillDir: agent.skillDir,
    };

    if (type === 'skill') {
      const dir = expand(agent.skillDir, tokens);
      return {
        agent,
        destination: `${dir}/${name}/`,
        script: [
          `mkdir -p ${dir}`,
          `curl -fsSL ${url} -o /tmp/${name}.skill`,
          `unzip -o /tmp/${name}.skill -d ${dir}`,
        ].join('\n'),
      };
    }

    const destination = expand(agent.commandPath, tokens);
    const dir = destination.includes('/') ? destination.slice(0, destination.lastIndexOf('/')) : '.';
    return {
      agent,
      destination,
      script: [`mkdir -p ${dir}`, `curl -fsSL ${url} -o ${destination}`].join('\n'),
    };
  });
}
