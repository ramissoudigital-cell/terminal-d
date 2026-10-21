import { useState, useEffect, useRef } from 'react';
import { X, Pause, Mic, Send } from 'lucide-react';

export default function VoiceNote({ onCancel, onSend }: { onCancel?: () => void, onSend?: (audioUrl?: string) => void }) {
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioData, setAudioData] = useState<number[]>([]);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    // Initialisation
    useEffect(() => {
        let stream: MediaStream | null = null;

        const startRecording = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;

                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
                analyserRef.current = audioContextRef.current.createAnalyser();
                const source = audioContextRef.current.createMediaStreamSource(stream);
                source.connect(analyserRef.current);
                analyserRef.current.fftSize = 64;

                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        chunksRef.current.push(e.data);
                    }
                };

                mediaRecorder.start(100); // collect 100ms chunks of data

                const updateAnalyser = () => {
                    if (analyserRef.current && !isPaused) {
                        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
                        analyserRef.current.getByteFrequencyData(dataArray);
                        
                        // Select a subset of frequencies for the visualizer
                        const visualizerData = [];
                        const step = Math.floor(dataArray.length / 30);
                        for (let i = 0; i < 30; i++) {
                            visualizerData.push(dataArray[i * step] || 0);
                        }
                        setAudioData(visualizerData);
                    }
                    animationFrameRef.current = requestAnimationFrame(updateAnalyser);
                };

                updateAnalyser();

            } catch (err) {
                console.warn("Note: Micro introuvable ou bloqué. Simulation audio active.", err);
                // Fallback: simulate audio visualizer data
                const simulateVisualizer = () => {
                    if (!isPaused) {
                        const fakeData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 180));
                        setAudioData(fakeData);
                    }
                    animationFrameRef.current = requestAnimationFrame(simulateVisualizer);
                };
                simulateVisualizer();
            }
        };

        startRecording();

        return () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (audioContextRef.current) {
                audioContextRef.current.close().catch(console.error);
            }
        };
    }, []);

    // Timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (!isPaused) {
            interval = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPaused]);

    const handleTogglePause = () => {
        if (isPaused) {
            mediaRecorderRef.current?.resume();
            audioContextRef.current?.resume();
        } else {
            mediaRecorderRef.current?.pause();
            audioContextRef.current?.suspend();
        }
        setIsPaused(!isPaused);
    };

    const handleSend = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(blob);
                if (onSend) onSend(audioUrl);
            };
            mediaRecorderRef.current.stop();
        } else if (chunksRef.current.length > 0) {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(blob);
            if (onSend) onSend(audioUrl);
        } else {
            if (onSend) onSend();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="absolute bottom-0 left-0 right-0 sm:rounded-b-[40px] rounded-t-[40px] px-8 pt-8 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-40 bg-white">
            <div className="flex flex-col items-center">
                
                {/* Title */}
                <h3 className="font-semibold mb-6 text-slate-800">
                    Note <span className="font-normal text-slate-400">vocale</span>
                </h3>
                
                {/* Wave Visualizer */}
                <div className="flex items-center justify-center h-16 w-full space-x-1.5 mb-6 px-4">
                    {[...Array(30)].map((_, i) => {
                        const audioValue = audioData[i] || 0;
                        const height = isPaused ? 20 : Math.max(20, (audioValue / 255) * 100);
                        return (
                            <div 
                                key={i}
                                className={`w-1 rounded-full transition-all duration-75`}
                                style={{ 
                                    height: `${height}%`,
                                    backgroundColor: i % 2 === 0 ? '#3b82f6' : '#bfdbfe' 
                                }} 
                            />
                        );
                    })}
                </div>

                {/* Timer */}
                <div className="text-lg font-mono font-medium mb-8 tracking-wider text-slate-800">
                    {formatTime(recordingTime)}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between w-full px-4">
                    {/* Cancel Button */}
                    <button 
                        onClick={onCancel}
                        className="w-12 h-12 flex items-center justify-center transition-colors text-slate-400 hover:text-slate-800 cursor-pointer"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Play/Pause Button */}
                    <button 
                        onClick={handleTogglePause} 
                        className="relative outline-none cursor-pointer group"
                    >
                        {!isPaused && (
                            <div className="absolute inset-0 bg-[#3b82f6] opacity-20 rounded-full animate-ping"></div>
                        )}
                        <div 
                            className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl group-hover:scale-105 group-active:scale-95 transition-transform"
                            style={{ 
                                background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
                                boxShadow: '0 20px 25px -5px rgba(37, 99, 235, 0.4)'
                            }}
                        >
                            {isPaused ? <Mic className="w-7 h-7" /> : <Pause className="w-7 h-7 fill-current" />}
                        </div>
                    </button>

                    {/* Send Button */}
                    <button 
                        onClick={handleSend}
                        className="w-12 h-12 flex items-center justify-center hover:text-blue-500 transition-colors text-slate-800 cursor-pointer"
                    >
                        <Send className="w-6 h-6 rotate-45 ml-1" />
                    </button>
                </div>
            </div>
        </div>
    );
}
