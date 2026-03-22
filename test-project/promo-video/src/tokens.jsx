import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

// Shared color tokens
export const colors = {
    white: '#ffffff',
    nearWhite: '#f8f8f8',
    black: '#0a0a0a',
    gray100: '#f5f5f7',
    gray300: '#d1d1d6',
    gray500: '#86868b',
    gray700: '#3a3a3c',
    accent: '#1a1a1a',
    green: '#34c759',
    red: '#ff3b30',
    amber: '#ff9f0a',
    blue: '#0071e3',
    terminalBg: '#1c1c1e',
    terminalText: '#f4f4f4',
};

// Shared typography
export const text = {
    xs: { fontSize: 14, letterSpacing: 0 },
    sm: { fontSize: 18, letterSpacing: -0.2 },
    base: { fontSize: 24, letterSpacing: -0.3 },
    lg: { fontSize: 34, letterSpacing: -0.5 },
    xl: { fontSize: 52, letterSpacing: -1 },
    xxl: { fontSize: 72, letterSpacing: -2 },
    hero: { fontSize: 96, letterSpacing: -3 },
};

// Smooth fade-in helper
export const useFadeIn = (delay = 0, duration = 20) => {
    const frame = useCurrentFrame();
    return interpolate(frame, [delay, delay + duration], [0, 1], {
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.ease),
    });
};

// Slide up + fade helper
export const useSlideUp = (delay = 0, duration = 25, distance = 24) => {
    const frame = useCurrentFrame();
    const progress = interpolate(frame, [delay, delay + duration], [0, 1], {
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
    });
    return {
        opacity: progress,
        transform: `translateY(${(1 - progress) * distance}px)`,
    };
};

// Spring scale helper
export const useSpringScale = (delay = 0, config = {}) => {
    const frame = useCurrentFrame();
    const scale = spring({
        frame: frame - delay,
        fps: 30,
        config: { damping: 18, stiffness: 120, mass: 0.6, ...config },
    });
    return scale;
};
