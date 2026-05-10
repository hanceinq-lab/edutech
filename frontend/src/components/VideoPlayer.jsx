import { useRef, useState, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { Play, Pause, Volume2, VolumeX, Maximize, CheckCircle } from 'lucide-react';
import api from '../api/axios';

export default function VideoPlayer({ videoUrl, lessonId, courseId, onComplete }) {
  const playerRef      = useRef(null);
  const wrapperRef     = useRef(null);
  const controlsTimer  = useRef(null);

  const [playing,      setPlaying]      = useState(false);
  const [muted,        setMuted]        = useState(false);
  const [played,       setPlayed]       = useState(0);       // 0–1
  const [duration,     setDuration]     = useState(0);       // seconds
  const [showControls, setShowControls] = useState(true);
  const [completed,    setCompleted]    = useState(false);

  const saveProgress = useCallback(
    async (seconds) => {
      if (!lessonId || !courseId) return;
      try {
        await api.post(`/courses/${courseId}/progress`, {
          lessonId,
          watchedSeconds: Math.round(seconds),
        });
      } catch (err) {
        console.warn('Progress save failed:', err.message);
      }
    },
    [lessonId, courseId]
  );

  const handleProgress = ({ playedSeconds, played: fraction }) => {
    setPlayed(fraction);
    if (fraction > 0.9 && !completed) {
      setCompleted(true);
      saveProgress(playedSeconds);
      onComplete?.();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 3000);
  };

  useEffect(() => () => clearTimeout(controlsTimer.current), []);

  const handleSeek = (e) => {
    const rect     = e.currentTarget.getBoundingClientRect();
    const fraction = (e.clientX - rect.left) / rect.width;
    playerRef.current?.seekTo(fraction, 'fraction');
  };

  const handleFullscreen = () => {
    const el = wrapperRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen?.();
    }
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m   = Math.floor(s / 60);
    const sec = String(Math.floor(s % 60)).padStart(2, '0');
    return `${m}:${sec}`;
  };

  return (
    <div
      ref={wrapperRef}
      className="relative bg-black rounded-xl overflow-hidden aspect-video"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        playing={playing}
        muted={muted}
        width="100%"
        height="100%"
        onProgress={handleProgress}
        onDuration={setDuration}
        progressInterval={5000}
        config={{
          file: {
            attributes: { controlsList: 'nodownload', disablePictureInPicture: true },
          },
        }}
      />

      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 ${
          showControls || !playing ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Centre play/pause */}
        <button
          onClick={() => setPlaying((p) => !p)}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          {playing
            ? <Pause className="w-8 h-8 text-white" />
            : <Play  className="w-8 h-8 text-white ml-1" />}
        </button>

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2">
          {/* Seek bar */}
          <div
            className="w-full h-1.5 bg-white/30 rounded-full cursor-pointer group/bar hover:h-2.5 transition-all duration-150"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-brand-500 rounded-full relative"
              style={{ width: `${played * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover/bar:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setPlaying((p) => !p)} className="text-white hover:text-brand-300 transition-colors">
                {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button onClick={() => setMuted((m) => !m)} className="text-white hover:text-brand-300 transition-colors">
                {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <span className="text-white text-sm font-mono">
                {fmt(played * duration)} / {fmt(duration)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {completed && (
                <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Completed
                </div>
              )}
              <button onClick={handleFullscreen} className="text-white hover:text-brand-300 transition-colors">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
