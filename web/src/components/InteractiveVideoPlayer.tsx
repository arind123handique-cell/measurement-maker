import React, { useState, useRef } from 'react';
import {
  Sparkles,
  MousePointer,
  Film
} from 'lucide-react';
import {
  type GoogleFlowVideoResult,
  GOOGLE_FLOW_PRESETS,
  generateGoogleFlowMotion
} from '../lib/googleFlowService';

export interface InteractiveVideoPlayerProps {
  initialVideoUrl?: string;
  projectTitle?: string;
}

export const InteractiveVideoPlayer: React.FC<InteractiveVideoPlayerProps> = ({
  initialVideoUrl = GOOGLE_FLOW_PRESETS.architecturalWalkthrough.videoUrl,
  projectTitle = 'Repairing and Renovation of Circuit House at Bokakhat',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMouseScrubbing, setIsMouseScrubbing] = useState(true);
  const [scrubPercent, setScrubPercent] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(8);

  // Google Flow Generation Modal / Prompt State
  const [customPrompt, setCustomPrompt] = useState(
    'Cinematic 4k smooth drone architectural walkthrough inside the newly renovated Circuit House at Bokakhat, showing vitrified tiled suites, high ceilings, sunny verandah, photorealistic architectural render'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('walkthrough');

  // Handle Video Duration Load
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 8);
    }
  };

  // Video Time Update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setScrubPercent((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  // Mouse Scrubbing Engine: moving mouse horizontally across the video scrubs time!
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseScrubbing || !containerRef.current || !videoRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, relativeX / rect.width));

    const targetTime = percent * (videoRef.current.duration || duration);
    videoRef.current.currentTime = targetTime;
    setScrubPercent(percent * 100);
    setCurrentTime(targetTime);
  };

  // Toggle Play / Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      setIsMouseScrubbing(false); // Disable mouse scrub while naturally playing
    }
  };

  // Generate new video with Google Flow
  const handleGenerateFlow = async () => {
    try {
      setIsGenerating(true);
      const result: GoogleFlowVideoResult = await generateGoogleFlowMotion({
        ingredientId: '@Bokakhat_CircuitHouse_Model',
        prompt: customPrompt,
        resolution: '1080p',
        durationSeconds: 8,
        aspectRatio: '16:9',
      });
      setVideoUrl(result.videoUrl);
      if (videoRef.current) {
        videoRef.current.load();
      }
    } catch (err) {
      console.error('Failed to generate Google Flow video:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-2xl text-white space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-600 text-black font-mono uppercase tracking-wider flex items-center gap-1">
              <Film className="w-3 h-3" />
              Google Flow Motion Studio
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Real-Time Scrub Engine
            </span>
          </div>
          <h4 className="text-sm font-bold text-white">
            {projectTitle}
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMouseScrubbing(!isMouseScrubbing)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isMouseScrubbing
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span>{isMouseScrubbing ? 'Mouse Scrub: Active' : 'Mouse Scrub: Disabled'}</span>
          </button>

          <button
            onClick={togglePlay}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-black font-bold transition-all"
          >
            {isPlaying ? 'Pause' : 'Play Loop'}
          </button>
        </div>
      </div>

      {/* Main Video Viewport with Horizontal Mouse Tracking */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-slate-700 shadow-inner group cursor-ew-resize select-none"
      >
        <video
          ref={videoRef}
          src={videoUrl}
          playsInline
          muted
          loop
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-full object-cover"
        />

        {/* Video Scrubber Timeline Progress Bar */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col gap-1.5">
          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
            <div
              style={{ width: `${scrubPercent}%` }}
              className="bg-cyan-400 h-full rounded-full transition-all duration-75 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-white/80 font-mono">
            <div className="flex items-center gap-2">
              <span className="font-bold text-cyan-300">
                {currentTime.toFixed(1)}s / {duration.toFixed(1)}s ({Math.round(scrubPercent)}%)
              </span>
              {isMouseScrubbing && (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-sans">
                  <MousePointer className="w-3 h-3" />
                  Move mouse horizontally to scrub walkthrough
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-slate-300">
                1080p 60fps • Google Flow
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Google Flow Prompt Studio Bar */}
      <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800/80 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-cyan-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Google Flow Motion Studio (Character & Blueprint Ingredients)
          </span>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <button
              onClick={() => {
                setSelectedPreset('walkthrough');
                setVideoUrl(GOOGLE_FLOW_PRESETS.architecturalWalkthrough.videoUrl);
              }}
              className={`px-2 py-0.5 rounded ${selectedPreset === 'walkthrough' ? 'bg-cyan-600 text-black font-bold' : 'hover:bg-slate-800'}`}
            >
              Tour Preset
            </button>
            <button
              onClick={() => {
                setSelectedPreset('site');
                setVideoUrl(GOOGLE_FLOW_PRESETS.constructionTimelapse.videoUrl);
              }}
              className={`px-2 py-0.5 rounded ${selectedPreset === 'site' ? 'bg-cyan-600 text-black font-bold' : 'hover:bg-slate-800'}`}
            >
              Site Timelapse
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Describe architectural tour to generate with Google Flow..."
            className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          <button
            onClick={handleGenerateFlow}
            disabled={isGenerating}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-black flex items-center justify-center gap-2 shadow-sm transition-all shrink-0 active:scale-95"
          >
            {isGenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Synthesizing with Flow...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Flow Tour</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InteractiveVideoPlayer;
