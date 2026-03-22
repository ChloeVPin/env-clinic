import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, spring, interpolateColors } from 'remotion';
import { colors, text } from '../tokens.jsx';

const FONT_MONO = '"JetBrains Mono", "SF Mono", Menlo, monospace';

// Stable random hash for character-level glitches
const getSeed = (str, i) => {
    let hash = 0;
    for (let j = 0; j < str.length; j++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(j);
    }
    return Math.abs(hash + i);
};

const mangleText = (char, progress, seed, frame) => {
    if (progress <= 0) return char;
    const chars = "01<>/{}_[];:!@#$%^&*()";
    // Increase mangle probability with progress
    const threshold = 1 - (progress * 1.5);
    // Add frame to the seed for RAPID FLICKER
    const rand = (Math.sin((seed + frame) * 0.5) + 1) / 2;
    return rand > threshold ? chars[Math.floor(rand * chars.length)] : char;
};

const Character = ({ char, index, total, lineDelay, muted, glitchProgress, isItCrashed, stagger = 0 }) => {
    const frame = useCurrentFrame();
    const seed = getSeed(char + index, lineDelay);

    // Entrance reveal
    const charDelay = lineDelay + (index * stagger);
    const spr = spring({
        frame: frame - charDelay,
        fps: 30,
        config: { damping: 12, stiffness: 110, mass: 1 },
    });

    const isVisible = stagger > 0 ? (frame >= charDelay) : spr > 0;
    const opacity = stagger > 0 ? (isVisible ? 1 : 0) : interpolate(spr, [0, 1], [0, 1]);

    const blur = stagger > 0 ? 0 : interpolate(spr, [0, 1], [3, 0]);
    const translateY = stagger > 0 ? 0 : interpolate(spr, [0, 1], [20, 0]);
    const letterSpacing = interpolate(spr, [0, 1], [8, muted ? -1 : -2.5]);

    const baseColor = muted ? colors.gray500 : colors.black;
    const lineRed = isItCrashed ? colors.red : (muted ? '#a33b30' : colors.red);

    const charGlitchSeed = (Math.cos((seed + Math.floor(frame / 3)) * 0.2) + 1) / 2;
    const shouldTurnRed = isItCrashed || (charGlitchSeed < glitchProgress * 0.95);

    const targetColor = shouldTurnRed ? lineRed : baseColor;

    let displayColor = baseColor;
    if (glitchProgress > 0.05) {
        if (isItCrashed) {
            displayColor = targetColor;
        } else {
            try {
                displayColor = interpolateColors(glitchProgress, [0, 0.5], [baseColor, targetColor]);
            } catch (e) {
                displayColor = glitchProgress > 0.25 ? targetColor : baseColor;
            }
        }
    }

    const displayedChar = mangleText(char, glitchProgress, seed, frame);

    return (
        <span
            style={{
                display: 'inline-block',
                opacity,
                filter: opacity > 0 ? `blur(${blur}px)` : 'none',
                transform: `translateY(${translateY}px)`,
                color: displayColor,
                letterSpacing,
                fontFamily: glitchProgress > 0.2 ? FONT_MONO : 'inherit',
                transition: 'color 0.1s ease',
            }}
        >
            {displayedChar === ' ' ? '\u00A0' : displayedChar}
        </span>
    );
};

const InlineCode = ({ children }) => children;

