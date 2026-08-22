import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Terminal } from 'lucide-react';
import { executeTerminalCommand } from './terminal/terminalCommands';
import { ROOT_DIRECTORY, welcomeOutput } from './terminal/terminalDatabase';
import profile from './data/profile.json';
import publications from './data/researchmap/publications.json';
import presentations from './data/researchmap/presentations.json';
import researchProjects from './data/researchmap/researchProjects.json';
import artwork from './data/portfolio/artwork.json';
import skills from './data/portfolio/skills.json';
import experience from './data/portfolio/experience.json';
import inspirations from './data/portfolio/inspirations.json';
import scores from './data/portfolio/scores.json';
import contact from './data/portfolio/contact.json';
import jglobal from './data/jglobal.json';
import './App.css';

const textValue = (value) => {
  if (typeof value === 'string') {
    return value;
  }

  return value?.ja || value?.en || '';
};

const SectionHeading = ({ kicker, title, children }) => (
  <div className="cv-section-heading">
    <p className="cv-kicker">{kicker}</p>
    <h2>{title}</h2>
    {children && <p className="cv-section-lead">{children}</p>}
  </div>
);

const RecordList = ({ records, getTitle, getMeta, getBody }) => (
  <div className="cv-record-list">
    {records.map((record) => (
      <article className="cv-record" key={record.id}>
        <div>
          <h3>{getTitle(record)}</h3>
          {getMeta(record) && <p className="cv-record-meta">{getMeta(record)}</p>}
        </div>
        {getBody(record) && <p>{getBody(record)}</p>}
      </article>
    ))}
  </div>
);

const cvNavShortcuts = [
  { label: 'Research', section: 'research' },
  { label: 'Publications', section: 'publications' },
  { label: 'Skills', section: 'skills' },
  { label: 'Contact', section: 'contact' }
];

const terminalShortcuts = [
  { label: 'Profile', command: 'cd profile' },
  { label: 'Research DB', command: 'cd researchmap' },
  { label: 'Experience', command: 'cd experience' },
  { label: 'Artwork', command: 'cd artwork' },
  { label: 'Unlock Notes', command: '/show:inspirations' }
];

const TerminalView = ({
  currentDirectory,
  terminalInput,
  terminalOutput,
  setTerminalInput,
  processTerminalCommand,
  onClose
}) => (
  <section className="terminal-page">
    <div className="terminal-page-motion" aria-hidden="true">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div className="terminal-page-shell">
      <header className="terminal-page-header">
        <div>
          <p>Terminal Database</p>
          <h1>kosuke@tsukuba:~/{currentDirectory}</h1>
        </div>
        <button type="button" onClick={onClose}>
          Return to CV
        </button>
      </header>

      <div className="terminal-shortcuts">
        {terminalShortcuts.map((shortcut) => (
          <button
            key={shortcut.command}
            type="button"
            onClick={() => processTerminalCommand(shortcut.command)}
          >
            {shortcut.label}
          </button>
        ))}
      </div>

      <div className="terminal-page-output">
        {terminalOutput.map((item, index) => (
          <div
            key={index}
            className={`terminal-line ${
              item.type === 'input'
                ? 'terminal-input-line'
                : item.type === 'error'
                ? 'terminal-error-line'
                : item.type === 'system'
                ? 'terminal-system-line'
                : item.type === 'special'
                ? 'hidden'
                : 'terminal-output-line'
            }`}
          >
            {item.type === 'input'
              ? `kosuke@tsukuba:~/${item.directory || currentDirectory}$ ${item.text}`
              : item.text}
          </div>
        ))}
      </div>

      <form
        className="terminal-page-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (terminalInput.trim()) {
            processTerminalCommand(terminalInput.trim());
          }
        }}
      >
        <span>kosuke@tsukuba:~/{currentDirectory}$</span>
        <input
          type="text"
          value={terminalInput}
          onChange={(e) => setTerminalInput(e.target.value)}
          placeholder="Type a command... (/help)"
          autoFocus
          spellCheck="false"
          autoComplete="off"
        />
      </form>
    </div>
  </section>
);

