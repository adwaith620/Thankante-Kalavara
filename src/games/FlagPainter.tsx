import { useState, useRef, useEffect } from 'react';
import { GameLayout } from '../components/GameLayout';
import { useStore } from '../lib/store';
import { Paintbrush, Eraser, RotateCcw, Check } from 'lucide-react';
import { FLAG_ROASTS } from '../data/flagRoasts';
import { generateDeterministicFlag, compareCanvases } from '../lib/flagUtils';

const COUNTRIES = ["Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cote d Ivoire","Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo (Congo-Brazzaville)","Costa Rica","Croatia","Cuba","Cyprus","Czechia","Democratic Republic of the Congo","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine State","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States of America","Uruguay","Uzbekistan","Vanuatu","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"];

const COLORS = ["#000000","#FFFFFF","#FF0000","#00FF00","#0000FF","#FFFF00","#00FFFF","#FF00FF","#808080","#C0C0C0","#800000","#808000","#008000","#800080","#008080","#000080","#FFA500","#A52A2A","#FFC0CB","#FFD700","#4B0082","#40E0D0","#EE82EE","#F5F5DC","#00008B","#008B8B","#B8860B","#A9A9A9","#006400","#BDB76B","#8B008B","#556B2F","#FF8C00","#9932CC","#8B0000","#E9967A","#8FBC8F","#483D8B","#2F4F4F","#00CED1","#9400D3","#FF1493","#00BFFF","#696969","#1E90FF","#B22222","#FFFAF0","#228B22","#FF00FF","#DCDCDC","#F8F8FF","#FFD700","#DAA520","#808080","#008000","#ADFF2F","#F0FFF0","#FF69B4","#CD5C5C","#4B0082","#FFFFF0","#F0E68C","#E6E6FA","#FFF0F5","#7CFC00","#FFFACD","#ADD8E6","#F08080","#E0FFFF","#FAFAD2","#D3D3D3","#90EE90","#FFB6C1","#FFA07A","#20B2AA","#87CEFA","#778899","#B0C4DE","#FFFFE0","#00FF00","#32CD32","#FAF0E6","#FF00FF","#800000","#66CDAA","#0000CD","#BA55D3","#9370DB","#3CB371","#7B68EE","#00FA9A","#48D1CC","#C71585","#191970","#F5FFFA","#FFE4E1","#FFE4B5","#FFDEAD","#000080","#FDF5E6","#808000","#6B8E23","#FFA500","#FF4500","#DA70D6","#EEE8AA","#98FB98","#AFEEEE","#DB7093","#FFEFD5","#FFDAB9","#CD853F","#FFC0CB","#DDA0DD","#B0E0E6","#800080","#663399","#FF0000","#BC8F8F","#4169E1","#8B4513","#FA8072","#F4A460","#2E8B57","#FFF5EE","#A0522D","#C0C0C0","#87CEEB","#6A5ACD","#708090","#FFFAFA","#00FF7F","#4682B4","#D2B48C","#008080","#D8BFD8","#FF6347","#40E0D0","#EE82EE","#F5DEB3","#FFFFFF","#F5F5F5","#FFFF00","#9ACD32"];

