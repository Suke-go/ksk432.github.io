import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown, ExternalLink, Terminal } from 'lucide-react';
import './Portfolio.css';

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

// Main Portfolio Component
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
  
  // Show loading screen and simulate boot sequence
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
  }, [terminalOpen]);
  
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
    
    // Handle directory navigation commands
    if (command.startsWith('cd ')) {
      const targetDir = command.substring(3).trim();
      
      if (targetDir === '..') {
        // Go up one directory level
        if (currentDirectory !== 'portfolio') {
          setCurrentDirectory('portfolio');
          newOutput.push({ type: 'output', text: `Changed directory to ~/portfolio` });
          navigateTo('home');
        } else {
          newOutput.push({ type: 'error', text: `Already at root directory` });
        }
      } else if (targetDir === '~' || targetDir === '/') {
        setCurrentDirectory('portfolio');
        newOutput.push({ type: 'output', text: `Changed directory to ~/portfolio` });
        navigateTo('home');
      } else if (['research', 'artwork', 'publications', 'skills', 'contact', 'scores', 'inspirations'].includes(targetDir)) {
        setCurrentDirectory(targetDir);
        newOutput.push({ type: 'output', text: `Changed directory to ~/portfolio/${targetDir}` });
        
        // Always navigate to that section
        navigateTo(targetDir);
        
        // If it's a hidden section, reveal it
        if (targetDir === 'scores' && !hiddenContent.scoresVisible) {
          setHiddenContent({...hiddenContent, scoresVisible: true});
          newOutput.push({ type: 'output', text: 'Revealed hidden scores section!' });
        } else if (targetDir === 'inspirations' && !hiddenContent.inspirationsVisible) {
          setHiddenContent({...hiddenContent, inspirationsVisible: true});
          newOutput.push({ type: 'output', text: 'Revealed inspirations section!' });
        }
      } else {
        newOutput.push({ type: 'error', text: `Directory not found: ${targetDir}` });
      }
    } 
    // Handle the ls command
    else if (command === 'ls' || command === 'dir') {
      if (currentDirectory === 'portfolio') {
        newOutput.push({ 
          type: 'output', 
          text: `drwxr-xr-x  research/\ndrwxr-xr-x  artwork/\ndrwxr-xr-x  publications/\ndrwxr-xr-x  skills/\ndrwxr-xr-x  contact/\n${hiddenContent.inspirationsVisible ? 'drwxr-xr-x  inspirations/' : ''}\n${hiddenContent.scoresVisible ? 'drwxr-xr-x  scores/' : ''}` 
        });
      } else if (currentDirectory === 'research') {
        newOutput.push({ 
          type: 'output', 
          text: `-rw-r--r--  memory_augmentation.pdf\n-rw-r--r--  parametric_design.md\n-rw-r--r--  hci_proposal_2024.txt` 
        });
      } else if (currentDirectory === 'artwork') {
        newOutput.push({ 
          type: 'output', 
          text: `-rw-r--r--  memory_fragments.webgl\n-rw-r--r--  digital_echo.js\n-rw-r--r--  neural_pathways.p5\n${hiddenContent.secretProjectVisible ? '-rw-r--r--  ghost_memories.p5 [HIDDEN]' : ''}` 
        });
      } else if (currentDirectory === 'scores') {
        newOutput.push({ 
          type: 'output', 
          text: `-rw-r--r--  nier_weight_of_the_world.mid\n-rw-r--r--  ghost_in_the_shell_opening.mp3\n-rw-r--r--  harmony_theme.wav` 
        });
      } else {
        newOutput.push({ type: 'output', text: `No files in this directory` });
      }
    }
    // Handle the pwd command
    else if (command === 'pwd') {
      newOutput.push({ type: 'output', text: `/home/kosuke/portfolio${currentDirectory !== 'portfolio' ? '/' + currentDirectory : ''}` });
    }
    // Handle other special commands
    else if (command.startsWith('/show:inspirations')) {
      newOutput.push({ type: 'output', text: 'Revealing inspirations section...' });
      setHiddenContent({...hiddenContent, inspirationsVisible: true});
      setActiveSection('inspirations');
    } else if (command.startsWith('/show:projects')) {
      newOutput.push({ type: 'output', text: 'Revealing hidden projects...' });
      setHiddenContent({...hiddenContent, secretProjectVisible: true});
      setActiveSection('artwork');
    } else if (command.startsWith('/show:scores')) {
      newOutput.push({ type: 'output', text: 'Revealing music scores section...' });
      setHiddenContent({...hiddenContent, scoresVisible: true});
      setActiveSection('scores');
    } else if (command.startsWith('/help')) {
      newOutput.push({ 
        type: 'output', 
        text: 'Available commands:\n/show:inspirations - View inspiration sources\n/show:projects - Reveal hidden projects\n/show:scores - Reveal music scores\n/about:nier - NieR Automata info\n/about:gits - Ghost in the Shell info\n/about:harmony - Project Itoh info\n/clear - Clear terminal\n/matrix - ???\n\nStandard Unix commands:\ncd [directory] - Change directory\nls - List files\npwd - Print working directory\ncat [file] - View file contents' 
      });
    } else if (command.startsWith('/about:nier')) {
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
    } else if (command.startsWith('cat ')) {
      const fileName = command.substring(4).trim();
      
      // Only allow viewing files in the current directory
      if (currentDirectory === 'research' && ['memory_augmentation.pdf', 'parametric_design.md', 'hci_proposal_2024.txt'].includes(fileName)) {
        if (fileName === 'hci_proposal_2024.txt') {
          newOutput.push({ 
            type: 'output', 
            text: 'TITLE: Memory as Interface: Exploring New HCI Paradigms\n\nABSTRACT:\nThis research proposes a novel framework for human-computer interaction based on the analogy between digital interfaces and human memory structures. Drawing from cognitive psychology and parametric design principles, we aim to develop interfaces that adapt to individual memory patterns and cognitive processes...' 
          });
        } else {
          newOutput.push({ type: 'output', text: `Viewing ${fileName}... [File contents would appear here]` });
        }
      } else if (currentDirectory === 'artwork' && ['memory_fragments.webgl', 'digital_echo.js', 'neural_pathways.p5', 'ghost_memories.p5'].includes(fileName)) {
        if (fileName === 'ghost_memories.p5' && !hiddenContent.secretProjectVisible) {
          newOutput.push({ type: 'error', text: 'Access denied: Hidden file' });
        } else {
          newOutput.push({ type: 'output', text: `Viewing ${fileName}... [File contents would appear here]` });
        }
      } else if (currentDirectory === 'scores' && ['nier_weight_of_the_world.mid', 'ghost_in_the_shell_opening.mp3', 'harmony_theme.wav'].includes(fileName)) {
        newOutput.push({ type: 'output', text: `Playing ${fileName}... [Audio would play here]` });
      } else {
        newOutput.push({ type: 'error', text: `File not found: ${fileName}` });
      }
    } else if (command.startsWith('/clear')) {
      setTerminalOutput([
        { type: 'system', text: 'NieR OS Terminal [Version 1.0]' },
        { type: 'system', text: '© 2025 Kosuke Shimizu. All rights reserved.' },
        { type: 'system', text: 'Type "/help" for available commands.' },
        { type: 'system', text: '' }
      ]);
      return;
    } else if (command.startsWith('/matrix')) {
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
    } else {
      newOutput.push({ type: 'error', text: `Command not recognized: ${command}. Type /help for available commands.` });
    }
    
    setTerminalOutput(newOutput);
    setTerminalInput('');
  };}
  
  // Render the component
  return (
    <div className="min-h-screen bg-gray-800 text-gray-200 font-mono">
      {loading ? (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
          <div className="loading-container w-full max-w-xl p-10">
            <div className="mb-6 text-center">
              <h1 className="text-2xl mb-2 loading-title glitch-text-subtle">LOADING - BOOTING SYSTEM...</h1>
              <div className="h-1 w-full bg-gray-800 mb-4">
                <div className="h-full bg-green-500" style={{ width: `${(bootPhase / 17) * 100}%` }}></div>
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
                    <div key={index} className={`boot-text ${index === bootPhase ? 'typing' : ''}`}>
                      {index < bootTexts.length ? bootTexts[index] : ''}
                    </div>
                  );
                })}
              </div>
              
              <div className="absolute bottom-0 w-full left-0 py-2 px-4 border-t border-gray-700 text-right">
                <div className="text-xs text-green-400">Status: {bootPhase >= 16 ? 'READY' : 'BOOTING...'}</div>
              </div>
              
              <div className="absolute bottom-2 right-2">
                {bootPhase >= 16 && (
                  <div className="text-xs text-white animate-pulse">Press Any Key To Continue</div>
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
          <P5Background />
      
      {/* Header with terminal-style prompt */}
      <header className="border-b border-gray-700 p-4 flex justify-between items-center fixed w-full bg-gray-800 bg-opacity-90 backdrop-blur-sm z-10">
        <div className="flex items-center terminal-header">
          <span className="text-gray-400">$</span>
          <span className="ml-2 text-gray-100 font-semibold">ksk432@:</span>
          <span className="typing-animation ml-2 text-green-500">~/{currentDirectory}</span>
        </div>
        
        {/* Terminal toggle button - always visible */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleTerminal} 
            className="text-gray-400 hover:text-white flex items-center cursor-pointer"
          >
            <Terminal size={18} className="mr-2" />
            <span className="hidden sm:inline">Terminal</span>
          </button>
          
          {/* Mobile menu button */}
          <button onClick={toggleMenu} className="md:hidden text-gray-400 hover:text-white">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Desktop navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            <li><button onClick={() => navigateTo('home')} className={`hover:text-white ${activeSection === 'home' ? 'text-white border-b border-green-500' : ''}`}>Home</button></li>
            <li><button onClick={() => navigateTo('research')} className={`hover:text-white ${activeSection === 'research' ? 'text-white border-b border-green-500' : ''}`}>Research</button></li>
            <li><button onClick={() => navigateTo('publications')} className={`hover:text-white ${activeSection === 'publications' ? 'text-white border-b border-green-500' : ''}`}>Publications</button></li>
            <li><button onClick={() => navigateTo('artwork')} className={`hover:text-white ${activeSection === 'artwork' ? 'text-white border-b border-green-500' : ''}`}>Artwork</button></li>
            <li><button onClick={() => navigateTo('skills')} className={`hover:text-white ${activeSection === 'skills' ? 'text-white border-b border-green-500' : ''}`}>Skills</button></li>
            {hiddenContent.inspirationsVisible && (
              <li><button onClick={() => navigateTo('inspirations')} className={`hover:text-white ${activeSection === 'inspirations' ? 'text-white border-b border-green-500' : ''}`}>Inspirations</button></li>
            )}
            {hiddenContent.scoresVisible && (
              <li><button onClick={() => navigateTo('scores')} className={`hover:text-white ${activeSection === 'scores' ? 'text-white border-b border-green-500' : ''}`}>Scores</button></li>
            )}
            <li><button onClick={() => navigateTo('contact')} className={`hover:text-white ${activeSection === 'contact' ? 'text-white border-b border-green-500' : ''}`}>Contact</button></li>
          </ul>
        </nav>
      </header>
      
      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-95 z-20 md:hidden pt-16">
          <nav className="p-4">
            <ul className="space-y-4">
              <li><button onClick={() => navigateTo('home')} className="text-lg w-full text-left py-2 border-b border-gray-800">Home</button></li>
              <li><button onClick={() => navigateTo('research')} className="text-lg w-full text-left py-2 border-b border-gray-800">Research</button></li>
              <li><button onClick={() => navigateTo('publications')} className="text-lg w-full text-left py-2 border-b border-gray-800">Publications</button></li>
              <li><button onClick={() => navigateTo('artwork')} className="text-lg w-full text-left py-2 border-b border-gray-800">Artwork</button></li>
              <li><button onClick={() => navigateTo('skills')} className="text-lg w-full text-left py-2 border-b border-gray-800">Skills</button></li>
              {hiddenContent.inspirationsVisible && (
                <li><button onClick={() => navigateTo('inspirations')} className="text-lg w-full text-left py-2 border-b border-gray-800">Inspirations</button></li>
              )}
              {hiddenContent.scoresVisible && (
                <li><button onClick={() => navigateTo('scores')} className="text-lg w-full text-left py-2 border-b border-gray-800">Scores</button></li>
              )}
              <li><button onClick={() => navigateTo('contact')} className="text-lg w-full text-left py-2 border-b border-gray-800">Contact</button></li>
            </ul>
          </nav>
        </div>
      )}
      
      {/* Terminal Interface */}
      {terminalOpen && (
        <div className="fixed bottom-0 right-0 w-full md:w-96 h-72 bg-gray-950 bg-opacity-95 border border-gray-700 z-30 terminal-container overflow-auto">
          <div className="p-2 border-b border-gray-700 flex justify-between items-center bg-gray-800">
            <span className="text-xs text-gray-400">kosuke@tsukuba:~/{currentDirectory}</span>
            <button onClick={toggleTerminal} className="text-gray-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
          <div className="p-2 terminal-output h-48 overflow-y-auto">
            {terminalOutput.map((item, index) => (
              <div key={index} className={`mb-1 text-sm ${
                item.type === 'input' ? 'text-green-500' : 
                item.type === 'error' ? 'text-red-400' : 
                item.type === 'system' ? 'text-blue-400' :
                item.type === 'special' ? 'hidden' : 'text-gray-300'
              }`}>
                {item.type === 'input' ? 
                  `kosuke@tsukuba:~/${item.directory || currentDirectory}$ ${item.text}` : 
                  item.text}
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-gray-700">
            <form onSubmit={(e) => {
              e.preventDefault();
              if (terminalInput.trim()) {
                processTerminalCommand(terminalInput.trim());
              }
            }}>
              <div className="flex items-center">
                <span className="text-green-500 mr-2 whitespace-nowrap">kosuke@tsukuba:~/{currentDirectory}$</span>
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
            {/* Grid background pattern for NieR aesthetic */}
            <div className="absolute inset-0 grid-pattern"></div>
            
            {/* Glitch effect containers */}
            <div className="glitch-slice-container absolute inset-0 z-0 opacity-10 pointer-events-none">
              <div className="glitch-slice" style={{ top: '20%', height: '5px' }}></div>
              <div className="glitch-slice" style={{ top: '35%', height: '3px' }}></div>
              <div className="glitch-slice" style={{ top: '65%', height: '7px' }}></div>
              <div className="glitch-slice" style={{ top: '80%', height: '4px' }}></div>
            </div>
            
            {/* NieR:Automata style hexagonal grid navigation */}
            <div className="hidden lg:block absolute right-10 top-32 hexagon-grid-container z-10">
              <div className="hexagon-grid">
                <div className="hexagon-item" onClick={() => navigateTo('research')}>
                  <div className="hexagon-content">研究</div>
                  <div className="hexagon-label">Research</div>
                </div>
                <div className="hexagon-item" onClick={() => navigateTo('skills')}>
                  <div className="hexagon-content">スキル</div>
                  <div className="hexagon-label">Skills</div>
                </div>
                <div className="hexagon-item" onClick={() => navigateTo('artwork')}>
                  <div className="hexagon-content">作品</div>
                  <div className="hexagon-label">Artwork</div>
                </div>
                <div className="hexagon-item" onClick={() => navigateTo('publications')}>
                  <div className="hexagon-content">出版</div>
                  <div className="hexagon-label">Publications</div>
                </div>
                <div className="hexagon-item" onClick={() => navigateTo('contact')}>
                  <div className="hexagon-content">連絡</div>
                  <div className="hexagon-label">Contact</div>
                </div>
                <div className="hexagon-item" onClick={toggleTerminal}>
                  <div className="hexagon-content">
                    <Terminal size={24} />
                  </div>
                  <div className="hexagon-label">Terminal</div>
                </div>
              </div>
            </div>
            
            <div className="glitch-container my-16 text-center relative z-10">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 main-title-glitch">
                <span data-text="HUMAN · MEMORY · MACHINE">MEMORY-BOOT-ENGINE</span>
              </h1>
              <div className="digital-noise"></div>
            </div>
            
            <div className="max-w-3xl mx-auto relative z-10">
              <div className="flex items-center mb-6 justify-center">
                <div className="w-20 h-20 rounded-full bg-gray-700 overflow-hidden mr-4 border border-gray-600 glow-effect">
                  <img src="/api/placeholder/160/160" alt="Kosuke Shimizu" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold scanlines-text">Kosuke Shimizu</h2>
                  <p className="text-gray-400">CEO, litable | University of Tsukuba</p>
                </div>
              </div>
              
              <p className="text-xl mb-8 text-gray-300 text-center position-relative glitch-text-subtle">
                Exploring the intersection of human memory and computational systems through interactive experiences. 
                Bachelor at the College of Media Arts, Science, and Technology.
              </p>
              
              {/* Latest Projects Highlight */}
              <div className="mb-16 mt-12 relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-green-500 opacity-50"></div>
                <h3 className="text-xl font-semibold mb-6 text-center">Current Projects</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-gray-600 p-4 hover:border-green-500 transition-all duration-300 bg-gray-900 bg-opacity-50">
                    <h4 className="font-medium mb-2">Memory Interface</h4>
                    <p className="text-sm text-gray-400">An exploration of how digital interfaces can mirror human memory processes</p>
                  </div>
                  <div className="border border-gray-600 p-4 hover:border-green-500 transition-all duration-300 bg-gray-900 bg-opacity-50">
                    <h4 className="font-medium mb-2">Parametric Visuals</h4>
                    <p className="text-sm text-gray-400">Generating dynamic visual systems from personal memory data</p>
                  </div>
                  <div className="border border-gray-600 p-4 hover:border-green-500 transition-all duration-300 bg-gray-900 bg-opacity-50">
                    <h4 className="font-medium mb-2">NieR-Inspired HCI</h4>
                    <p className="text-sm text-gray-400">Interface designs influenced by existential video game narratives</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <button onClick={() => navigateTo('research')} className="flex-1 border border-gray-500 px-6 py-3 hover:bg-white hover:text-black transition duration-300 group relative overflow-hidden">
                  <span className="flex justify-center items-center relative z-10">
                    <span className="mr-2">Research</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">⟶</span>
                  </span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </button>
                <button onClick={() => navigateTo('contact')} className="flex-1 border border-gray-500 px-6 py-3 hover:bg-white hover:text-black transition duration-300 group relative overflow-hidden">
                  <span className="flex justify-center items-center relative z-10">
                    <span className="mr-2">Connect</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">⟶</span>
                  </span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </button>
                <button onClick={toggleTerminal} className="flex-1 border border-gray-500 px-6 py-3 hover:bg-white hover:text-black transition duration-300 group relative overflow-hidden">
                  <span className="flex justify-center items-center relative z-10">
                    <span className="mr-2">Terminal</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">⟶</span>
                  </span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </button>
              </div>
            </div>
            
            <div className="mt-16 max-w-4xl mx-auto">
              <div className="border-l-2 border-gray-700 pl-6 py-2 relative">
                <div className="digital-noise absolute inset-0 opacity-5"></div>
                <p className="text-gray-400 italic relative z-10">
                  "The act of storage is an act of human-computer symbiosis that shapes both the memory and the person."
                </p>
              </div>
              
              <div className="mt-12 text-center">
                <p className="text-sm text-gray-500 glitch-text-subtle">Try using the terminal to discover hidden content</p>
                <div className="mt-2 text-xs text-gray-600 cursor-pointer hover:text-gray-400" onClick={toggleTerminal}>
                  Type '/help' to see available commands
                </div>
              </div>
            </div>
          </section>
        )}
        
        {activeSection === 'research' && (
          <section className="py-16">
            <h2 className="text-3xl font-bold mb-12 flex items-center">
              <span className="text-gray-500 mr-2">/</span>
              Research Work
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Research Project 1 */}
              <div className="border border-gray-800 hover:border-gray-600 p-6 transition duration-300">
                <h3 className="text-xl font-semibold mb-3">Memory Augmentation Interfaces</h3>
                <p className="text-gray-400 mb-4">
                  Exploring how digital interfaces can enhance and extend human memory through novel interaction paradigms.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">2023-Present</span>
                  <button className="text-sm flex items-center text-gray-400 hover:text-white">
                    View Details <ChevronDown size={16} className="ml-1" />
                  </button>
                </div>
              </div>
              
              {/* Research Project 2 */}
              <div className="border border-gray-800 hover:border-gray-600 p-6 transition duration-300">
                <h3 className="text-xl font-semibold mb-3">Parametric Memory Visualization</h3>
                <p className="text-gray-400 mb-4">
                  Developing generative systems that visualize personal memory patterns through interactive 3D structures.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">2022-2023</span>
                  <button className="text-sm flex items-center text-gray-400 hover:text-white">
                    View Details <ChevronDown size={16} className="ml-1" />
                  </button>
                </div>
              </div>
              
              {/* Research Project 3 */}
              <div className="border border-gray-800 hover:border-gray-600 p-6 transition duration-300">
                <h3 className="text-xl font-semibold mb-3">Cognitive Load & Interface Design</h3>
                <p className="text-gray-400 mb-4">
                  Investigating how minimalist interfaces can reduce cognitive load while enhancing information retention.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">2021-2022</span>
                  <button className="text-sm flex items-center text-gray-400 hover:text-white">
                    View Details <ChevronDown size={16} className="ml-1" />
                  </button>
                </div>
              </div>
              
              {/* Research Project 4 */}
              <div className="border border-gray-800 hover:border-gray-600 p-6 transition duration-300">
                <h3 className="text-xl font-semibold mb-3">Ephemeral Computing Experiences</h3>
                <p className="text-gray-400 mb-4">
                  Designing interaction models that mirror human memory's impermanence and adaptive qualities.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">2020-2021</span>
                  <button className="text-sm flex items-center text-gray-400 hover:text-white">
                    View Details <ChevronDown size={16} className="ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {activeSection === 'publications' && (
          <section className="py-16">
            <h2 className="text-3xl font-bold mb-12 flex items-center">
              <span className="text-gray-500 mr-2">/</span>
              Publications
            </h2>
            
            <div className="space-y-8">
              {/* Publication 1 */}
              <div className="border-l-2 border-gray-800 pl-6 py-2 hover:border-gray-600 transition-all">
                <h3 className="text-xl font-semibold mb-2">Memory as Interface: Designing HCI Systems Inspired by Cognitive Processes</h3>
                <p className="text-gray-400 mb-2">Journal of Human-Computer Interaction, 2024</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="flex items-center mr-4">
                    <ExternalLink size={12} className="mr-1" /> DOI: 10.1234/hci.2024.0123
                  </span>
                </div>
              </div>
              
              {/* Publication 2 */}
              <div className="border-l-2 border-gray-800 pl-6 py-2 hover:border-gray-600 transition-all">
                <h3 className="text-xl font-semibold mb-2">Parametric Visual Systems for Memory Augmentation</h3>
                <p className="text-gray-400 mb-2">Proceedings of CHI Conference on Human Factors in Computing Systems, 2023</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="flex items-center mr-4">
                    <ExternalLink size={12} className="mr-1" /> DOI: 10.1145/3544548.3581171
                  </span>
                </div>
              </div>
              
              {/* Publication 3 */}
              <div className="border-l-2 border-gray-800 pl-6 py-2 hover:border-gray-600 transition-all">
                <h3 className="text-xl font-semibold mb-2">The Aesthetics of Digital Memory: Implications for HCI Design</h3>
                <p className="text-gray-400 mb-2">Digital Creativity, 2022</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="flex items-center mr-4">
                    <ExternalLink size={12} className="mr-1" /> DOI: 10.1080/14626268.2022.123456
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {activeSection === 'artwork' && (
          <section className="py-16">
            <h2 className="text-3xl font-bold mb-12 flex items-center">
              <span className="text-gray-500 mr-2">/</span>
              Artwork & Projects
            </h2>
            
            {/* Hexagonal grid for artwork */}
            <div className="max-w-6xl mx-auto">
              <div className="artwork-hexagon-grid">
                {/* Artwork 1 */}
                <div className="artwork-hexagon cursor-pointer" 
                  onClick={() => window.open('#artwork-detail', '_self')}
                  onMouseEnter={(e) => {
                    const glitchEffect = document.createElement('div');
                    glitchEffect.className = 'absolute inset-0 glitch-overlay z-10';
                    e.currentTarget.appendChild(glitchEffect);
                    
                    setTimeout(() => {
                      if (glitchEffect.parentElement) {
                        glitchEffect.parentElement.removeChild(glitchEffect);
                      }
                    }, 1000);
                  }}
                >
                  <div className="artwork-hexagon-content">
                    <img src="/api/placeholder/600/600" alt="Memory Fragments" className="object-cover" />
                    <div className="artwork-overlay">
                      <h3 className="text-lg font-semibold">Memory Fragments</h3>
                      <p className="text-sm">Interactive WebGL</p>
                    </div>
                  </div>
                </div>
                
                {/* Artwork 2 */}
                <div className="artwork-hexagon cursor-pointer" 
                  onClick={() => window.open('#artwork-detail', '_self')}
                  onMouseEnter={(e) => {
                    const element = e.currentTarget;
                    element.classList.add('artwork-pulse');
                    setTimeout(() => element.classList.remove('artwork-pulse'), 1000);
                  }}
                >
                  <div className="artwork-hexagon-content">
                    <img src="/api/placeholder/600/600" alt="Digital Echo Chamber" className="object-cover" />
                    <div className="artwork-overlay">
                      <h3 className="text-lg font-semibold">Digital Echo</h3>
                      <p className="text-sm">WebGL Experiment</p>
                    </div>
                  </div>
                </div>
                
                {/* Artwork 3 */}
                <div className="artwork-hexagon cursor-pointer" 
                  onClick={() => window.open('#artwork-detail', '_self')}
                  onMouseEnter={(e) => {
                    const element = e.currentTarget;
                    for (let i = 0; i < 5; i++) {
                      setTimeout(() => {
                        element.style.filter = 'hue-rotate(90deg)';
                        setTimeout(() => {
                          element.style.filter = 'none';
                        }, 100);
                      }, i * 200);
                    }
                  }}
                >
                  <div className="artwork-hexagon-content">
                    <img src="/api/placeholder/600/600" alt="Neural Pathways" className="object-cover" />
                    <div className="artwork-overlay">
                      <h3 className="text-lg font-semibold">Neural Pathways</h3>
                      <p className="text-sm">Parametric Design</p>
                    </div>
                  </div>
                </div>
                
                {/* Artwork 4 - Hidden until discovered */}
                {hiddenContent.secretProjectVisible ? (
                  <div className="artwork-hexagon cursor-pointer secret-project" 
                    onClick={() => window.open('#artwork-detail', '_self')}
                  >
                    <div className="artwork-hexagon-content">
                      <img src="/api/placeholder/600/600" alt="Ghost Memories" className="object-cover" />
                      <div className="artwork-overlay">
                        <h3 className="text-lg font-semibold">Ghost Memories</h3>
                        <p className="text-sm text-green-400">[SECRET]</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="artwork-hexagon cursor-pointer locked">
                    <div className="artwork-hexagon-content">
                      <div className="artwork-overlay flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-gray-500 mb-2">???</div>
                          <p className="text-xs text-gray-600">Use terminal to unlock</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Artwork 5 */}
                <div className="artwork-hexagon cursor-pointer">
                  <div className="artwork-hexagon-content">
                    <img src="/api/placeholder/600/600" alt="Data Sonification" className="object-cover" />
                    <div className="artwork-overlay">
                      <h3 className="text-lg font-semibold">Data Sonification</h3>
                      <p className="text-sm">Audio Experiment</p>
                    </div>
                  </div>
                </div>
                
                {/* Artwork 6 */}
                <div className="artwork-hexagon cursor-pointer">
                  <div className="artwork-hexagon-content">
                    <img src="/api/placeholder/600/600" alt="Cognitive Interface" className="object-cover" />
                    <div className="artwork-overlay">
                      <h3 className="text-lg font-semibold">Cognitive Interface</h3>
                      <p className="text-sm">UI Concept</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-16 text-center">
              <p className="text-gray-400 mb-4">All projects explore the relationship between human memory and digital interfaces</p>
              <button 
                onClick={toggleTerminal}
                className="mt-4 border border-gray-600 px-4 py-2 text-sm hover:border-green-500 transition-all"
              >
                Access Terminal to discover hidden projects
              </button>
            </div>
          </section>
        )}
        
        {activeSection === 'skills' && (
          <section className="py-16">
            <h2 className="text-3xl font-bold mb-12 flex items-center">
              <span className="text-gray-500 mr-2">/</span>
              Skills & Expertise
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-semibold mb-6 flex items-center">
                  <span className="text-gray-500 mr-2">#</span>
                  Technical Skills
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>WebGL / GLSL</span>
                      <span className="text-gray-500">93%</span>
                    </div>
                    <div className="w-full bg-gray-800 h-1">
                      <div className="bg-gray-200 h-1" style={{ width: '93%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>JavaScript / p5.js</span>
                      <span className="text-gray-500">90%</span>
                    </div>
                    <div className="w-full bg-gray-800 h-1">
                      <div className="bg-gray-200 h-1" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Parametric Design</span>
                      <span className="text-gray-500">88%</span>
                    </div>
                    <div className="w-full bg-gray-800 h-1">
                      <div className="bg-gray-200 h-1" style={{ width: '88%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>React / Three.js</span>
                      <span className="text-gray-500">82%</span>
                    </div>
                    <div className="w-full bg-gray-800 h-1">
                      <div className="bg-gray-200 h-1" style={{ width: '82%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Python / Data Visualization</span>
                      <span className="text-gray-500">78%</span>
                    </div>
                    <div className="w-full bg-gray-800 h-1">
                      <div className="bg-gray-200 h-1" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-6 flex items-center">
                  <span className="text-gray-500 mr-2">#</span>
                  Research Areas
                </h3>
                
                <div className="flex flex-wrap gap-3">
                  <span className="border border-gray-700 px-3 py-1 text-sm">Human-Computer Interaction</span>
                  <span className="border border-gray-700 px-3 py-1 text-sm">Memory Augmentation</span>
                  <span className="border border-gray-700 px-3 py-1 text-sm">Interface Design</span>
                  <span className="border border-gray-700 px-3 py-1 text-sm">Cognitive Psychology</span>
                  <span className="border border-gray-700 px-3 py-1 text-sm">Digital Art</span>
                  <span className="border border-gray-700 px-3 py-1 text-sm">Information Visualization</span>
                  <span className="border border-gray-700 px-3 py-1 text-sm">Interaction Design</span>
                  <span className="border border-gray-700 px-3 py-1 text-sm">Parametric Systems</span>
                  <span className="border border-gray-700 px-3 py-1 text-sm">Generative Design</span>
                  <span className="border border-gray-700 px-3 py-1 text-sm">Mixed Reality</span>
                </div>
                
                <h3 className="text-xl font-semibold my-6 flex items-center">
                  <span className="text-gray-500 mr-2">#</span>
                  Education
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">University of Tsukuba</h4>
                    <p className="text-gray-400 text-sm">Bachelor, College of Media Arts, Science, and Technology</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {activeSection === 'inspirations' && (
          <section className="py-16">
            <h2 className="text-3xl font-bold mb-12 flex items-center">
              <span className="text-gray-500 mr-2">/</span>
              Inspirations
              <span className="ml-4 text-xs text-gray-500 animate-pulse">Terminal-revealed section</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* NieR: Automata */}
              <div className="border border-gray-800 hover:border-gray-600 group transition-all duration-300 overflow-hidden">
                <div className="aspect-w-16 aspect-h-9 bg-gray-900 relative">
                  <img src="/api/placeholder/600/340" alt="NieR: Automata" className="object-cover w-full h-full opacity-60 group-hover:opacity-40 transition-all duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-white px-4 text-center text-sm">A game that questions the boundary between human and machine consciousness</p>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">NieR: Automata</h3>
                  <p className="text-gray-400 text-sm">
                    Action RPG by Yoko Taro exploring themes of existence, consciousness, and memory in a future where androids fight machine lifeforms.
                  </p>
                  <div className="mt-4 text-xs text-gray-500 flex space-x-2">
                    <span className="border border-gray-700 px-2 py-1">Multiple Endings</span>
                    <span className="border border-gray-700 px-2 py-1">Philosophy</span>
                    <span className="border border-gray-700 px-2 py-1">Memory</span>
                  </div>
                </div>
              </div>
              
              {/* Project Itoh - Harmony */}
              <div className="border border-gray-800 hover:border-gray-600 group transition-all duration-300 overflow-hidden">
                <div className="aspect-w-16 aspect-h-9 bg-gray-900 relative">
                  <img src="/api/placeholder/600/340" alt="Harmony - Project Itoh" className="object-cover w-full h-full opacity-60 group-hover:opacity-40 transition-all duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-white px-4 text-center text-sm">A novel exploring the clash between human individuality and societal harmony</p>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">Harmony - Project Itoh</h3>
                  <p className="text-gray-400 text-sm">
                    Novel set in a utopian world where human health is constantly monitored, exploring themes of free will and the nature of consciousness.
                  </p>
                  <div className="mt-4 text-xs text-gray-500 flex space-x-2">
                    <span className="border border-gray-700 px-2 py-1">Utopia</span>
                    <span className="border border-gray-700 px-2 py-1">Free Will</span>
                    <span className="border border-gray-700 px-2 py-1">Consciousness</span>
                  </div>
                </div>
              </div>
              
              {/* Ghost in the Shell */}
              <div className="border border-gray-800 hover:border-gray-600 group transition-all duration-300 overflow-hidden">
                <div className="aspect-w-16 aspect-h-9 bg-gray-900 relative">
                  <img src="/api/placeholder/600/340" alt="Ghost in the Shell" className="object-cover w-full h-full opacity-60 group-hover:opacity-40 transition-all duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-white px-4 text-center text-sm">A cyberpunk vision questioning the nature of humanity in a networked world</p>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">Ghost in the Shell</h3>
                  <p className="text-gray-400 text-sm">
                    Cyberpunk franchise that explores the boundary between human and machine, the nature of identity, and consciousness in a networked society.
                  </p>
                  <div className="mt-4 text-xs text-gray-500 flex space-x-2">
                    <span className="border border-gray-700 px-2 py-1">Cyberpunk</span>
                    <span className="border border-gray-700 px-2 py-1">Identity</span>
                    <span className="border border-gray-700 px-2 py-1">Networked Minds</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-16 border-t border-gray-800 pt-12">
              <h3 className="text-2xl font-semibold mb-6">Influence on My Work</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-gray-300 mb-4">
                    These works explore the boundary between human and machine consciousness, memory as a construct, and the nature of identity in technological futures—themes that deeply influence my research in human-computer interaction.
                  </p>
                  <p className="text-gray-400">
                    I draw from their aesthetic sensibilities—minimalist interfaces with meaningful interactions, monochromatic designs with moments of visual impact, and systems that reveal complexity through engagement over time.
                  </p>
                </div>
                <div>
                  <p className="text-gray-300 mb-4">
                    My research on memory augmentation interfaces is directly inspired by how these works question the relationship between human experience, digital storage, and the blurring boundaries between mind and machine.
                  </p>
                  <p className="text-gray-400">
                    Like the multiple paths and hidden meanings in NieR: Automata, my interactive designs often contain layers of complexity that are revealed through continued exploration and interaction.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {activeSection === 'scores' && (
          <section className="py-16">
            <h2 className="text-3xl font-bold mb-12 flex items-center">
              <span className="text-gray-500 mr-2">/</span>
              Music Scores
              <span className="ml-4 text-xs text-gray-500 animate-pulse">Terminal-revealed section</span>
            </h2>
            
            <div className="mb-8">
              <p className="text-gray-300 mb-6">
                Music has been a significant influence on my creative work. Below are some compositions inspired by my favorite works that explore themes of memory, consciousness, and human-machine integration.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* NieR Score */}
              <div className="border border-gray-800 hover:border-gray-600 p-6 transition duration-300">
                <h3 className="text-xl font-semibold mb-3">Weight of the World (Cover)</h3>
                <p className="text-gray-400 mb-4">
                  An arrangement of the iconic track from NieR: Automata, reinterpreted through parametric sound design.
                </p>
                <div className="aspect-w-16 aspect-h-3 bg-gray-900 rounded mb-4">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-full px-8">
                      <div className="h-12 relative">
                        {[...Array(32)].map((_, i) => (
                          <div 
                            key={i} 
                            className="absolute bg-gray-600" 
                            style={{
                              height: `${Math.sin(i/2) * 20 + 30}%`,
                              width: '2px',
                              left: `${i * 3}%`,
                              bottom: '0',
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <button className="text-sm border border-gray-700 hover:border-gray-500 px-3 py-1 flex items-center">
                    <span className="mr-1">◼</span> Listen
                  </button>
                </div>
              </div>
              
              {/* Ghost in the Shell Score */}
              <div className="border border-gray-800 hover:border-gray-600 p-6 transition duration-300">
                <h3 className="text-xl font-semibold mb-3">Inner Universe (Reinterpretation)</h3>
                <p className="text-gray-400 mb-4">
                  A reinterpretation of the Ghost in the Shell: Stand Alone Complex opening theme with generative elements.
                </p>
                <div className="aspect-w-16 aspect-h-3 bg-gray-900 rounded mb-4">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-full px-8">
                      <div className="h-12 relative">
                        {[...Array(48)].map((_, i) => (
                          <div 
                            key={i} 
                            className="absolute bg-gray-600" 
                            style={{
                              height: `${Math.cos(i/3) * 25 + 40}%`,
                              width: '1px',
                              left: `${i * 2}%`,
                              bottom: '0',
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <button className="text-sm border border-gray-700 hover:border-gray-500 px-3 py-1 flex items-center">
                    <span className="mr-1">◼</span> Listen
                  </button>
                </div>
              </div>
              
              {/* Harmony Score */}
              <div className="border border-gray-800 hover:border-gray-600 p-6 transition duration-300">
                <h3 className="text-xl font-semibold mb-3">Meditations on Harmony</h3>
                <p className="text-gray-400 mb-4">
                  An original composition inspired by themes from Project Itoh's Harmony, exploring the balance between order and chaos.
                </p>
                <div className="aspect-w-16 aspect-h-3 bg-gray-900 rounded mb-4">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-full px-8">
                      <div className="h-12 relative">
                        {[...Array(32)].map((_, i) => {
                          const height = Math.sin(i/4) * 25 + (i % 5 === 0 ? 60 : 30);
                          return (
                            <div 
                              key={i} 
                              className="absolute bg-gray-600" 
                              style={{
                                height: `${height}%`,
                                width: '2px',
                                left: `${i * 3}%`,
                                bottom: '0',
                              }}
                            ></div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <button className="text-sm border border-gray-700 hover:border-gray-500 px-3 py-1 flex items-center">
                    <span className="mr-1">◼</span> Listen
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-16 border-t border-gray-800 pt-8">
              <h3 className="text-xl font-semibold mb-6">Sound & Interface Design</h3>
              <p className="text-gray-300 mb-4">
                My work explores the relationship between sound, memory, and interface design. The compositions above represent experiments in creating auditory experiences that complement my visual interface work.
              </p>
              <p className="text-gray-400">
                The audio waveforms themselves become interfaces - parametrically generated and responsive to user interaction, blurring the line between what is heard and what is seen.
              </p>
            </div>
          </section>
        )}
        
        {activeSection === 'contact' && (
          <section className="py-16">
            <h2 className="text-3xl font-bold mb-12 flex items-center">
              <span className="text-gray-500 mr-2">/</span>
              Contact
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-semibold mb-6">Connect</h3>
                <p className="text-gray-400 mb-8">
                  Interested in collaboration, research opportunities, or discussing human-computer interaction? I'd love to hear from you.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="text-gray-500 w-24">Email</span>
                    <a href="#" className="text-gray-300 hover:text-white">kosuke.shimizu@tsukuba.ac.jp</a>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-gray-500 w-24">Company</span>
                    <span>litable, Founder & CEO</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-gray-500 w-24">Location</span>
                    <span>University of Tsukuba, Japan</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-gray-500 w-24">Social</span>
                    <div className="flex space-x-4">
                      <a href="#" className="text-gray-400 hover:text-white">Github</a>
                      <a href="#" className="text-gray-400 hover:text-white">LinkedIn</a>
                      <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-6">Send a Message</h3>
                
                <form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm mb-1">Name</label>
                    <input
                      type="text"
                      id="name"
                      className="w-full bg-transparent border border-gray-700 p-2 focus:border-gray-400 outline-none"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm mb-1">Email</label>
                    <input
                      type="email"
                      id="email"
                      className="w-full bg-transparent border border-gray-700 p-2 focus:border-gray-400 outline-none"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm mb-1">Message</label>
                    <textarea
                      id="message"
                      rows="5"
                      className="w-full bg-transparent border border-gray-700 p-2 focus:border-gray-400 outline-none"
                    ></textarea>
                  </div>
                  
                  <button type="submit" className="border border-gray-500 px-6 py-2 hover:bg-white hover:text-black transition duration-300">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
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
            <a href="#" className="text-gray-500 hover:text-white text-sm">Github</a>
            <a href="#" className="text-gray-500 hover:text-white text-sm">LinkedIn</a>
            <a href="#" className="text-gray-500 hover:text-white text-sm">Twitter</a>
          </div>
        </div>
      </footer>    
    </div>
  );
};

export default Portfolio;