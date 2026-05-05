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
import inspirations from './data/portfolio/inspirations.json';
import scores from './data/portfolio/scores.json';
import contact from './data/portfolio/contact.json';
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
  
  const toggleTerminal = () => {
    setTerminalOpen(!terminalOpen);
  };
  
  const navigateTo = (section) => {
    if (section) {
      setActiveSection(section);
      setMenuOpen(false);
      // Update terminal path to reflect navigation
      if (section !== 'home') {
        setCurrentDirectory(section);
      } else {
        setCurrentDirectory(ROOT_DIRECTORY);
      }
    }
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
    <div className="min-h-screen bg-gray-800 text-gray-200 font-mono">
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
          <header className="border-b border-gray-700 p-4 flex justify-between items-center fixed w-full bg-gray-800 bg-opacity-90 backdrop-blur-sm z-10">
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
                onClick={toggleTerminal}
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
            <nav className="hidden md:block">
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

          {/* Terminal Interface */}
          {terminalOpen && (
            <div className="fixed bottom-0 right-0 w-full md:w-96 h-72 bg-gray-950 bg-opacity-95 border border-gray-700 z-30 terminal-container overflow-auto">
              <div className="p-2 border-b border-gray-700 flex justify-between items-center bg-gray-800">
                <span className="text-xs text-gray-400">
                  kosuke@tsukuba:~/{currentDirectory}
                </span>
                <button onClick={toggleTerminal} className="text-gray-400 hover:text-white">
                  <X size={14} />
                </button>
              </div>
              <div className="p-2 terminal-output h-48 overflow-y-auto">
                {terminalOutput.map((item, index) => (
                  <div
                    key={index}
                    className={`terminal-line mb-1 text-sm ${
                      item.type === 'input'
                        ? 'text-green-500'
                        : item.type === 'error'
                        ? 'text-red-400'
                        : item.type === 'system'
                        ? 'text-blue-400'
                        : item.type === 'special'
                        ? 'hidden'
                        : 'text-gray-300'
                    }`}
                  >
                    {item.type === 'input'
                      ? `kosuke@tsukuba:~/${item.directory || currentDirectory}$ ${item.text}`
                      : item.text}
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-gray-700">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (terminalInput.trim()) {
                      processTerminalCommand(terminalInput.trim());
                    }
                  }}
                >
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2 whitespace-nowrap">
                      kosuke@tsukuba:~/{currentDirectory}$
                    </span>
                    <input
                      type="text"
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && terminalInput.trim()) {
                          e.preventDefault();
                          processTerminalCommand(terminalInput.trim());
                        }
                      }}
                      className="bg-transparent border-none outline-none text-white w-full text-sm focus:ring-0"
                      placeholder="Type a command... (/help)"
                      autoFocus
                      spellCheck="false"
                      autoComplete="off"
                    />
                  </div>
                </form>
              </div>
            </div>
          )}

          <main className="pt-16 container mx-auto px-4">
            {activeSection === 'home' && (
              <section className="cv-page cv-hero-section">
                <div className="cv-hero-grid">
                  <div className="cv-hero-main">
                    <p className="cv-kicker">Portfolio / Curriculum Vitae</p>
                    <h1>{profile.name}</h1>
                    <p className="cv-hero-title">{textValue(profile.portfolioTheme)}</p>
                    <p className="cv-hero-copy">{profile.overview}</p>
                    <div className="cv-command-strip">
                      <span>try:</span>
                      <code>cd profile</code>
                      <code>cat research_stance.md</code>
                    </div>
                  </div>
                  <aside className="cv-panel">
                    <h2>Research Stance</h2>
                    <p>{profile.researchStance}</p>
                  </aside>
                </div>

                <div className="cv-thread-grid">
                  {profile.researchThreads.map((thread) => (
                    <article className="cv-thread-card" key={thread.id}>
                      <span>{thread.id}</span>
                      <h3>{thread.label}</h3>
                      <p>{thread.summary}</p>
                    </article>
                  ))}
                </div>

                <section className="cv-section-block">
                  <SectionHeading kicker="Adjacent Work" title="周辺的な関心">
                    研究テーマの外側で、科学・メディア・人工生命の構造も観察対象にしています。
                  </SectionHeading>
                  <div className="cv-tag-row">
                    {profile.sideInterests.map((interest) => (
                      <span key={interest}>{interest}</span>
                    ))}
                  </div>
                </section>
              </section>
            )}
            
            {activeSection === 'research' && (
              <section className="cv-page">
                <SectionHeading kicker="Research" title="Research Projects">
                  人間が価値を感じる体験の創出・想起・記録を支援するインターフェースを中心に検討しています。
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
                <SectionHeading kicker="Researchmap" title="Publications">
                  Researchmap互換を意識したJSONから表示しています。
                </SectionHeading>
                <RecordList
                  records={publications}
                  getTitle={(record) => textValue(record.title)}
                  getMeta={(record) =>
                    [record.year, record.journal, record.doi].filter(Boolean).join(' / ')
                  }
                  getBody={(record) => record.abstract}
                />
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

          <footer className="border-t border-gray-800 py-8 mt-16">
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
        </>
      )}
    </div>
  );
};

export default Portfolio;
