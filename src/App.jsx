import React from 'react'
import ObjectDetection from './components/ObjectDetection'
import './App.css'
import { Activity } from 'lucide-react'

function App() {
    return (
        <div className="min-h-screen bg-dark-bg">
            {/* Navbar */}
            <nav className="glass border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-teal to-accent-cyan flex items-center justify-center">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">VisionLite</h1>
                                <p className="text-xs text-zinc-500">AI Object Detection</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="hidden sm:flex items-center gap-2 text-sm">
                                <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></div>
                                <span className="text-zinc-400">Real-time Detection</span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 text-center animate-fade-in">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                        Real-Time <span className="bg-gradient-to-r from-accent-teal to-accent-cyan bg-clip-text text-transparent">Object Detection</span>
                    </h2>
                    <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto">
                        Powered by TensorFlow.js & COCO-SSD MobileNet V2. Detects people, cars, bottles, phones, and more.
                    </p>
                </div>

                <ObjectDetection />
            </main>

            {/* Footer */}
            <footer className="mt-16 pb-8 text-center">
                <p className="text-zinc-600 text-sm">
                    Built with React, Vite & TensorFlow.js
                </p>
            </footer>
        </div>
    )
}

export default App
