import { useState, useEffect } from 'react';
import AudioManager from '@/utils/audio/audioManager';
import { motion } from 'framer-motion';

const AudioControls = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);
  const audioManager = AudioManager.getInstance();

  useEffect(() => {
    // Set initial volume
    audioManager.setVolume(volume);
  }, []);

  const handleMuteToggle = () => {
    // Play sound effect first (only if not currently muted)
    if (!isMuted) {
      audioManager.playEffect('button');
    }
    // Then toggle mute state
    const newMuteState = audioManager.toggleMute();
    setIsMuted(newMuteState);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioManager.setVolume(newVolume);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      drag
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      dragElastic={0}
      style={{ 
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 100,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        touchAction: 'none' // Prevent scrolling when dragging on mobile
      }}
      className="bg-black/70 backdrop-blur-sm p-3 rounded-lg border border-purple-500/30"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={handleMuteToggle}
          className={`text-2xl p-2 rounded-full transition-all ${
            isMuted 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
              : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
          }`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
        
        <div className="relative w-24 h-8 flex items-center">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="absolute w-full h-2 appearance-none bg-gray-700 rounded-full outline-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #BB86FC ${volume * 100}%, #333 ${volume * 100}%)`,
              WebkitAppearance: 'none',
              appearance: 'none'
            }}
          />
          <div 
            className="absolute pointer-events-none"
            style={{
              left: `calc(${volume * 100}% - 8px)`,
              top: '50%',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: '#BB86FC',
              boxShadow: '0 0 5px rgba(187, 134, 252, 0.5)'
            }}
          />
        </div>
        
        <div className="text-xs text-gray-400 ml-1 w-10 text-center">
          {Math.round(volume * 100)}%
        </div>
      </div>
      
      <div className="text-gray-500 text-xs text-center mt-1 cursor-move opacity-60 select-none">
        {isDragging ? "Positioning..." : "Drag to move"}
      </div>
    </motion.div>
  );
};

export default AudioControls; 