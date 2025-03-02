import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown, ExternalLink, Terminal } from 'lucide-react';
import './App.css';

// P5.js sketch for the interactive background
const P5Background = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
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
        new p5(sketch, canvasRef.current);
      })
      .catch(err => console.error('Could not load p5.js', err));
    
    return () => {
      // Cleanup
      if (canvasRef.current) {
        while (canvasRef.current.firstChild) {
          canvasRef.current.removeChild(canvasRef.current.firstChild);
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
  const [currentDirectory, setCurrentDirectory] = useState('portfolio');
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
      setTerminalOutput([
        { type: 'system', text: 'NieR OS Terminal [Version 1.0]' },
        { type: 'system', text: '© 2025 Kosuke Shimizu. All rights reserved.' },
        { type: 'system', text: 'Type "/help" for available commands.' },
        { type: 'system', text: '' }
      ]);
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
        setCurrentDirectory('portfolio');
      }
    }
  };
  
  const processTerminalCommand = (command) => {
    const newOutput = [...terminalOutput];
    newOutput.push({ type: 'input', text: command, directory: currentDirectory });
    
    // Basic directory navigation
    if (command.startsWith('cd ')) {
      const targetDir = command.substring(3).trim();
      if (targetDir === '..') {
        // Go up one directory level
        if (currentDirectory !== 'portfolio') {
          setCurrentDirectory('portfolio');
          newOutput.push({ type: 'output', text: 'Changed directory to ~/portfolio' });
          navigateTo('home');
        } else {
          newOutput.push({ type: 'error', text: 'Already at root directory' });
        }
      } else if (targetDir === '~' || targetDir === '/') {
        setCurrentDirectory('portfolio');
        newOutput.push({ type: 'output', text: 'Changed directory to ~/portfolio' });
        navigateTo('home');
      } else if (
        [
          'research',
          'artwork',
          'publications',
          'skills',
          'contact',
          'scores',
          'inspirations'
        ].includes(targetDir)
      ) {
        setCurrentDirectory(targetDir);
        newOutput.push({ type: 'output', text: `Changed directory to ~/portfolio/${targetDir}` });
        // Always navigate to that section
        navigateTo(targetDir);
        
        // Reveal hidden sections if relevant
        if (targetDir === 'scores' && !hiddenContent.scoresVisible) {
          setHiddenContent({ ...hiddenContent, scoresVisible: true });
          newOutput.push({ type: 'output', text: 'Revealed hidden scores section!' });
        } else if (targetDir === 'inspirations' && !hiddenContent.inspirationsVisible) {
          setHiddenContent({ ...hiddenContent, inspirationsVisible: true });
          newOutput.push({ type: 'output', text: 'Revealed inspirations section!' });
        }
      } else {
        newOutput.push({ type: 'error', text: `Directory not found: ${targetDir}` });
      }
    }
    // `ls` command
    else if (command === 'ls' || command === 'dir') {
      if (currentDirectory === 'portfolio') {
        newOutput.push({
          type: 'output',
          text: `drwxr-xr-x  research/\ndrwxr-xr-x  artwork/\ndrwxr-xr-x  publications/\ndrwxr-xr-x  skills/\ndrwxr-xr-x  contact/\n${
            hiddenContent.inspirationsVisible ? 'drwxr-xr-x  inspirations/\n' : ''
          }${hiddenContent.scoresVisible ? 'drwxr-xr-x  scores/' : ''}`
        });
      } else if (currentDirectory === 'research') {
        newOutput.push({
          type: 'output',
          text: `-rw-r--r--  memory_augmentation.pdf\n-rw-r--r--  parametric_design.md\n-rw-r--r--  hci_proposal_2024.txt`
        });
      } else if (currentDirectory === 'artwork') {
        newOutput.push({
          type: 'output',
          text: `-rw-r--r--  memory_fragments.webgl\n-rw-r--r--  digital_echo.js\n-rw-r--r--  neural_pathways.p5${
            hiddenContent.secretProjectVisible ? '\n-rw-r--r--  ghost_memories.p5 [HIDDEN]' : ''
          }`
        });
      } else if (currentDirectory === 'scores') {
        newOutput.push({
          type: 'output',
          text: `-rw-r--r--  nier_weight_of_the_world.mid\n-rw-r--r--  ghost_in_the_shell_opening.mp3\n-rw-r--r--  harmony_theme.wav`
        });
      } else {
        newOutput.push({ type: 'output', text: 'No files in this directory' });
      }
    }
    // `pwd`
    else if (command === 'pwd') {
      newOutput.push({
        type: 'output',
        text: `/home/kosuke/portfolio${
          currentDirectory !== 'portfolio' ? '/' + currentDirectory : ''
        }`
      });
    }
    // Terminal reveal commands
    else if (command.startsWith('/show:inspirations')) {
      newOutput.push({ type: 'output', text: 'Revealing inspirations section...' });
      setHiddenContent({ ...hiddenContent, inspirationsVisible: true });
      setActiveSection('inspirations');
    } else if (command.startsWith('/show:projects')) {
      newOutput.push({ type: 'output', text: 'Revealing hidden projects...' });
      setHiddenContent({ ...hiddenContent, secretProjectVisible: true });
      setActiveSection('artwork');
    } else if (command.startsWith('/show:scores')) {
      newOutput.push({ type: 'output', text: 'Revealing music scores section...' });
      setHiddenContent({ ...hiddenContent, scoresVisible: true });
      setActiveSection('scores');
    }
    // /help
    else if (command.startsWith('/help')) {
      newOutput.push({
        type: 'output',
        text: `Available commands:
  /show:inspirations - View inspiration sources
  /show:projects - Reveal hidden projects
  /show:scores - Reveal music scores
  /about:nier - NieR Automata info
  /about:gits - Ghost in the Shell info
  /about:harmony - Project Itoh info
  /clear - Clear terminal
  /matrix - ???

Standard Unix commands:
  cd [directory] - Change directory
  ls - List files
  pwd - Print working directory
  cat [file] - View file contents`
      });
    }
    // /about
    else if (command.startsWith('/about:nier')) {
      newOutput.push({
        type: 'output',
        text: 'NieR: Automata - Action RPG developed by PlatinumGames, directed by Yoko Taro. Known for its unique storytelling, multiple endings, and philosophical themes exploring existence, consciousness, and memory.'
      });
    } else if (command.startsWith('/about:gits')) {
      newOutput.push({
        type: 'output',
        text: 'Ghost in the Shell - Cyberpunk franchise created by Masamune Shirow, exploring themes of human consciousness in a networked world, the boundary between human and machine, and the nature of identity.'
      });
    } else if (command.startsWith('/about:harmony')) {
      newOutput.push({
        type: 'output',
        text: 'Harmony - Novel by Project Itoh (Satoshi Itō) set in a utopian world where human health is constantly monitored. Explores themes of free will, the value of life, and the nature of consciousness.'
      });
    }
    // cat [file]
    else if (command.startsWith('cat ')) {
      const fileName = command.substring(4).trim();
      // Only allow viewing files in the current directory
      if (
        currentDirectory === 'research' &&
        ['memory_augmentation.pdf', 'parametric_design.md', 'hci_proposal_2024.txt'].includes(
          fileName
        )
      ) {
        if (fileName === 'hci_proposal_2024.txt') {
          newOutput.push({
            type: 'output',
            text: `TITLE: Memory as Interface: Exploring New HCI Paradigms

ABSTRACT:
This research proposes a novel framework for human-computer interaction based on the analogy between digital interfaces and human memory structures. Drawing from cognitive psychology and parametric design principles, we aim to develop interfaces that adapt to individual memory patterns and cognitive processes...`
          });
        } else {
          newOutput.push({
            type: 'output',
            text: `Viewing ${fileName}... [File contents would appear here]`
          });
        }
      } else if (
        currentDirectory === 'artwork' &&
        ['memory_fragments.webgl', 'digital_echo.js', 'neural_pathways.p5', 'ghost_memories.p5'].includes(
          fileName
        )
      ) {
        if (fileName === 'ghost_memories.p5' && !hiddenContent.secretProjectVisible) {
          newOutput.push({ type: 'error', text: 'Access denied: Hidden file' });
        } else {
          newOutput.push({
            type: 'output',
            text: `Viewing ${fileName}... [File contents would appear here]`
          });
        }
      } else if (
        currentDirectory === 'scores' &&
        ['nier_weight_of_the_world.mid', 'ghost_in_the_shell_opening.mp3', 'harmony_theme.wav'].includes(
          fileName
        )
      ) {
        newOutput.push({
          type: 'output',
          text: `Playing ${fileName}... [Audio would play here]`
        });
      } else {
        newOutput.push({ type: 'error', text: `File not found: ${fileName}` });
      }
    }
    // /clear
    else if (command.startsWith('/clear')) {
      setTerminalOutput([
        { type: 'system', text: 'NieR OS Terminal [Version 1.0]' },
        { type: 'system', text: '© 2025 Kosuke Shimizu. All rights reserved.' },
        { type: 'system', text: 'Type "/help" for available commands.' },
        { type: 'system', text: '' }
      ]);
      return;
    }
    // /matrix
    else if (command.startsWith('/matrix')) {
      newOutput.push({ type: 'special', text: 'matrix' });
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
    // Unknown command
    else {
      newOutput.push({
        type: 'error',
        text: `Command not recognized: ${command}. Type /help for available commands.`
      });
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
                    className={`mb-1 text-sm ${
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
              <section className="min-h-screen flex flex-col justify-center relative overflow-hidden">
                {/* ...home section content... */}
              </section>
            )}
            
            {activeSection === 'research' && (
              <section className="py-16">
                {/* ...research section content... */}
              </section>
            )}
            {activeSection === 'publications' && (
              <section className="py-16">
                {/* ...publications section content... */}
              </section>
            )}
            {activeSection === 'artwork' && (
              <section className="py-16">
                {/* ...artwork section content... */}
              </section>
            )}
            {activeSection === 'skills' && (
              <section className="py-16">
                {/* ...skills section content... */}
              </section>
            )}
            {activeSection === 'inspirations' && (
              <section className="py-16">
                {/* ...inspirations section content... */}
              </section>
            )}
            {activeSection === 'scores' && (
              <section className="py-16">
                {/* ...scores section content... */}
              </section>
            )}
            {activeSection === 'contact' && (
              <section className="py-16">
                {/* ...contact section content... */}
              </section>
            )}
          </main>

          <footer className="border-t border-gray-800 py-8 mt-16">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-gray-500 text-sm">
                  &copy; {new Date().getFullYear()} · Kosuke Shimizu · Human-Computer Interaction
                </p>
              </div>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-500 hover:text-white text-sm">
                  Github
                </a>
                <a href="#" className="text-gray-500 hover:text-white text-sm">
                  LinkedIn
                </a>
                <a href="#" className="text-gray-500 hover:text-white text-sm">
                  Twitter
                </a>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
};

export default Portfolio;
