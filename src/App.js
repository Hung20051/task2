import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const CITIES = [
  { code: 'VN', city: 'Hanoi', country: 'Vietnam',      tz: 'Asia/Ho_Chi_Minh' },
  { code: 'MM', city: 'Yangon', country: 'Myanmar',     tz: 'Asia/Rangoon'     },
  { code: 'KR', city: 'Seoul', country: 'Korea',        tz: 'Asia/Seoul'       },
  { code: 'JP', city: 'Tokyo', country: 'Japan',        tz: 'Asia/Tokyo'       },
  { code: 'SG', city: 'Singapore', country: '',         tz: 'Asia/Singapore'   },
  { code: 'MY', city: 'Kuala Lumpur', country: 'Malaysia', tz: 'Asia/Kuala_Lumpur' },
];

function getTimeIn(tz) {
  return new Date(new Date().toLocaleString('en-US', { timeZone: tz }));
}

function pad(n) { return String(n).padStart(2, '0'); }

function AnalogClock({ date }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2, r = cx - 4;

    ctx.clearRect(0, 0, W, H);

    // Face
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#c5d0f5';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Numbers
    ctx.fillStyle = '#555';
    ctx.font = `bold ${r * 0.18}px Segoe UI`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 1; i <= 12; i++) {
      const angle = (i * 30 - 90) * (Math.PI / 180);
      ctx.fillText(i, cx + Math.cos(angle) * r * 0.75, cy + Math.sin(angle) * r * 0.75);
    }

    // Tick marks
    for (let i = 0; i < 60; i++) {
      const angle = (i * 6 - 90) * (Math.PI / 180);
      const isMajor = i % 5 === 0;
      const inner = r * (isMajor ? 0.85 : 0.9);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
      ctx.lineTo(cx + Math.cos(angle) * r * 0.97, cy + Math.sin(angle) * r * 0.97);
      ctx.strokeStyle = isMajor ? '#999' : '#ccc';
      ctx.lineWidth = isMajor ? 2 : 1;
      ctx.stroke();
    }

    const h = date.getHours() % 12, m = date.getMinutes(), s = date.getSeconds();

    const drawHand = (angle, length, width, color) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + Math.cos((angle - 90) * Math.PI / 180) * length,
        cy + Math.sin((angle - 90) * Math.PI / 180) * length
      );
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.stroke();
    };

    drawHand((h * 30) + (m * 0.5), r * 0.55, 4, '#2d2d4e');
    drawHand((m * 6) + (s * 0.1), r * 0.75, 3, '#2d2d4e');
    drawHand(s * 6, r * 0.8, 1.5, '#e74c3c');

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#2d2d4e';
    ctx.fill();
  }, [date]);

  return <canvas ref={canvasRef} width={110} height={110} className="clock-face" />;
}

function ClockCard({ info, mode }) {
  const [now, setNow] = useState(() => getTimeIn(info.tz));

  useEffect(() => {
    const id = setInterval(() => setNow(getTimeIn(info.tz)), 1000);
    return () => clearInterval(id);
  }, [info.tz]);

  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="card">
      <div className="card-label">{info.code} {info.city}{info.country ? `, ${info.country}` : ''}</div>
      {(mode === 'Digital' || mode === 'Both') && (
        <>
          <div className="digital-time">{timeStr}</div>
          <div className="date-str">{dateStr}</div>
        </>
      )}
      {(mode === 'Analog' || mode === 'Both') && <AnalogClock date={now} />}
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState('Both');
  return (
    <div className="container">
      <h1 className="title">🌍 World Clock</h1>
      <div className="controls">
        <label>Display Mode:</label>
        <select value={mode} onChange={e => setMode(e.target.value)}>
          <option>Both</option>
          <option>Digital</option>
          <option>Analog</option>
        </select>
      </div>
      <div className="grid">
        {CITIES.map(c => <ClockCard key={c.tz} info={c} mode={mode} />)}
      </div>
    </div>
  );
}