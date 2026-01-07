'use client';

import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Cloud, Sun, CloudRain, Snowflake, Wind, Thermometer, Umbrella, Heart } from 'lucide-react';

gsap.registerPlugin(useGSAP);

interface WeatherData {
    temp: number;
    condition: string;
    icon: string;
}

// Simulated weather - in production, use a real weather API
const getSimulatedWeather = (): WeatherData => {
    const month = new Date().getMonth();
    const hour = new Date().getHours();

    // Simulate based on month (Indian climate)
    if (month >= 3 && month <= 5) {
        // Summer (April-June)
        return { temp: 35 + Math.floor(Math.random() * 8), condition: 'hot', icon: 'sun' };
    } else if (month >= 6 && month <= 8) {
        // Monsoon (July-September)
        return { temp: 28 + Math.floor(Math.random() * 5), condition: 'rainy', icon: 'rain' };
    } else if (month >= 9 && month <= 10) {
        // Post-monsoon (October-November)
        return { temp: 25 + Math.floor(Math.random() * 5), condition: 'pleasant', icon: 'cloud' };
    } else {
        // Winter (December-March)
        return { temp: 15 + Math.floor(Math.random() * 10), condition: 'cold', icon: 'cold' };
    }
};

const getCareMessage = (weather: WeatherData): { message: string; emoji: string; tips: string[] } => {
    if (weather.condition === 'hot' || weather.temp >= 35) {
        return {
            message: "It's really hot today, Keerthi! Stay hydrated 💧",
            emoji: "🥵",
            tips: [
                "Drink lots of water!",
                "Avoid going out in afternoon sun",
                "Wear light, loose clothes",
                "Use sunscreen if you go out"
            ]
        };
    } else if (weather.condition === 'rainy') {
        return {
            message: "Rainy day! Don't forget your umbrella ☔",
            emoji: "🌧️",
            tips: [
                "Carry an umbrella!",
                "Wear waterproof shoes",
                "Drive carefully",
                "Perfect day for chai! ☕"
            ]
        };
    } else if (weather.condition === 'cold' || weather.temp <= 20) {
        return {
            message: "Brr! It's cold today. Bundle up, my love! 🧥",
            emoji: "🥶",
            tips: [
                "Wear warm clothes!",
                "Don't forget your jacket",
                "Have something warm to eat",
                "Perfect cuddle weather! 🤗"
            ]
        };
    } else {
        return {
            message: "Beautiful weather today! Enjoy your day 🌤️",
            emoji: "😊",
            tips: [
                "Perfect weather to go out!",
                "Maybe a nice walk?",
                "Enjoy the pleasant weather",
                "Have a wonderful day! 💕"
            ]
        };
    }
};

const WeatherIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'sun': return <Sun className="w-12 h-12 text-yellow-400" />;
        case 'rain': return <CloudRain className="w-12 h-12 text-blue-400" />;
        case 'cold': return <Snowflake className="w-12 h-12 text-cyan-400" />;
        default: return <Cloud className="w-12 h-12 text-gray-400" />;
    }
};

export default function WeatherCare() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Get simulated weather (replace with real API in production)
        const data = getSimulatedWeather();
        setWeather(data);
    }, []);

    useGSAP(() => {
        if (!containerRef.current) return;
        gsap.fromTo(containerRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
    }, { scope: containerRef });

    if (!weather) return null;

    const care = getCareMessage(weather);

    return (
        <div ref={containerRef} className="w-full">
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <WeatherIcon type={weather.icon} />
                        <div>
                            <div className="flex items-center gap-2">
                                <Thermometer className="w-4 h-4 opacity-50" />
                                <span className="text-3xl font-bold">{weather.temp}°C</span>
                            </div>
                            <p className="text-sm opacity-70 capitalize">{weather.condition}</p>
                        </div>
                    </div>
                    <span className="text-4xl">{care.emoji}</span>
                </div>

                <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-5 h-5 text-pink-400" />
                        <span className="font-semibold">Shaker says:</span>
                    </div>
                    <p className="text-sm">{care.message}</p>
                </div>

                <div className="space-y-2">
                    <p className="text-sm font-medium opacity-70">Today&apos;s Tips:</p>
                    <div className="grid grid-cols-2 gap-2">
                        {care.tips.map((tip, index) => (
                            <div
                                key={index}
                                className="bg-white/10 rounded-lg p-2 text-xs flex items-center gap-2"
                            >
                                <span>✓</span>
                                <span>{tip}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
