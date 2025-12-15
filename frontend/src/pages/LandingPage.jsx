import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Brain, Zap, Search, Play, ArrowRight, 
  Sparkles, CheckCircle2, X, Menu 
} from 'lucide-react';

// FadeIn Component for scroll animations
const FadeIn = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <span className="text-2xl font-serif font-semibold tracking-tight text-[#3A4A30]">Noteably</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#features" className="hover:text-black transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-black transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-black transition-colors">Pricing</a>
          <button onClick={() => navigate('/login')} className="bg-[#5F6F52] text-white px-6 py-2 rounded-full hover:bg-[#3A4A30] transition-all">Get Started</button>
        </div>
        <button className="md:hidden p-2 text-gray-700">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
};

const Hero = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const navigate = useNavigate();

  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-[#F9F8F6]">
      <div className="container mx-auto px-6 text-center z-10 relative">
        <FadeIn>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-[#5F6F52]" />
            <span className="text-xs uppercase tracking-wider font-semibold text-[#3A4A30]">AI-Powered Study Assistant</span>
          </div>
        </FadeIn>
        
        <FadeIn delay={0.1}>
          <h1 className="text-6xl md:text-8xl font-serif mb-6 text-[#1A1A1A] leading-[0.95]">
            Turn content into <br/> <span className="italic text-[#5F6F52]">knowledge.</span>
          </h1>
        </FadeIn>
        
        <FadeIn delay={0.2}>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload any video, audio, or PDF. Noteably automatically generates structured notes, flashcards, and quizzes so you can focus on mastering the material.
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-[#5F6F52] text-white font-medium hover:bg-[#3A4A30] hover:-translate-y-0.5 transition-all shadow-lg shadow-[#5F6F52]/20">
              Generate Study Set
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
            <button className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all">
              <Play className="mr-2 w-4 h-4 fill-current" />
              See How It Works
            </button>
          </div>
        </FadeIn>
      </div>

      <motion.div 
        className="container mx-auto px-4 mt-16 relative"
        style={{ y }}
      >
        <div className="relative rounded-xl overflow-hidden shadow-2xl bg-white border border-gray-200">
            {/* macOS Window Header */}
            <div className="h-8 bg-[#EBECEF] border-b border-gray-300 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E]"></div>
                <div className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-[#D89E24]"></div>
                <div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29]"></div>
                <div className="flex-1 text-center text-xs font-medium text-gray-500 font-sans">Noteably - New Study Set</div>
            </div>

            {/* App UI Content (React Implementation) */}
            <div className="aspect-[16/10] bg-[#F9F8F6] flex overflow-hidden relative">
                {/* Sidebar */}
                <div className="w-48 bg-[#EBECEF]/50 border-r border-gray-200 hidden sm:flex flex-col p-4 gap-4">
                   <div className="flex items-center gap-2 mb-4 opacity-50">
                      <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
                      <div className="w-20 h-4 rounded-md bg-gray-200"></div>
                   </div>
                   <div className="space-y-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-2 w-full bg-gray-200 rounded-full opacity-60"></div>
                      ))}
                   </div>
                   <div className="mt-auto space-y-2">
                       <div className="h-8 w-full bg-white border border-gray-200 rounded-lg shadow-sm"></div>
                   </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6 md:p-8 flex flex-col gap-8">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                           <div className="h-5 w-32 bg-gray-800/10 rounded-md mb-2"></div>
                           <div className="h-3 w-48 bg-gray-800/5 rounded-md"></div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#5F6F52] text-white flex items-center justify-center">
                            <Sparkles className="w-4 h-4" />
                        </div>
                    </div>

                    {/* Upload Zone */}
                    <div className="flex-1 border-2 border-dashed border-[#5F6F52]/30 rounded-2xl bg-white/50 flex flex-col items-center justify-center gap-4 group hover:bg-white/80 transition-colors cursor-pointer">
                        <div className="w-16 h-16 rounded-full bg-[#F0F2EB] flex items-center justify-center group-hover:scale-110 transition-transform">
                            <div className="w-8 h-8 text-[#5F6F52] opacity-80" >
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-[#3A4A30] font-medium mb-1">Drop your lectures here</p>
                            <p className="text-xs text-gray-400">PDF, MP3, MP4 supported</p>
                        </div>
                    </div>

                    {/* Output Cards */}
                    <div className="grid grid-cols-3 gap-4">
                        {[ 
                           { label: "Notes", color: "bg-[#EBE7E0]" },
                           { label: "Cards", color: "bg-[#E0E2DB]" },
                           { label: "Quiz", color: "bg-[#D4D9C7]" }
                        ].map((item, i) => (
                           <div key={i} className={`${item.color} h-24 rounded-xl p-4 flex flex-col justify-between hover:-translate-y-1 transition-transform shadow-sm`}>
                               <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center">
                                   {i === 0 && <FileText className="w-4 h-4 text-[#3A4A30] opacity-75" />}
                                   {i === 1 && <Brain className="w-4 h-4 text-[#3A4A30] opacity-75" />}
                                   {i === 2 && <Zap className="w-4 h-4 text-[#3A4A30] opacity-75" />}
                               </div>
                               <div className="h-2 w-12 bg-[#3A4A30]/10 rounded-full"></div>
                           </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </motion.div>
    </section>
  );
};

const Features = () => {
  const features = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Auto-Transcription",
      desc: "Instant, accurate transcripts from lectures, meetings, or YouTube videos. Never miss a word again."
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Smart Flashcards",
      desc: "AI identifies key concepts and definitions to create spaced-repetition decks automatically."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Practice Quizzes",
      desc: "Test yourself with generated multiple-choice and short-answer questions before the real exam."
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Semantic Search",
      desc: "Ask questions like 'What did the professor say about mitocondria?' and get the exact timestamp."
    }
  ];

  return (
    <section className="py-24 bg-white" id="features">
      <div className="container mx-auto px-6">
        <FadeIn>
          <h2 className="text-4xl md:text-5xl font-serif mb-16 text-[#1A1A1A]">
            Your personal AI tutor.
          </h2>
        </FadeIn>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
          {features.map((f, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="group">
                <div className="mb-4 inline-flex p-3 rounded-2xl bg-[#F9F8F6] group-hover:bg-[#A9B388]/30 transition-colors duration-300 text-[#1A1A1A]">
                  {f.icon}
                </div>
                <h3 className="text-xl font-serif font-medium mb-3 text-[#1A1A1A]">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base pr-8">
                  {f.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

const NeuralBackground = () => {
  // Stable random generation for hydration consistency
  const [network] = React.useState(() => {
    const nodes = Array.from({ length: 50 }).map((_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      r: 1.5 + Math.random() * 2.5,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 3
    }));
    
    const links = [];
    nodes.forEach((a, i) => {
      nodes.slice(i + 1).forEach((b, j) => {
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        // Connect if close enough (increased threshold and nodes for more lines)
        if (dist < 25) {
          links.push({ 
            x1: a.x, y1: a.y, x2: b.x, y2: b.y, 
            id: `${i}-${j}`,
            delay: Math.random() * 2,
            width: 1 + Math.random() * 1.5 // Random width between 1px and 2.5px
          });
        }
      });
    });
    
    return { nodes, links };
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
      <svg className="w-full h-full text-[#5F6F52]" preserveAspectRatio="none">
        {network.links.map((link) => (
          <motion.line
            key={link.id}
            x1={`${link.x1}%`}
            y1={`${link.y1}%`}
            x2={`${link.x2}%`}
            y2={`${link.y2}%`}
            stroke="currentColor"
            strokeWidth={link.width}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: link.delay,
              ease: "easeInOut"
            }}
          />
        ))}
        {network.nodes.map((node, i) => (
          <motion.circle
            key={i}
            cx={`${node.x}%`}
            cy={`${node.y}%`}
            r={node.r}
            fill="currentColor"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.1, 1],
              x: [0, Math.random() * 5 - 2.5, 0],
              y: [0, Math.random() * 5 - 2.5, 0]
            }}
            transition={{
              duration: node.duration,
              repeat: Infinity,
              delay: node.delay,
              ease: "easeInOut"
            }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#F9F8F6]/50 to-[#F9F8F6]" />
    </div>
  );
};

const BigPicture = () => (
  <section className="py-24 bg-[#F9F8F6] overflow-hidden relative">
     {/* Replaced static image with animated component */}
     <NeuralBackground />

    <div className="container mx-auto px-6 relative z-10">
      <div className="flex flex-col md:flex-row items-center gap-16">
        <div className="w-full md:w-1/2">
          <FadeIn>
            <h2 className="text-4xl md:text-5xl font-serif mb-8 text-[#1A1A1A]">
              From Chaos to Clarity
            </h2>
            <div className="space-y-6">
              {[
                "Upload messy lecture recordings or 50-page PDFs.",
                "Let AI extract the structure, definitions, and key dates.",
                "Review clear, formatted notes and summaries.",
                "Export to Notion, Obsidian, or Anki in one click."
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="mt-1 w-6 h-6 shrink-0 rounded-full border border-[#5F6F52] flex items-center justify-center text-[#5F6F52] text-xs font-medium">
                    {i + 1}
                  </div>
                  <p className="text-gray-600">{item}</p>
                </div>
              ))}
              
              <div className="pt-8">
                <button className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-[#3A4A30] text-white font-medium hover:bg-[#1A1A1A] transition-all">
                  Start Organizing
                </button>
              </div>
            </div>
          </FadeIn>
        </div>
        
        <div className="w-full md:w-1/2 relative">
          <FadeIn delay={0.2} className="relative rounded-3xl overflow-hidden shadow-2xl bg-[#EBE7E0]">
            <img src="/feature-cards.png" alt="Structured Flashcards" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3A4A30]/10 to-transparent" />
          </FadeIn>
        </div>
      </div>
    </div>
  </section>
);

const Comparison = () => (
  <section className="py-24 bg-white relative">
    <div className="container mx-auto px-6">
      <div className="text-center mb-16">
        <FadeIn>
          <span className="text-xs font-bold tracking-widest uppercase text-[#5F6F52] mb-3 block">The New Way</span>
          <h2 className="text-4xl md:text-5xl font-serif text-[#1A1A1A]">Why use Noteably?</h2>
        </FadeIn>
      </div>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-16 items-center">
        <div className="w-full md:w-5/12">
            <FadeIn>
              <div className="bg-[#E5E0D8] rounded-3xl overflow-hidden relative shadow-lg">
                 <div className="p-8 aspect-square flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <div className="text-6xl font-serif text-[#3A4A30]">10x</div>
                        <div className="text-gray-600 font-medium">Faster Note Taking</div>
                        <p className="text-sm text-gray-500 px-6">Stop rewinding the video. Noteably captures everything the first time.</p>
                    </div>
                 </div>
              </div>
            </FadeIn>
        </div>

        <div className="w-full md:w-7/12">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
               <h3 className="font-serif text-xl border-b border-gray-200 pb-2 text-[#1A1A1A]">The Old Way</h3>
               <ul className="space-y-4 text-gray-500 text-sm">
                 <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-400"/> Pausing & rewinding video</li>
                 <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-400"/> Messy, unorganized scribbles</li>
                 <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-400"/> Spending hours making cards</li>
                 <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-400"/> Losing track of sources</li>
               </ul>
            </div>
            <div className="space-y-6">
               <h3 className="font-serif text-xl border-b border-[#5F6F52] pb-2 text-[#3A4A30]">Noteably Way</h3>
               <ul className="space-y-4 text-[#1A1A1A] font-medium text-sm">
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#5F6F52]"/> Full transcript in seconds</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#5F6F52]"/> Auto-generated summaries</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#5F6F52]"/> One-click flashcard decks</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#5F6F52]"/> Click-to-timestamp citations</li>
               </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-[#3A4A30] text-white/90 py-20">
    <div className="container mx-auto px-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="max-w-md">
          <h2 className="text-3xl font-serif mb-6 text-white">Connect with intelligence.</h2>
          <p className="text-white/60 mb-8 leading-relaxed">
            Stop wasting time on prep work. Let AI handle the structure so you can focus on the learning. Join thousands of students and professionals today.
          </p>
          <button className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-[#D4D9C7] text-[#3A4A30] font-medium hover:bg-white transition-all">
            Start Free Trial
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-12 md:gap-24 text-sm">
          <div>
            <h4 className="font-serif text-lg text-white mb-4">Product</h4>
            <ul className="space-y-3 text-white/60">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-lg text-white mb-4">Company</h4>
            <ul className="space-y-3 text-white/60">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-white/40">
        <p>© 2024 Noteably. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </div>
    </div>
  </footer>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans bg-[#F9F8F6]">
      <Navbar />
      <Hero />
      <Features />
      <BigPicture />
      <Comparison />
      <Footer />
    </div>
  );
}
