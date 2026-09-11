import { Link, useNavigate } from 'react-router-dom';
import { GAMES } from '../lib/constants';
import { ArrowRight, Shuffle, Grip } from 'lucide-react';
import { useStore } from '../lib/store';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { stats } = useStore();
  return (
    <div className="min-h-screen flex items-center justify-center relative z-10 px-4 pt-16">
      <div className="max-w-4xl w-full mx-auto text-center">
        
        <div className="mb-6 inline-block">
          <span className="font-mono text-green-500 bg-green-500/10 border border-green-500/30 px-4 py-1.5 rounded-full text-sm animate-pulse">
            SYSTEM STATUS: CRITICALLY FRUSTRATING
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-tight">
          THANKANTE <br className="md:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
            KALAVARA
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-zinc-300 mb-4 font-light">
          Why do simple tasks normally when you can suffer through them?
        </p>
        
        <p className="text-zinc-500 max-w-2xl mx-auto mb-12">
          A collection of absurd UI experiments designed to test your patience, destroy your expectations, and waste your time in the most entertaining way possible. 23 games. 0 usability.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/games/password-torture" 
            className="w-full sm:w-auto px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-bold font-mono rounded flex items-center justify-center gap-3 transition-colors group"
          >
            ENTER THE KALAVARA
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link 
            to="/games" 
            className="w-full sm:w-auto px-8 py-4 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-white font-mono rounded flex items-center justify-center gap-3 transition-colors"
          >
            <Grip size={20} />
            VIEW ALL GAMES
          </Link>
          
          <button 
            onClick={() => {
              const uncompleted = GAMES.filter(g => !stats.gamesCompleted.includes(g.id));
              const targetList = uncompleted.length > 0 ? uncompleted : GAMES;
              const randomGame = targetList[Math.floor(Math.random() * targetList.length)];
              navigate(randomGame.path);
            }}
            className="w-full sm:w-auto px-8 py-4 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-white font-mono rounded flex items-center justify-center gap-3 transition-colors"
          >
            <Shuffle size={20} />
            RANDOM GAME
          </button>
        </div>

        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-mono text-xs text-zinc-600">
          <div>
            <div className="text-zinc-400 text-lg mb-1">{GAMES.length}</div>
            <div>MINI GAMES</div>
          </div>
          <div>
            <div className="text-zinc-400 text-lg mb-1">100%</div>
            <div>INTENTIONAL PAIN</div>
          </div>
          <div>
            <div className="text-zinc-400 text-lg mb-1">0%</div>
            <div>USABILITY</div>
          </div>
          <div>
            <div className="text-zinc-400 text-lg mb-1">∞</div>
            <div>FRUSTRATION</div>
          </div>
        </div>
      </div>
    </div>
  );
};