const Line = ({ children, delay, muted = false, bold = false, glitchProgress = 0, isItCrashed = false }) => {
    let charIndex = 0;

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                ...text.xl,
                fontSize: bold ? 72 : 44,
                fontWeight: bold ? 800 : (muted ? 300 : 500),
                lineHeight: 1.15,
                marginBottom: 8,
            }}
        >
            {React.Children.map(children, (child) => {
                const textStr = typeof child === 'string' ? child : child.props?.children || '';
                const isCode = child.type === InlineCode;
                const chars = textStr.split('');
                const startIndex = charIndex;
                const charElements = chars.map((char, i) => (
                    <Character
                        key={startIndex + i}
                        char={char}
                        index={startIndex + i}
                        total={100}
                        lineDelay={delay}
                        muted={muted}
                        glitchProgress={glitchProgress}
                        isItCrashed={isItCrashed}
                        stagger={0}
                    />
                ));
                charIndex += chars.length;

                if (isCode) {
                    return (
                        <span style={{
                            background: colors.gray100,
                            padding: '2px 14px',
                            borderRadius: 14,
                            fontFamily: FONT_MONO,
                            fontSize: '0.85em',
                            color: colors.black,
                            border: '1px solid rgba(0,0,0,0.06)',
                            margin: '0 8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            height: '1.25em',
                            lineHeight: 1,
                            verticalAlign: 'middle',
                            opacity: interpolate(spring({ frame: useCurrentFrame() - delay, fps: 30 }), [0, 1], [0, 1]),
                        }}>
                            {charElements}
                        </span>
                    );
                }
                return charElements;
            })}
        </div>
    );
};

export const SceneProblem = () => {
    const frame = useCurrentFrame();

    const msgStart = 130;
    const msgSpring = spring({
        frame: frame - msgStart,
        fps: 30,
        config: { damping: 15, stiffness: 100 },
    });

    const outroStart = 235;
    const glitchProgress = interpolate(frame, [outroStart, outroStart + 25], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.bezier(0.8, 0, 1, 1),
    });

    let arrowColor = '#f97316';
    if (glitchProgress > 0) {
        const flicker = Math.sin(frame * 1.5) > 0;
        arrowColor = flicker ? colors.red : '#f97316';
    }

    return (
        <AbsoluteFill
            style={{
                background: colors.white,
                alignItems: 'flex-start',
                justifyContent: 'center',
                paddingLeft: 200,
                flexDirection: 'column',
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Line delay={20} muted glitchProgress={glitchProgress}>You cloned the repo.</Line>
                <Line delay={45} muted glitchProgress={glitchProgress}>You ran <InlineCode>npm install</InlineCode>.</Line>
                <Line delay={70} muted glitchProgress={glitchProgress}>You ran <InlineCode>npm start</InlineCode>.</Line>
            </div>

            <div style={{ height: 40 }} />
            <div style={{ position: 'relative' }}>
                <Line delay={105} bold isItCrashed glitchProgress={glitchProgress}>It crashed.</Line>

                <div style={{
                    marginTop: -16,
                    paddingLeft: 4,
                    opacity: interpolate(msgSpring, [0, 1], [0, 1]) * (1 - glitchProgress),
                    transform: `translateY(${interpolate(msgSpring, [0, 1], [15, 0])}px)`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                }}>
                    <svg
                        width="32"
                        height="48"
                        viewBox="0 0 32 48"
                        fill="none"
                        style={{
                            overflow: 'visible',
                            marginBottom: 8,
                            transform: 'translateY(4px)',
                        }}
                    >
                        <path
                            d="M 4 0 L 4 16 Q 4 24 12 24 L 32 24"
                            stroke={arrowColor}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeDasharray={100}
                            strokeDashoffset={interpolate(msgSpring, [0, 1], [100, 0])}
                        />
                    </svg>

                    <div style={{
                        ...text.base,
                        color: colors.gray500,
                        fontWeight: 300,
                        fontSize: 32,
                        letterSpacing: -0.5,
                        fontFamily: glitchProgress > 0.3 ? FONT_MONO : 'inherit',
                    }}>
                        {String("A missing environment variable. Again.").split('').map((char, i) => (
                            <Character
                                key={i}
                                char={char}
                                index={i}
                                total={40}
                                lineDelay={msgStart + 24}
                                muted
                                glitchProgress={glitchProgress}
                                isItCrashed={false}
                                stagger={0.8}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </AbsoluteFill>
    );
};