export const FlagPainter = () => {
  const { recordAttempt, completeGame , recordFailure } = useStore();
  const [selectedCountry, setSelectedCountry] = useState(() => COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)]);
  const [color, setColor] = useState("#0000FF");
  const [brushSize, setBrushSize] = useState(10);
  const [isEraser, setIsEraser] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [currentRoast, setCurrentRoast] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetCanvasRef = useRef<HTMLCanvasElement>(null);

  // Track the last roast to prevent consecutive duplicates
  const lastRoastRef = useRef<string | null>(null);

  useEffect(() => {
    recordAttempt();
    initCanvas();
  }, []);

  useEffect(() => {
    if (hasWon || isLost) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsLost(true);
          recordFailure();
          // Timeout roast
          setCurrentRoast("You were too slow. The country dissolved before you could finish their flag.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [hasWon, isLost]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Fill white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleReset = () => {
    initCanvas();
    setHasWon(false);
    setIsLost(false);
    setTimeLeft(45);
    setAccuracy(null);
    setCurrentRoast(null);
    setSelectedCountry(COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)]);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (hasWon || isLost) return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.beginPath();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || hasWon || isLost) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get coordinates properly for both mouse and touch
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = isEraser ? '#FFFFFF' : color;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleSubmit = () => {
    if (!canvasRef.current) return;
    
    // Create target canvas offscreen to compare
    const targetCanvas = document.createElement('canvas');
    targetCanvas.width = 600;
    targetCanvas.height = 400;
    const targetCtx = targetCanvas.getContext('2d');
    if (!targetCtx) return;

    // Save target for rendering to the user so they can see what they missed
    targetCanvasRef.current = targetCanvas;

    generateDeterministicFlag(selectedCountry, targetCtx, 600, 400, COLORS);
    
    const userCtx = canvasRef.current.getContext('2d');
    if (!userCtx) return;
    
    const score = compareCanvases(userCtx, targetCtx, 600, 400);
    setAccuracy(score);
    
    if (score >= 80) {
      setHasWon(true);
      completeGame('flag-painter');
    } else {
      setIsLost(true);
      recordFailure();
      
      // Select random roast, avoiding the last one
      let newRoast;
      do {
        newRoast = FLAG_ROASTS[Math.floor(Math.random() * FLAG_ROASTS.length)];
      } while (newRoast === lastRoastRef.current && FLAG_ROASTS.length > 1);
      
      lastRoastRef.current = newRoast;
      setCurrentRoast(newRoast);
    }
  };

  const getStatusMessage = () => {
    if (isLost) return currentRoast || "Time is up. The flag is ruined.";
    if (hasWon) return `Incredible. Flag accuracy: ${accuracy}%.`;
    return `Paint the target flag with at least 80% accuracy. Time: ${timeLeft}s`;
  };

  return (
    <GameLayout 
      gameId="flag-painter"
      onReset={handleReset}
      statusMessage={getStatusMessage()}
      statusType={hasWon ? 'success' : (isLost ? 'error' : 'info')}
    >
      <div className="flex flex-col md:flex-row gap-8 items-start w-full max-w-4xl mx-auto">
        
        {/* Tools panel */}
        <div className="w-full md:w-64 flex flex-col gap-6 bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
          <div>
            <div className="flex flex-col gap-4 w-full max-w-xs md:max-w-sm shrink-0">
            <div className="w-full bg-zinc-900 border border-zinc-700 rounded p-4 text-white text-center shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
              <div className="text-xs text-zinc-500 font-mono mb-1">TARGET FLAG</div>
              <div className="font-bold text-lg leading-tight">{selectedCountry.toUpperCase()}</div>
            </div>

            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded border-2 border-white flex-shrink-0 shadow-lg"
                style={{ backgroundColor: color }}
              />
              <span className="font-mono text-sm text-zinc-400">Current Color</span>
            </div>

            <div className="flex flex-wrap gap-1 mb-4 w-full max-h-[30vh] overflow-y-auto p-2 bg-zinc-900 border border-zinc-700 rounded">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-sm border ${color === c ? 'border-white scale-110 z-10' : 'border-zinc-700/50'}`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-500 mb-2">BRUSH SIZE: {brushSize}px</label>
            <input 
              type="range" 
              min="1" 
              max="50" 
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              disabled={hasWon}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsEraser(false)}
              disabled={hasWon}
              className={`flex-1 flex justify-center py-2 rounded border ${!isEraser ? 'bg-zinc-800 border-zinc-600' : 'border-zinc-800'} transition-colors`}
            >
              <Paintbrush size={18} />
            </button>
            <button
              onClick={() => setIsEraser(true)}
              disabled={hasWon}
              className={`flex-1 flex justify-center py-2 rounded border ${isEraser ? 'bg-zinc-800 border-zinc-600' : 'border-zinc-800'} transition-colors`}
            >
              <Eraser size={18} />
            </button>
            <button
              onClick={initCanvas}
              disabled={hasWon}
              className="flex-1 flex justify-center py-2 rounded border border-zinc-800 hover:bg-red-900/20 hover:border-red-500/50 hover:text-red-400 transition-colors"
            >
              <RotateCcw size={18} />
            </button>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={hasWon}
            className={`w-full py-3 mt-4 rounded font-mono font-bold flex items-center justify-center gap-2 transition-colors ${
              hasWon 
                ? 'bg-green-500/20 text-green-500 border border-green-500/50 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-500 text-white'
            }`}
          >
            {hasWon ? <><Check size={18} /> APPROVED</> : 'SUBMIT FLAG'}
          </button>
        </div>

        {/* Canvas Area */}
        <div className="flex-grow flex flex-col items-center w-full bg-zinc-900 rounded-lg border border-zinc-800 p-4 relative">
          
          {/* Main user canvas */}
          <div className="relative shadow-2xl shadow-black mb-4 w-full max-w-[600px]">
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              onMouseDown={startDrawing}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              onMouseMove={draw}
              onTouchStart={startDrawing}
              onTouchEnd={stopDrawing}
              onTouchCancel={stopDrawing}
              onTouchMove={draw}
              className={`border border-zinc-500 bg-white cursor-crosshair w-full h-auto ${hasWon ? 'opacity-50 pointer-events-none' : ''}`}
              style={{ touchAction: 'none' }}
            />
            {/* Overlay for failure/roast */}
            {isLost && accuracy !== null && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300 pointer-events-none">
                <div className="text-red-500 font-bold text-6xl mb-2">{accuracy.toFixed(1)}%</div>
                <div className="text-zinc-400 text-sm mb-4">SIMILARITY SCORE</div>
                <div className="text-white text-xl italic max-w-sm">"{currentRoast}"</div>
              </div>
            )}
            {hasWon && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/80 text-green-400 font-mono text-2xl font-bold px-6 py-4 border-2 border-green-500 rounded animate-in zoom-in rotate-12 backdrop-blur-sm">
                  ACCEPTED ({accuracy?.toFixed(1)}%)
                </div>
              </div>
            )}
          </div>

          {/* Target Display after submission */}
          {(hasWon || isLost) && targetCanvasRef.current && (
            <div className="w-full flex flex-col items-center animate-in slide-in-from-bottom-4 pt-4 border-t border-zinc-800">
              <div className="text-zinc-500 text-xs mb-2 font-bold">ACTUAL FLAG OF {selectedCountry.toUpperCase()}</div>
              <div 
                className="w-full max-w-[300px] aspect-[3/2] border-2 border-zinc-700 bg-white shadow-lg"
                ref={(node) => {
                  if (node && targetCanvasRef.current) {
                    node.innerHTML = '';
                    targetCanvasRef.current.style.width = '100%';
                    targetCanvasRef.current.style.height = '100%';
                    node.appendChild(targetCanvasRef.current);
                  }
                }}
              />
            </div>
          )}

        </div>

      </div>
    </GameLayout>
  );
};
