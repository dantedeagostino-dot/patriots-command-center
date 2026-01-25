"use client";

import { useState, useEffect } from 'react';

export default function Countdown({ targetDate }) {
    const [timeLeft, setTimeLeft] = useState("");
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = new Date(targetDate).getTime() - now;
            if (distance < 0) { setTimeLeft("GAME TIME!"); clearInterval(timer); return; }
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        }, 1000);
        return () => clearInterval(timer);
    }, [targetDate]);
    return <div className="text-4xl font-mono text-yellow-400 font-bold my-4">{timeLeft}</div>;
}
