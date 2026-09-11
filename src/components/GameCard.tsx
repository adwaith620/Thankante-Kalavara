import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { GAMES } from '../lib/constants';

type Game = typeof GAMES[0];

export const GameCard = ({ game, completed }: { game: Game, completed: boolean }) => {
  return (
    <div className={`group relative bg-zinc-950/80 border ${completed ? 'border-green-500/50' : 'border-zinc-800 hover:border-green-500'} p-6 rounded-lg backdrop-blur-md transition-all hover:translate-y-[-2px] flex flex-col`}>
      <div className="flex justify-between items-start mb-4">
        <span className="font-mono text-zinc-500 text-sm">{game.number}</span>
        {completed && (
          <span className="text-xs font-mono bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30">
            SURVIVED
          </span>
        )}
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
        {game.title}
      </h3>
      
      <p className="text-zinc-400 text-sm mb-6 flex-grow">
        {game.description}
      </p>
      
      <div className="flex flex-col gap-2 mb-6 font-mono text-xs">
        <div className="flex justify-between">
          <span className="text-zinc-500">DIFFICULTY:</span>
          <span className="text-zinc-300">{game.difficulty}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">CHAOS:</span>
          <span className="text-zinc-300">{game.chaosLevel}</span>
        </div>
      </div>
      
      <Link 
        to={game.path}
        className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-900 group-hover:bg-green-500 group-hover:text-black text-zinc-300 font-mono text-sm tracking-wider font-bold rounded transition-colors"
      >
        <Play size={16} />
        PLAY
      </Link>
    </div>
  );
};
