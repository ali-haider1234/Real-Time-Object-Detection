import React, { useRef, useEffect, useState } from 'react';
import { loadModel, detectFrame, drawDetections, calculateFPS } from '../utils/detector';
import { Camera, CameraOff, Play, Square, Zap } from 'lucide-react';

function ObjectDetection() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const animationRef = useRef(null);
    const frameTimesRef = useRef([]);

    const [model, setModel] = useState(null);
    const [isModelLoading, setIsModelLoading] = useState(true);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [fps, setFps] = useState(0);
    const [error, setError] = useState(null);
    const [detectedObjects, setDetectedObjects] = useState([]);

    // Load model on component mount
    useEffect(() => {
        async function initModel() {
            try {
                setIsModelLoading(true);
                const loadedModel = await loadModel();
                setModel(loadedModel);
                setIsModelLoading(false);
            } catch (err) {
                setError('Failed to load model. Please refresh the page.');
                setIsModelLoading(false);
            }
        }

        initModel();

        return () => {
            stopCamera();
        };
    }, []);

    // Start camera
    const startCamera = async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;

                videoRef.current.onloadedmetadata = () => {
                    videoRef.current.play();
                    setIsCameraActive(true);
                    startDetection();
                };
            }
        } catch (err) {
            console.error('Camera access error:', err);
            setError('Failed to access camera. Please grant camera permissions.');
        }
    };

    // Stop camera
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }

        setIsCameraActive(false);
        setFps(0);
        setDetectedObjects([]);
        frameTimesRef.current = [];

        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    // Detection loop
    const startDetection = () => {
        const detect = async () => {
            if (videoRef.current && canvasRef.current && model && isCameraActive) {
                const video = videoRef.current;
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');

                if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                }

                const predictions = await detectFrame(model, video);

                drawDetections(predictions, ctx, video.videoWidth, video.videoHeight);

                // Update detected objects list (top 5 by confidence)
                const topPredictions = predictions
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 5);
                setDetectedObjects(topPredictions);

                const now = performance.now();
                frameTimesRef.current.push(now);
                if (frameTimesRef.current.length > 60) {
                    frameTimesRef.current.shift();
                }
                const currentFps = calculateFPS(frameTimesRef.current);
                setFps(currentFps);

                animationRef.current = requestAnimationFrame(detect);
            }
        };

        detect();
    };

    useEffect(() => {
        if (isCameraActive && model) {
            startDetection();
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isCameraActive, model]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Main Camera Area */}
            <div className="lg:col-span-2 space-y-4">
                {/* Video Card */}
                <div className={`glass rounded-2xl overflow-hidden transition-all duration-500 ${isCameraActive ? 'ring-2 ring-accent-teal/50 animate-glow' : ''
                    }`}>
                    <div className="relative aspect-video bg-black/50">
                        {!isCameraActive && !error && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center p-6">
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <Camera className="w-10 h-10 text-accent-teal" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">Ready to Detect</h3>
                                <p className="text-zinc-400 text-sm">Click "Start Camera" to begin real-time object detection</p>
                            </div>
                        )}

                        {error && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center p-6">
                                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                                    <CameraOff className="w-10 h-10 text-red-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-red-400 mb-2">Camera Access Error</h3>
                                <p className="text-zinc-400 text-sm">{error}</p>
                            </div>
                        )}

                        <video
                            ref={videoRef}
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isCameraActive ? 'opacity-100' : 'opacity-0'
                                }`}
                            autoPlay
                            playsInline
                            muted
                        />

                        <canvas
                            ref={canvasRef}
                            className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${isCameraActive ? 'opacity-100' : 'opacity-0'
                                }`}
                        />

                        {isCameraActive && (
                            <div className="absolute top-4 right-4 glass rounded-xl px-3 py-2 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-accent-green" />
                                <span className="text-sm font-semibold text-white">{fps} FPS</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex gap-3">
                    {!isCameraActive ? (
                        <button
                            onClick={startCamera}
                            disabled={isModelLoading}
                            className="flex-1 glass glass-hover rounded-xl px-6 py-4 flex items-center justify-center gap-3 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            <Play className="w-5 h-5 text-accent-teal group-hover:scale-110 transition-transform" />
                            {isModelLoading ? 'Loading Model...' : 'Start Camera'}
                        </button>
                    ) : (
                        <button
                            onClick={stopCamera}
                            className="flex-1 glass glass-hover rounded-xl px-6 py-4 flex items-center justify-center gap-3 font-semibold text-white group"
                        >
                            <Square className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
                            Stop Camera
                        </button>
                    )}
                </div>
            </div>

            {/* Detection Info Panel */}
            <div className="space-y-4">
                {/* Stats Card */}
                <div className="glass rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Detection Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-2xl font-bold text-white">{fps}</p>
                            <p className="text-xs text-zinc-500">Frames/sec</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-bold text-white">{detectedObjects.length}</p>
                            <p className="text-xs text-zinc-500">Objects</p>
                        </div>
                    </div>
                </div>

                {/* Detected Objects */}
                <div className="glass rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Detected Objects</h3>

                    {detectedObjects.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-zinc-500 text-sm">No objects detected yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {detectedObjects.map((obj, index) => (
                                <div key={index} className="animate-slide-up space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-white capitalize">{obj.class}</span>
                                        <span className="text-accent-teal font-semibold">{(obj.score * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-accent-teal to-accent-cyan rounded-full transition-all duration-300"
                                            style={{ width: `${obj.score * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Model Info */}
                <div className="glass rounded-2xl p-6 space-y-2">
                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Model Info</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-zinc-500">Architecture</span>
                            <span className="text-white font-medium">MobileNet V2</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-500">Framework</span>
                            <span className="text-white font-medium">TensorFlow.js</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-500">Dataset</span>
                            <span className="text-white font-medium">COCO-SSD</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading Overlay */}
            {isModelLoading && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="glass rounded-2xl p-8 max-w-sm w-full mx-4 text-center space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full border-4 border-accent-teal/20 border-t-accent-teal animate-spin"></div>
                        <h3 className="text-lg font-semibold text-white">Loading AI Model</h3>
                        <p className="text-sm text-zinc-400">Initializing COCO-SSD MobileNet V2...</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ObjectDetection;
