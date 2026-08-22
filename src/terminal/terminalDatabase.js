import publications from '../data/researchmap/publications.json';
import presentations from '../data/researchmap/presentations.json';
import researchProjects from '../data/researchmap/researchProjects.json';
import profile from '../data/profile.json';
import artwork from '../data/portfolio/artwork.json';
import skills from '../data/portfolio/skills.json';
import experience from '../data/portfolio/experience.json';
import inspirations from '../data/portfolio/inspirations.json';
import scores from '../data/portfolio/scores.json';
import contact from '../data/portfolio/contact.json';

export const ROOT_DIRECTORY = 'portfolio';

export const welcomeOutput = [
  { type: 'system', text: 'NieR OS Terminal [Version 1.0]' },
  { type: 'system', text: '(c) 2026 Kosuke Shimizu. All rights reserved.' },
  { type: 'system', text: 'Type "/help" for available commands.' },
  { type: 'system', text: '' }
];

const titleText = (title) => {
  if (typeof title === 'string') {
    return title;
  }

  return title?.en || title?.ja || 'Untitled';
};

const researchmapRecordToFile = (record, fallbackName) => ({
  name: fallbackName,
  body: [
    `ID: ${record.id}`,
    `TYPE: ${record.type}`,
    `TITLE: ${titleText(record.title)}`,
    record.authors ? `AUTHORS: ${record.authors.join(', ')}` : null,
    record.presenters ? `PRESENTERS: ${record.presenters.join(', ')}` : null,
    record.year ? `YEAR: ${record.year}` : null,
    record.journal ? `JOURNAL: ${record.journal}` : null,
    record.event ? `EVENT: ${record.event}` : null,
    record.doi ? `DOI: ${record.doi}` : null,
    record.url ? `URL: ${record.url}` : null,
    record.abstract || record.summary ? `SUMMARY:\n${record.abstract || record.summary}` : null,
    record.researchQuestions?.length
      ? `RESEARCH QUESTIONS:\n${record.researchQuestions
          .map(
            (question) =>
              `${question.id}: ${question.question}\n  ${question.title}\n  Keywords: ${question.keywords.join(', ')}`
          )
          .join('\n')}`
      : null,
    record.relatedInterests?.length
      ? `RELATED INTERESTS: ${record.relatedInterests.join(', ')}`
      : null,
    record.tags?.length ? `TAGS: ${record.tags.join(', ')}` : null,
    `VISIBILITY: ${record.visibility || 'public'}`
  ]
    .filter(Boolean)
    .join('\n')
});

const portfolioRecordToFile = (record) => ({
  name: record.fileName,
  hiddenFlag: record.unlockFlag,
  body: [
    `ID: ${record.id}`,
    `TITLE: ${record.title}`,
    record.role ? `ROLE: ${record.role}` : null,
    record.kind ? `KIND: ${record.kind}` : null,
    record.period ? `PERIOD: ${record.period}` : null,
    record.year ? `YEAR: ${record.year}` : null,
    record.url ? `URL: ${record.url}` : null,
    record.description ? `DESCRIPTION:\n${record.description}` : null,
    record.notes ? `NOTES:\n${record.notes}` : null,
    record.visibility ? `VISIBILITY: ${record.visibility}` : null
  ]
    .filter(Boolean)
    .join('\n')
});

const profileFiles = [
  {
    name: 'overview.md',
    body: [
      `# ${titleText(profile.portfolioTheme)}`,
      '',
      profile.overview,
      '',
      '## Side Interests',
      ...profile.sideInterests.map((interest) => `- ${interest}`)
    ].join('\n')
  },
  {
    name: 'research_stance.md',
    body: ['# Research Stance', '', profile.researchStance].join('\n')
  },
  {
    name: 'research_threads.md',
    body: [
      '# Research Threads',
      '',
      ...profile.researchThreads.flatMap((thread) => [
        `## ${thread.id}: ${thread.label}`,
        thread.summary,
        ''
      ])
    ].join('\n')
  }
];

const filesByDirectory = {
  profile: profileFiles,
  publications: publications.map((record, index) =>
    researchmapRecordToFile(record, `publication_${index + 1}.json`)
  ),
  presentations: presentations.map((record, index) =>
    researchmapRecordToFile(record, `presentation_${index + 1}.json`)
  ),
  research_projects: researchProjects.map((record, index) =>
    researchmapRecordToFile(record, `research_project_${index + 1}.json`)
  ),
  artwork: artwork.map(portfolioRecordToFile),
  skills: skills.map(portfolioRecordToFile),
  experience: experience.map(portfolioRecordToFile),
  contact: contact.map(portfolioRecordToFile),
  inspirations: inspirations.map(portfolioRecordToFile),
  scores: scores.map(portfolioRecordToFile)
};

export const terminalDirectories = {
  portfolio: {
    label: 'Portfolio Database Root',
    children: ['profile', 'researchmap', 'portfolio_records', 'experience', 'artwork', 'skills', 'contact'],
    hiddenChildren: [
      { name: 'inspirations', flag: 'inspirationsVisible' },
      { name: 'scores', flag: 'scoresVisible' }
    ]
  },
  researchmap: {
    label: 'Researchmap-Compatible Records',
    children: ['publications', 'presentations', 'research_projects']
  },
  profile: {
    label: 'Portfolio and CV Profile',
    files: filesByDirectory.profile
  },
  research: {
    label: 'Research Records',
    children: ['publications', 'presentations', 'research_projects']
  },
  portfolio_records: {
    label: 'Portfolio-Specific Records',
    children: ['experience', 'artwork', 'skills', 'contact']
  },
  experience: {
    label: 'Professional Experience',
    files: filesByDirectory.experience
  },
  publications: {
    label: 'Published Papers',
    files: filesByDirectory.publications
  },
  presentations: {
    label: 'Presentations',
    files: filesByDirectory.presentations
  },
  research_projects: {
    label: 'Research Projects',
    files: filesByDirectory.research_projects
  },
  artwork: {
    label: 'Artwork Records',
    files: filesByDirectory.artwork
  },
  skills: {
    label: 'Skill Matrix',
    files: filesByDirectory.skills
  },
  contact: {
    label: 'Contact Records',
    files: filesByDirectory.contact
  },
  inspirations: {
    label: 'Inspiration Sources',
    files: filesByDirectory.inspirations
  },
  scores: {
    label: 'Music Score Archive',
    files: filesByDirectory.scores
  }
};

export const sectionByDirectory = {
  portfolio: 'home',
  profile: 'home',
  researchmap: 'research',
  research: 'research',
  portfolio_records: 'home',
  experience: 'home',
  publications: 'publications',
  presentations: 'research',
  research_projects: 'research',
  artwork: 'artwork',
  skills: 'skills',
  contact: 'contact',
  inspirations: 'inspirations',
  scores: 'scores'
};