// P5.js sketch for the interactive background
const P5Background = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const container = canvasRef.current;
    let particles = [];
    
    const sketch = (p) => {
      p.setup = () => {
        const canvas = p.createCanvas(window.innerWidth, window.innerHeight);
        canvas.position(0, 0);
        canvas.style('z-index', '-1');
        
        // Create particles
        for (let i = 0; i < 50; i++) {
          particles.push({
            position: p.createVector(p.random(p.width), p.random(p.height)),
            velocity: p.createVector(p.random(-0.2, 0.2), p.random(-0.2, 0.2)),
            size: p.random(2, 4)
          });
        }
      };
      
      p.draw = () => {
        p.clear();
        
        // Update and display particles
        particles.forEach((particle, i) => {
          // Update position
          particle.position.add(particle.velocity);
          
          // Boundary check
          if (particle.position.x < 0 || particle.position.x > p.width) {
            particle.velocity.x *= -1;
          }
          if (particle.position.y < 0 || particle.position.y > p.height) {
            particle.velocity.y *= -1;
          }
          
          // Display particle
          p.noStroke();
          p.fill(220, 40);
          p.ellipse(particle.position.x, particle.position.y, particle.size);
          
          // Connect nearby particles
          for (let j = i + 1; j < particles.length; j++) {
            const other = particles[j];
            const d = p.dist(particle.position.x, particle.position.y, other.position.x, other.position.y);
            
            if (d < 150) {
              p.stroke(220, p.map(d, 0, 150, 50, 0));
              p.line(particle.position.x, particle.position.y, other.position.x, other.position.y);
            }
          }
        });
      };
      
      p.windowResized = () => {
        p.resizeCanvas(window.innerWidth, window.innerHeight);
      };
    };
    
    // Import p5 dynamically
    import('https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.min.js')
      .then(p5Module => {
        const p5 = p5Module.default;
        new p5(sketch, container);
      })
      .catch(err => console.error('Could not load p5.js', err));
    
    return () => {
      // Cleanup
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
    };
  }, []);
  
  return <div ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none"></div>;
};


