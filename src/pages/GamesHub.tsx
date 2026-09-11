import { GAMES } from '../lib/constants';
import { GameCard } from '../components/GameCard';
import { useStore } from '../lib/store';

export const GamesHub = () => {
  const { stats } = useStore();

  return (
    <div className="min-h-screen relative z-10 px-4 pt-24 pb-16">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
            CHOOSE YOUR KALAVARA
          </h1>
          <p className="text-zinc-400 font-mono">
            {stats.gamesCompleted.length} of {GAMES.length} challenges survived.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GAMES.map((game) => (
            <GameCard 
              key={game.id} 
              game={game} 
              completed={stats.gamesCompleted.includes(game.id)} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};
