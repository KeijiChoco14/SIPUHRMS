import React, { useRef, useState, useEffect } from 'react';

interface SignaturePadProps {
    value?: string | null;
    onChange: (signatureDataUrl: string | null) => void;
    title?: string;
    height?: number;
}

export default function SignaturePad({
    value,
    onChange,
    title = 'Tanda Tangan Digital',
    height = 130,
}: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(Boolean(value));

    // Initialize or load existing value
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Ensure canvas pixel ratio sharpness
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = height * 2;
        ctx.scale(2, 2);

        ctx.strokeStyle = '#1e1b4b'; // Deep indigo / professional ink color
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (value) {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, rect.width, height);
                setHasDrawn(true);
            };
            img.src = value;
        } else {
            ctx.clearRect(0, 0, rect.width, height);
            setHasDrawn(false);
        }
    }, [value, height]);

    const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();

        if ('touches' in e) {
            const touch = e.touches[0];
            return {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top,
            };
        }
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { x, y } = getPos(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { x, y } = getPos(e);
        ctx.lineTo(x, y);
        ctx.stroke();
        setHasDrawn(true);
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');
            onChange(dataUrl);
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, height);
        setHasDrawn(false);
        onChange(null);
    };

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    {title}
                </span>
                {hasDrawn && (
                    <button
                        type="button"
                        onClick={clearCanvas}
                        className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer transition-colors"
                    >
                        Hapus / Ulangi
                    </button>
                )}
            </div>

            <div className="relative rounded-xl border border-gray-300 bg-white overflow-hidden shadow-inner group">
                <canvas
                    ref={canvasRef}
                    style={{ height: `${height}px`, width: '100%' }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="touch-none cursor-crosshair bg-slate-50/50 block"
                />

                {!hasDrawn && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-gray-400 select-none">
                        <svg className="w-5 h-5 mb-1 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        <span className="text-[11px] font-medium tracking-wide">
                            Goreskan tanda tangan di sini (layar sentuh / mouse)
                        </span>
                    </div>
                )}

                <div className="absolute bottom-1.5 right-2 pointer-events-none">
                    <span className="text-[9px] font-mono text-gray-300">SWISS-BELINN E-SIGN</span>
                </div>
            </div>
        </div>
    );
}