const Portfolio = () => {
  // Initialize all state variables
  const [activeSection, setActiveSection] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [currentDirectory, setCurrentDirectory] = useState(ROOT_DIRECTORY);
  const [hiddenContent, setHiddenContent] = useState({
    inspirationsVisible: false,
    secretProjectVisible: false,
    scoresVisible: false,
  });
  const [loading, setLoading] = useState(true);
  const [bootPhase, setBootPhase] = useState(0);
  
  // Simulate boot sequence
  useEffect(() => {
    const bootSequence = [
      'Initializing YoRHa Interface...',
      'Memory Unit: Green',
      'Initializing Tactical Log',
      'Loading Portfolio Data',
      'Vitals: Green',
      'Remaining MP: 100%',
      'Black Box Temperature: Normal',
      'Black Box Internal Pressure: Normal',
      'Activating IFF',
      'Activating FCS',
      'Initializing Pod Connection',
      'Launching DBU Setup',
      'Activating Environmental Sensors',
      'Equipment Authentication: Complete',
      'Equipment Status: Green',
      'All Systems Green',
      'Portfolio Preparations Complete'
    ];
    
    let currentPhase = 0;
    const bootInterval = setInterval(() => {
      if (currentPhase < bootSequence.length) {
        setBootPhase(currentPhase);
        currentPhase++;
      } else {
        clearInterval(bootInterval);
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    }, 180);
    
    return () => clearInterval(bootInterval);
  }, []);
  
  // Show welcome message in terminal
  useEffect(() => {
    if (terminalOpen && terminalOutput.length === 0) {
      setTerminalOutput(welcomeOutput);
    }
  }, [terminalOpen, terminalOutput]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  const navigateTo = (section) => {
    if (section) {
      setActiveSection(section);
      setTerminalOpen(false);
      setMenuOpen(false);
      // Update terminal path to reflect navigation
      if (section !== 'home') {
        setCurrentDirectory(section);
      } else {
        setCurrentDirectory(ROOT_DIRECTORY);
      }
    }
  };

  const openTerminal = () => {
    setTerminalOpen(true);
    setMenuOpen(false);
  };

  const closeTerminal = () => {
    setTerminalOpen(false);
  };

  const processTerminalCommand = (command) => {
    const newOutput = [...terminalOutput];
    newOutput.push({ type: 'input', text: command, directory: currentDirectory });

    const result = executeTerminalCommand(command, {
      currentDirectory,
      hiddenContent
    });

    if (result.clear) {
      setTerminalOutput(welcomeOutput);
      setTerminalInput('');
      return;
    }

    newOutput.push(...(result.output || []));

    if (result.nextDirectory) {
      setCurrentDirectory(result.nextDirectory);
    }

    if (result.nextSection) {
      setActiveSection(result.nextSection);
      setMenuOpen(false);
    }

    if (result.nextHiddenContent) {
      setHiddenContent(result.nextHiddenContent);
    }

    if (result.effect === 'matrix') {
      setTimeout(() => {
        const terminalEl = document.querySelector('.terminal-container');
        if (terminalEl) {
          terminalEl.classList.add('matrix-effect');
          setTimeout(() => {
            terminalEl.classList.remove('matrix-effect');
          }, 5000);
        }
      }, 100);
    }

    setTerminalOutput(newOutput);
    setTerminalInput('');
  };
  
  return (
    <div className="site-shell">
      {loading ? (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
          <div className="loading-container w-full max-w-xl p-10">
            <div className="mb-6 text-center">
              <h1 className="text-2xl mb-2 loading-title glitch-text-subtle">
                LOADING - BOOTING SYSTEM...
              </h1>
              <div className="h-1 w-full bg-gray-800 mb-4">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${(bootPhase / 17) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="terminal-like-boot p-4 bg-black bg-opacity-50 border border-gray-700 h-72 overflow-hidden relative">
              <div className="boot-text-container">
                {Array.from({ length: bootPhase + 1 }).map((_, index) => {
                  const bootTexts = [
                    'Initializing YoRHa Interface...',
                    'Memory Unit: Green',
                    'Initializing Tactical Log',
                    'Loading Portfolio Data',
                    'Vitals: Green',
                    'Remaining MP: 100%',
                    'Black Box Temperature: Normal',
                    'Black Box Internal Pressure: Normal',
                    'Activating IFF',
                    'Activating FCS',
                    'Initializing Pod Connection',
                    'Launching DBU Setup',
                    'Activating Environmental Sensors',
                    'Equipment Authentication: Complete',
                    'Equipment Status: Green',
                    'All Systems Green',
                    'Portfolio Preparations Complete'
                  ];
                  
                  return (
                    <div
                      key={index}
                      className={`boot-text ${index === bootPhase ? 'typing' : ''}`}
                    >
                      {bootTexts[index] ?? ''}
                    </div>
                  );
                })}
              </div>
              <div className="absolute bottom-0 w-full left-0 py-2 px-4 border-t border-gray-700 text-right">
                <div className="text-xs text-green-400">
                  Status: {bootPhase >= 16 ? 'READY' : 'BOOTING...'}
                </div>
              </div>
              <div className="absolute bottom-2 right-2">
                {bootPhase >= 16 && (
                  <div className="text-xs text-white animate-pulse">
                    Press Any Key To Continue
                  </div>
                )}
              </div>
            </div>

            {bootPhase >= 16 && (
              <div
                className="mt-6 text-center cursor-pointer"
                onClick={() => setLoading(false)}
              >
                <button className="border border-gray-600 hover:border-white px-4 py-2 text-sm transition-all">
                  ACCESS PORTFOLIO
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* If P5Background is a separate component, import and render it here */}
          <P5Background />

          {/* Header with terminal-style prompt */}
          <header className="site-header border-b border-gray-700 p-4 flex justify-between items-center fixed w-full bg-gray-800 bg-opacity-90 backdrop-blur-sm z-10">
            <div className="flex items-center terminal-header">
              <span className="text-gray-400">$</span>
              <span className="ml-2 text-gray-100 font-semibold">ksk432@:</span>
              <span className="typing-animation ml-2 text-green-500">
                ~/{currentDirectory}
              </span>
            </div>

            {/* Terminal toggle button */}
            <div className="flex items-center space-x-4">
              <button
                onClick={openTerminal}
                className="text-gray-400 hover:text-white flex items-center cursor-pointer"
              >
                <Terminal size={18} className="mr-2" />
                <span className="hidden sm:inline">Terminal</span>
              </button>

              {/* Mobile menu button */}
              <button
                onClick={toggleMenu}
                className="md:hidden text-gray-400 hover:text-white"
              >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Desktop navigation */}
            <nav className="site-nav hidden md:block">
              <ul className="flex space-x-6">
                <li>
                  <button
                    onClick={() => navigateTo('home')}
                    className={`hover:text-white ${
                      activeSection === 'home' ? 'text-white border-b border-green-500' : ''
                    }`}
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('research')}
                    className={`hover:text-white ${
                      activeSection === 'research' ? 'text-white border-b border-green-500' : ''
                    }`}
                  >
                    Research
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('publications')}
                    className={`hover:text-white ${
                      activeSection === 'publications' ? 'text-white border-b border-green-500' : ''
                    }`}
                  >
                    Publications
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('artwork')}
                    className={`hover:text-white ${
                      activeSection === 'artwork' ? 'text-white border-b border-green-500' : ''
                    }`}
                  >
                    Artwork
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('skills')}
                    className={`hover:text-white ${
                      activeSection === 'skills' ? 'text-white border-b border-green-500' : ''
                    }`}
                  >
                    Skills
                  </button>
                </li>
                {hiddenContent.inspirationsVisible && (
                  <li>
                    <button
                      onClick={() => navigateTo('inspirations')}
                      className={`hover:text-white ${
                        activeSection === 'inspirations'
                          ? 'text-white border-b border-green-500'
                          : ''
                      }`}
                    >
                      Inspirations
                    </button>
                  </li>
                )}
                {hiddenContent.scoresVisible && (
                  <li>
                    <button
                      onClick={() => navigateTo('scores')}
                      className={`hover:text-white ${
                        activeSection === 'scores' ? 'text-white border-b border-green-500' : ''
                      }`}
                    >
                      Scores
                    </button>
                  </li>
                )}
                <li>
                  <button
                    onClick={() => navigateTo('contact')}
                    className={`hover:text-white ${
                      activeSection === 'contact' ? 'text-white border-b border-green-500' : ''
                    }`}
                  >
                    Contact
                  </button>
                </li>
              </ul>
            </nav>
          </header>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-95 z-20 md:hidden pt-16">
              <nav className="p-4">
                <ul className="space-y-4">
                  <li>
                    <button
                      onClick={() => navigateTo('home')}
                      className="text-lg w-full text-left py-2 border-b border-gray-800"
                    >
                      Home
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateTo('research')}
                      className="text-lg w-full text-left py-2 border-b border-gray-800"
                    >
                      Research
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateTo('publications')}
                      className="text-lg w-full text-left py-2 border-b border-gray-800"
                    >
                      Publications
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateTo('artwork')}
                      className="text-lg w-full text-left py-2 border-b border-gray-800"
                    >
                      Artwork
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateTo('skills')}
                      className="text-lg w-full text-left py-2 border-b border-gray-800"
                    >
                      Skills
                    </button>
                  </li>
                  {hiddenContent.inspirationsVisible && (
                    <li>
                      <button
                        onClick={() => navigateTo('inspirations')}
                        className="text-lg w-full text-left py-2 border-b border-gray-800"
                      >
                        Inspirations
                      </button>
                    </li>
                  )}
                  {hiddenContent.scoresVisible && (
                    <li>
                      <button
                        onClick={() => navigateTo('scores')}
                        className="text-lg w-full text-left py-2 border-b border-gray-800"
                      >
                        Scores
                      </button>
                    </li>
                  )}
                  <li>
                    <button
                      onClick={() => navigateTo('contact')}
                      className="text-lg w-full text-left py-2 border-b border-gray-800"
                    >
                      Contact
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}

          {terminalOpen ? (
            <TerminalView
              currentDirectory={currentDirectory}
              terminalInput={terminalInput}
              terminalOutput={terminalOutput}
              setTerminalInput={setTerminalInput}
              processTerminalCommand={processTerminalCommand}
              onClose={closeTerminal}
            />
          ) : (
          <main className="site-main pt-16 container mx-auto px-4">
            {activeSection === 'home' && (
              <section className="cv-page cv-hero-section">
                <div className="cv-hero-grid">
                  <div className="cv-hero-main">
                    <div className="cv-motion-field" aria-hidden="true">
                      <span className="cv-motion-ring"></span>
                      <span className="cv-motion-scan"></span>
                      <span className="cv-motion-cursor"></span>
                    </div>
                    <p className="cv-kicker">Portfolio / Curriculum Vitae</p>
                    <h1>{profile.name}</h1>
                    <p className="cv-hero-title">Human-Computer Interaction Researcher</p>
                    <p className="cv-hero-copy">{jglobal.affiliation}</p>
                    <div className="cv-terminal-note">
                      <strong>Terminal layer</strong>
                      <p>
                        This page is the compact CV. Open the terminal to explore additional records,
                        hidden notes, project files, and research materials that are not shown here.
                      </p>
                    </div>
                    <div className="cv-command-strip">
                      <span>try</span>
                      <code>cd profile</code>
                      <code>cat research_stance.md</code>
                      <code>cd experience</code>
                    </div>
                  </div>
                  <aside className="cv-panel">
                    <h2>Compact CV</h2>
                    <p>
                      The default page is intentionally simple. The terminal keeps the playful
                      database layer for deeper records, experimental notes, and hidden sections.
                    </p>
                    <div className="cv-nav-strip">
                      {cvNavShortcuts.map((shortcut) => (
                        <button
                          key={shortcut.section}
                          type="button"
                          onClick={() => navigateTo(shortcut.section)}
                        >
                          {shortcut.label}
                        </button>
                      ))}
                      <button type="button" onClick={openTerminal}>
                        Open Terminal
                      </button>
                    </div>
                  </aside>
                </div>

                <div className="cv-thread-grid">
                  <article className="cv-thread-card">
                    <span>Fields</span>
                    <h3>Research Fields</h3>
                    <p>{jglobal.researchFields.join(' / ')}</p>
                  </article>
                  <article className="cv-thread-card">
                    <span>Keywords</span>
                    <h3>Research Keywords</h3>
                    <p>{jglobal.researchKeywords.join(' / ')}</p>
                  </article>
                  <article className="cv-thread-card">
                    <span>Source</span>
                    <h3>J-GLOBAL Profile</h3>
                    <p>J-GLOBAL ID: {jglobal.jglobalId} / Updated {jglobal.updatedAt}</p>
                  </article>
                </div>

                <section className="cv-section-block">
                  <SectionHeading kicker="Experience" title="Selected Engineering Work">
                    Research and creative systems are supported by hands-on backend and infrastructure work.
                  </SectionHeading>
                  <RecordList
                    records={experience}
                    getTitle={(record) => record.title}
                    getMeta={(record) => [record.period, record.role].filter(Boolean).join(' / ')}
                    getBody={(record) => record.description}
                  />
                </section>

                <section className="cv-section-block">
                  <SectionHeading kicker="J-GLOBAL" title="Education & Academic Service">
                    Public profile records synchronized from J-GLOBAL.
                  </SectionHeading>
                  <RecordList
                    records={[...jglobal.education, ...jglobal.career, ...jglobal.service]}
                    getTitle={(record) => record.title}
                    getMeta={(record) => record.period}
                    getBody={() => ''}
                  />
                  <div className="cv-tag-row">
                    {jglobal.memberships.map((membership) => (
                      <span key={membership}>{membership}</span>
                    ))}
                  </div>
                </section>
              </section>
            )}
            
            {activeSection === 'research' && (
              <section className="cv-page">
                <SectionHeading kicker="J-GLOBAL" title="Competitive Funding">
                  Funding records synchronized from the public J-GLOBAL profile.
                </SectionHeading>

                <RecordList
                  records={jglobal.funding}
                  getTitle={(record) => record.title}
                  getMeta={(record) => record.period}
                  getBody={() => ''}
                />

                <SectionHeading kicker="Portfolio" title="Research Projects">
                  Selected ongoing research directions and project records.
                </SectionHeading>

                {researchProjects.map((project) => (
                  <article className="cv-project" key={project.id}>
                    <div className="cv-project-header">
                      <div>
                        <h3>{textValue(project.title)}</h3>
                        <p>{project.summary}</p>
                      </div>
                      <span>{project.startYear} - Present</span>
                    </div>
                    <div className="cv-thread-grid">
                      {project.researchQuestions.map((question) => (
                        <article className="cv-thread-card" key={question.id}>
                          <span>{question.id}</span>
                          <h4>{question.title}</h4>
                          <p>{question.question}</p>
                          <div className="cv-tag-row compact">
                            {question.keywords.map((keyword) => (
                              <span key={keyword}>{keyword}</span>
                            ))}
                          </div>
                        </article>
                      ))}
                    </div>

                    {project.researchQuestions.some((q) => q.selectedWorks?.some((work) => work.year)) && (
                      <div className="cv-selected-works">
                        <SectionHeading kicker="Selected Works" title="Selected Research Projects">
                          各リサーチクエスチョン (T1–T3) ごとに選定したプロジェクトです。
                        </SectionHeading>
                        {project.researchQuestions.map((question) => (
                          question.selectedWorks?.some((work) => work.year) ? (
                            <div className="cv-track-block" key={`works-${question.id}`}>
                              <h4>{question.id} — {question.title}</h4>
                              <RecordList
                                records={question.selectedWorks.filter((record) => record.year)}
                                getTitle={(record) => textValue(record.title)}
                                getMeta={(record) => [record.year, record.role].filter(Boolean).join(' / ')}
                                getBody={(record) => record.description}
                              />
                            </div>
                          ) : null
                        ))}
                      </div>
                    )}
                  </article>
                ))}

                <SectionHeading kicker="Presentations" title="Talks and Presentations" />
                <RecordList
                  records={presentations}
                  getTitle={(record) => textValue(record.title)}
                  getMeta={(record) => [record.year, record.event].filter(Boolean).join(' / ')}
                  getBody={(record) => record.tags?.join(', ')}
                />
              </section>
            )}
            {activeSection === 'publications' && (
              <section className="cv-page">
                <SectionHeading kicker="J-GLOBAL" title="Publications">
                  11 papers and 13 miscellaneous academic contributions, synchronized from J-GLOBAL.
                </SectionHeading>
                {[
                  ['published_papers', 'Papers'],
                  ['misc', 'MISC']
                ].map(([type, label]) => {
                  const records = publications.filter((record) => record.type === type);
                  return (
                    <div className="cv-track-block" key={type}>
                      <h3>{label} ({records.length})</h3>
                      <RecordList
                        records={records}
                        getTitle={(record) => textValue(record.title)}
                        getMeta={(record) =>
                          [record.authors?.join(', '), record.journal, record.year, record.doi && `DOI: ${record.doi}`]
                            .filter(Boolean)
                            .join(' / ')
                        }
                        getBody={() => ''}
                      />
                    </div>
                  );
                })}
              </section>
            )}
            {activeSection === 'artwork' && (
              <section className="cv-page">
                <SectionHeading kicker="Creative Work" title="Artwork and Prototypes">
                  研究の問いに接続する制作・プロトタイプの記録です。
                </SectionHeading>
                <RecordList
                  records={artwork.filter((record) => record.visibility !== 'hidden' || hiddenContent.secretProjectVisible)}
                  getTitle={(record) => record.title}
                  getMeta={(record) => [record.year, record.kind, record.fileName].filter(Boolean).join(' / ')}
                  getBody={(record) => record.description}
                />
              </section>
            )}
            {activeSection === 'skills' && (
              <section className="cv-page">
                <SectionHeading kicker="Capabilities" title="Skills">
                  研究・実装・制作を横断するためのスキルセットです。
                </SectionHeading>
                <RecordList
                  records={skills}
                  getTitle={(record) => record.title}
                  getMeta={(record) => record.fileName}
                  getBody={(record) => record.description}
                />
              </section>
            )}
            {activeSection === 'inspirations' && (
              <section className="cv-page">
                <SectionHeading kicker="References" title="Inspirations">
                  ターミナルから解放される、思想・表現上の参照点です。
                </SectionHeading>
                <RecordList
                  records={inspirations}
                  getTitle={(record) => record.title}
                  getMeta={(record) => record.fileName}
                  getBody={(record) => record.description}
                />
              </section>
            )}
            {activeSection === 'scores' && (
              <section className="cv-page">
                <SectionHeading kicker="Archive" title="Scores">
                  音楽・スコアに関する個人的な記録です。
                </SectionHeading>
                <RecordList
                  records={scores}
                  getTitle={(record) => record.title}
                  getMeta={(record) => record.fileName}
                  getBody={(record) => record.description}
                />
              </section>
            )}
            {activeSection === 'contact' && (
              <section className="cv-page">
                <SectionHeading kicker="Contact" title="Contact">
                  連絡先と外部プロフィールはここに集約します。
                </SectionHeading>
                <RecordList
                  records={contact}
                  getTitle={(record) => record.title}
                  getMeta={(record) => record.fileName}
                  getBody={(record) => record.description}
                />
              </section>
            )}
          </main>
          )}

          {!terminalOpen && (
            <footer className="site-footer border-t border-gray-800 py-8 mt-16">
              <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <p className="text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Kosuke Shimizu / Human-Computer Interaction
                  </p>
                </div>
                <div className="cv-footer-links">
                  <button type="button">
                    Github
                  </button>
                  <button type="button">
                    LinkedIn
                  </button>
                  <button type="button">
                    Twitter
                  </button>
                </div>
              </div>
            </footer>
          )}
        </>
      )}
    </div>
  );
};

export default Portfolio;
