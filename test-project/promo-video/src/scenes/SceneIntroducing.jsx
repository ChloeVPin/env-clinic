import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import { colors } from '../tokens.jsx';

const FONT = '"Inter", -apple-system, BlinkMacSystemFont, sans-serif';

// "env-clinic": define exactly which frame each char appears at
// "env" starts at frame 40, 4-frame stagger → 40, 44, 48
// wait 30 frames (1 second) after "v" appears
// "-clinic" starts at frame 82, 4-frame stagger → 82,86,90,94,98,102,106
const TEXT = "env-clinic";
const CHAR_FRAMES = [40, 44, 48, 82, 86, 90, 94, 98, 102, 106];
const TYPING_DONE_FRAME = 106 + 4; // last char fully settled

// -----------------------------------------------------------
// FlipIn: flips element up from below (rotateX perspective)
// -----------------------------------------------------------
const FlipIn = ({ children, delay, style = {} }) => {
    const frame = useCurrentFrame();
    const spr = spring({ frame: frame - delay, fps: 30, config: { damping: 16, stiffness: 90, mass: 1 } });
    return (
        <div style={{ perspective: 800, overflow: 'hidden', ...style }}>
            <div style={{
                transform: `rotateX(${interpolate(spr, [0, 1], [90, 0])}deg)`,
                transformOrigin: 'bottom center',
                opacity: interpolate(spr, [0, 0.15], [0, 1]),
            }}>
                {children}
            </div>
        </div>
    );
};

// -----------------------------------------------------------
// FlipUp: smooth translate-Y + fade entrance
// -----------------------------------------------------------
const FlipUp = ({ children, delay, style = {} }) => {
    const frame = useCurrentFrame();
    const spr = spring({ frame: frame - delay, fps: 30, config: { damping: 14, stiffness: 80, mass: 1 } });
    return (
        <div style={{
            opacity: interpolate(spr, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(spr, [0, 1], [32, 0])}px)`,
            ...style,
        }}>
            {children}
        </div>
    );
};

// -----------------------------------------------------------
// TypedText: renders only typed chars, with cursor tracking
// the CURRENT position (between typed & next char)
// -----------------------------------------------------------
const TypedText = () => {
    const frame = useCurrentFrame();

    // How many characters have appeared so far
    const charsTyped = CHAR_FRAMES.reduce((n, f) => n + (frame >= f ? 1 : 0), 0);
    const isComplete = charsTyped >= TEXT.length;

    // Blink at 8-frame interval (~3.75 Hz) — stop blinking 20 frames after done
    const blinkActive = frame < TYPING_DONE_FRAME + 20;
    const blink = Math.floor(frame / 8) % 2 === 0;
    const showCursor = blinkActive && (blink || !isComplete);

    return (
        <>
            {TEXT.slice(0, charsTyped)}
            {showCursor && <span style={{ opacity: 0.85, fontWeight: 300 }}>|</span>}
        </>
    );
};

export const SceneIntroducing = () => {
    const LABEL_FLIP = 5;
    const TAGLINE_FLIP = TYPING_DONE_FRAME + 18; // flips up after typing finishes

    return (
        <AbsoluteFill
            style={{
                background: colors.white,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 12,
            }}
        >
            {/* "INTRODUCING" — flips in from below */}
            <FlipIn delay={LABEL_FLIP} style={{ textAlign: 'center' }}>
                <div style={{
                    fontSize: 18,
                    fontWeight: 500,
                    letterSpacing: 7,
                    textTransform: 'uppercase',
                    color: colors.gray500,
                    fontFamily: FONT,
                    marginBottom: 12,
                }}>
                    Introducing
                </div>
            </FlipIn>

            {/* "env-clinic" — types out with cursor tracking position */}
            <div style={{
                fontSize: 112,
                fontWeight: 800,
                letterSpacing: -4.5,
                color: colors.black,
                fontFamily: FONT,
                lineHeight: 1,
                minHeight: '1.15em',  // prevent layout shift during typing
            }}>
                <TypedText />
            </div>

            {/* Tagline — flips up after typing is done */}
            <FlipUp delay={TAGLINE_FLIP} style={{ textAlign: 'center' }}>
                <div style={{
                    fontSize: 28,
                    fontWeight: 300,
                    letterSpacing: -0.5,
                    color: colors.gray500,
                    fontFamily: FONT,
                }}>
                    One command to fix your environment.
                </div>
            </FlipUp>
        </AbsoluteFill>
    );
};
