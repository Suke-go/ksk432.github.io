import { ROOT_DIRECTORY, sectionByDirectory, terminalDirectories } from './terminalDatabase';

export const commandHelp = [
  ['/help', 'Show available commands'],
  ['/clear', 'Clear terminal output'],
  ['/show:inspirations', 'Unlock inspiration records'],
  ['/show:projects', 'Unlock hidden artwork records'],
  ['/show:scores', 'Unlock music score records'],
  ['/about:nier', 'Show NieR: Automata reference note'],
  ['/about:gits', 'Show Ghost in the Shell reference note'],
  ['/about:harmony', 'Show Harmony reference note'],
  ['/matrix', 'Run visual terminal effect'],
  ['cd [directory]', 'Move through portfolio records'],
  ['ls', 'List records in current directory'],
  ['pwd', 'Print current database path'],
  ['cat [file]', 'Read a record in current directory']
];

const helpText = `Available commands:
${commandHelp.map(([name, description]) => `  ${name.padEnd(22)} - ${description}`).join('\n')}`;

const visibleEntries = (directoryName, hiddenContent) => {
  const directory = terminalDirectories[directoryName];
  if (!directory) {
    return [];
  }

  const visibleDirectories = [
    ...(directory.children || []),
    ...(directory.hiddenChildren || [])
      .filter((child) => hiddenContent[child.flag])
      .map((child) => child.name)
  ].map((name) => ({ name, kind: 'directory' }));

  const visibleFiles = (directory.files || [])
    .filter((file) => !file.hiddenFlag || hiddenContent[file.hiddenFlag])
    .map((file) => ({ ...file, kind: 'file' }));

  return [...visibleDirectories, ...visibleFiles];
};

const listDirectory = (directoryName, hiddenContent) => {
  const entries = visibleEntries(directoryName, hiddenContent);
  if (entries.length === 0) {
    return 'No records in this directory';
  }

  return entries
    .map((entry) => {
      const isDirectory = entry.kind === 'directory';
      return `${isDirectory ? 'drwxr-xr-x' : '-rw-r--r--'}  ${entry.name}${isDirectory ? '/' : ''}`;
    })
    .join('\n');
};

const readFile = (directoryName, fileName, hiddenContent) => {
  const file = visibleEntries(directoryName, hiddenContent).find(
    (entry) => entry.kind === 'file' && entry.name === fileName
  );

  if (!file) {
    return { type: 'error', text: `File not found: ${fileName}` };
  }

  return { type: 'output', text: file.body };
};

const changeDirectory = (targetDirectory, state) => {
  const normalizedTarget = targetDirectory.trim();

  if (normalizedTarget === '..' || normalizedTarget === '~' || normalizedTarget === '/') {
    if (normalizedTarget === '..' && state.currentDirectory === ROOT_DIRECTORY) {
      return {
        output: [{ type: 'error', text: 'Already at root directory' }]
      };
    }

    return {
      output: [{ type: 'output', text: 'Changed directory to ~/portfolio' }],
      nextDirectory: ROOT_DIRECTORY,
      nextSection: 'home'
    };
  }

  if (!terminalDirectories[normalizedTarget]) {
    return {
      output: [{ type: 'error', text: `Directory not found: ${normalizedTarget}` }]
    };
  }

  const nextHiddenContent = { ...state.hiddenContent };
  const output = [
    { type: 'output', text: `Changed directory to ~/portfolio/${normalizedTarget}` }
  ];

  if (normalizedTarget === 'scores' && !nextHiddenContent.scoresVisible) {
    nextHiddenContent.scoresVisible = true;
    output.push({ type: 'output', text: 'Revealed hidden scores section.' });
  }

  if (normalizedTarget === 'inspirations' && !nextHiddenContent.inspirationsVisible) {
    nextHiddenContent.inspirationsVisible = true;
    output.push({ type: 'output', text: 'Revealed inspirations section.' });
  }

  return {
    output,
    nextDirectory: normalizedTarget,
    nextSection: sectionByDirectory[normalizedTarget] || normalizedTarget,
    nextHiddenContent
  };
};

const showSection = (section, flagName, message, hiddenContent) => ({
  output: [{ type: 'output', text: message }],
  nextDirectory: section,
  nextSection: sectionByDirectory[section] || section,
  nextHiddenContent: {
    ...hiddenContent,
    [flagName]: true
  }
});

export const executeTerminalCommand = (command, state) => {
  if (command.startsWith('cd ')) {
    return changeDirectory(command.substring(3), state);
  }

  if (command === 'ls' || command === 'dir') {
    return {
      output: [{ type: 'output', text: listDirectory(state.currentDirectory, state.hiddenContent) }]
    };
  }

  if (command === 'pwd') {
    return {
      output: [
        {
          type: 'output',
          text: `/home/kosuke/portfolio${
            state.currentDirectory !== ROOT_DIRECTORY ? '/' + state.currentDirectory : ''
          }`
        }
      ]
    };
  }

  if (command.startsWith('/show:inspirations')) {
    return showSection(
      'inspirations',
      'inspirationsVisible',
      'Revealing inspirations section...',
      state.hiddenContent
    );
  }

  if (command.startsWith('/show:projects')) {
    return showSection(
      'artwork',
      'secretProjectVisible',
      'Revealing hidden projects...',
      state.hiddenContent
    );
  }

  if (command.startsWith('/show:scores')) {
    return showSection(
      'scores',
      'scoresVisible',
      'Revealing music scores section...',
      state.hiddenContent
    );
  }

  if (command.startsWith('/help')) {
    return { output: [{ type: 'output', text: helpText }] };
  }

  if (command.startsWith('/about:nier')) {
    return { output: [readFile('inspirations', 'nier_automata.txt', state.hiddenContent)] };
  }

  if (command.startsWith('/about:gits')) {
    return {
      output: [readFile('inspirations', 'ghost_in_the_shell.txt', state.hiddenContent)]
    };
  }

  if (command.startsWith('/about:harmony')) {
    return { output: [readFile('inspirations', 'harmony.txt', state.hiddenContent)] };
  }

  if (command.startsWith('cat ')) {
    return {
      output: [readFile(state.currentDirectory, command.substring(4).trim(), state.hiddenContent)]
    };
  }

  if (command.startsWith('/clear')) {
    return { clear: true };
  }

  if (command.startsWith('/matrix')) {
    return {
      output: [{ type: 'special', text: 'matrix' }],
      effect: 'matrix'
    };
  }

  return {
    output: [
      {
        type: 'error',
        text: `Command not recognized: ${command}. Type /help for available commands.`
      }
    ]
  };
};
