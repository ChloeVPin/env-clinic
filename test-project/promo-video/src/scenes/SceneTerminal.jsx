import { AbsoluteFill, useCurrentFrame, interpolate, spring, staticFile, Sequence } from 'remotion';
import { colors, text, useSlideUp } from '../tokens.jsx';
import { Terminal, CommandBlock } from '../components/Terminal.jsx';

const FONT_SANS = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif';

const OUT_CLINIC = [
    { segments: [{ text: '  🩺 ', color: colors.white }, { text: 'env-clinic', color: colors.white, bold: true }], delay: 45 },
    { text: '  ─────────────────────────────────', color: '#3a3a3c', delay: 50 },
    { text: '', delay: 55 },
    { segments: [{ text: '  ✅ ', color: '#34c759' }, { text: 'PORT', color: colors.white }, { text: '  — present', color: '#86868b' }], delay: 70 },
    { segments: [{ text: '  ✅ ', color: '#34c759' }, { text: 'DATABASE_URL', color: colors.white }, { text: '  — present', color: '#86868b' }], delay: 85 },
    { segments: [{ text: '  ❌ ', color: '#ff3b30' }, { text: 'STRIPE_SECRET_KEY', color: colors.white }, { text: '  — MISSING ', color: '#ff3b30' }, { text: '(in example but not in .env)', color: '#86868b' }], delay: 110 },
    { segments: [{ text: '  ⚠️   ', color: '#ff9f0a' }, { text: 'DEBUG_MODE', color: colors.white }, { text: '  — EMPTY ', color: '#ff9f0a' }, { text: '(present but has no value)', color: '#86868b' }], delay: 135 },
    { text: '', delay: 150 },
    { text: '  ─────────────────────────────────', color: '#3a3a3c', delay: 160 },
    { text: '  Summary:', color: colors.white, bold: true, delay: 170 },
    { segments: [{ text: '  ✅ ', color: '#34c759' }, { text: '2 variables present', color: colors.white }], delay: 185 },
    { segments: [{ text: '  ❌ ', color: '#ff3b30' }, { text: '1 variable missing', color: colors.white }], delay: 200 },
    { segments: [{ text: '  ⚠️   ', color: '#ff9f0a' }, { text: '1 empty (present but has no value)', color: colors.white }], delay: 215 },
];

const OUT_FIX = [
    { segments: [{ text: '  🩺 ', color: colors.white }, { text: 'env-clinic', color: colors.white, bold: true }, { text: ' --fix', color: colors.white }], delay: 45 },
    { text: '  Fill in missing variables (press Enter to use default or leave blank):', color: '#86868b', delay: 65 },
    { text: '', delay: 75 },
    { segments: [{ text: '  ❌ ', color: '#ff3b30' }, { text: 'STRIPE_SECRET_KEY', color: colors.white }, { text: ' [default: sk_your_secret_key] = ', color: '#86868b' }], delay: 85 },
    { text: '     sk_live_my_real_key_here', color: '#34c759', delay: 130 },
    { text: '', delay: 155 },
    { segments: [{ text: '  ✅ ', color: '#34c759' }, { text: '1 variable appended to .env', color: '#34c759' }], delay: 170 },
];

const OUT_PRUNE = [
    { segments: [{ text: '  🩺 ', color: colors.white }, { text: 'env-clinic', color: colors.white, bold: true }, { text: ' --prune', color: colors.white }], delay: 45 },
    { text: '  These variables are in your .env but not in your example file.', color: '#86868b', delay: 65 },
    { text: '  Confirm which ones to remove: [y/N]', color: '#86868b', delay: 80 },
    { text: '', delay: 90 },
    { segments: [{ text: '  ⚠️   ', color: '#ff9f0a' }, { text: 'OLD_REDIS_URL', color: colors.white }, { text: ' — remove? [y/N] ', color: '#86868b' }, { text: 'y', color: colors.white }], delay: 100 },
    { text: '', delay: 120 },
    { segments: [{ text: '  ✅ ', color: '#34c759' }, { text: 'Removed 1 variable from .env', color: '#34c759' }], delay: 135 },
];

const InlineCode = ({ children }) => (
    <span style={{
        background: colors.gray100,
        padding: '2px 10px',
        borderRadius: 8,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '0.92em',
        color: colors.black,
        border: '1px solid rgba(0,0,0,0.06)',
        margin: '0 2px',
        display: 'inline-flex',
        alignItems: 'center',
        height: '1.2em',
        lineHeight: 1,
    }}>
        {children}
    </span>
);

export const SceneTerminal = () => {
    const frame = useCurrentFrame();
    const fps = 30;

    const headingStyle = useSlideUp(0, 20);
    const subStyle = useSlideUp(12, 20);

    // Timings
    const c1Clear = 320;   // Wait 20f, then click clear

    // Sub-sequence 2 starts at 322 (2f gap)
    const c2Start = 322;
    const c2End = c2Start + 220; // 542
    const c2Clear = c2End + 20;  // 562

    // Sub-sequence 3 starts at 564 (2f gap)
    const c3Start = 564;

    const clearFrames = [c1Clear, c2Clear];

    // Coordinates (Relative to 1920x1080)
    // "Clear" button is on the far right of the hero terminal title bar
    // isHero variant title bar: right: 24px padding inside terminal
    // Terminal variant="hero" width: 100% (1920) - 80px side padding = 1760px wide
    // Button X: ~1810
    // Title bar height is ~56. Top margin of terminal is around 400.
    // Button Y: ~460 (perfectly centered in title bar)
    const targetX = 1765;
    const targetY = 460;
    const startX = 960; // Center
    const startY = 1200; // Bottom off-screen

    const calculatePointerX = () => {
        // Move to first click (frames 240 to 320)
        if (frame < c1Clear - 80) return startX;
        if (frame < c1Clear + 10) {
            return interpolate(spring({
                frame: frame - (c1Clear - 80),
                fps,
                config: { damping: 20, stiffness: 60 }
            }), [0, 1], [startX, targetX]);
        }

        // Wait at button briefly, then slide down a bit inside terminal window
        if (frame < c2Clear - 80) {
            return interpolate(spring({
                frame: frame - (c1Clear + 10),
                fps,
                config: { damping: 20, stiffness: 40 }
            }), [0, 1], [targetX, targetX - 100]);
        }

        // Return to button for second click
        if (frame < c2Clear + 10) {
            return interpolate(spring({
                frame: frame - (c2Clear - 80),
                fps,
                config: { damping: 20, stiffness: 60 }
            }), [0, 1], [targetX - 100, targetX]);
        }

        // Final exit down
        return interpolate(spring({
            frame: frame - (c2Clear + 10),
            fps,
            config: { damping: 20, stiffness: 40 }
        }), [0, 1], [targetX, targetX + 100]);
    };

    const calculatePointerY = () => {
        if (frame < c1Clear - 80) return startY;
        if (frame < c1Clear + 10) {
            return interpolate(spring({
                frame: frame - (c1Clear - 80),
                fps,
                config: { damping: 20, stiffness: 60 }
            }), [0, 1], [startY, targetY]);
        }

        if (frame < c2Clear - 80) {
            return interpolate(spring({
                frame: frame - (c1Clear + 10),
                fps,
                config: { damping: 20, stiffness: 40 }
            }), [0, 1], [targetY, targetY + 200]); // Move into terminal area
        }

        if (frame < c2Clear + 10) {
            return interpolate(spring({
                frame: frame - (c2Clear - 80),
                fps,
                config: { damping: 20, stiffness: 60 }
            }), [0, 1], [targetY + 200, targetY]);
        }

        return interpolate(spring({
            frame: frame - (c2Clear + 10),
            fps,
            config: { damping: 20, stiffness: 40 }
        }), [0, 1], [targetY, startY]);
    };

    const calculateScale = () => {
        const baseScale = 1.3;
        const clickShrink = 0.8;

        const s1 = interpolate(frame, [c1Clear - 2, c1Clear, c1Clear + 10], [1, clickShrink, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const s2 = interpolate(frame, [c2Clear - 2, c2Clear, c2Clear + 10], [1, clickShrink, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

        const currentScale = frame >= c2Clear - 2 ? s2 : s1;
        return baseScale * currentScale;
    };

    return (
        <AbsoluteFill style={{ background: colors.white, flexDirection: 'column', alignItems: 'center', overflow: 'hidden' }}>

            {/* Top section */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                paddingTop: 220,
                paddingBottom: 120,
                gap: 16,
                zIndex: 10,
            }}>
                <div style={{ ...headingStyle, ...text.xl, fontFamily: FONT_SANS, fontWeight: 700, color: colors.black, letterSpacing: -1.5, textAlign: 'center' }}>
                    {frame < c2Start ? 'Run it anywhere.' : frame < c3Start ? 'Fill in the blanks.' : 'Clean up the extras.'}
                </div>
                <div style={{ ...subStyle, fontFamily: FONT_SANS, color: colors.gray500, fontSize: 32, fontWeight: 400, textAlign: 'center', letterSpacing: -0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {frame < c2Start
                        ? 'No config. No install required.'
                        : frame < c3Start
                            ? <><InlineCode>--fix</InlineCode> shows example defaults. Press Enter to accept.</>
                            : <><InlineCode>--prune</InlineCode> removes stale variables safely.</>}
                </div>
            </div>

            {/* Terminal */}
            <div style={{ flex: 1, width: '100%', paddingLeft: 80, paddingRight: 80, display: 'flex', position: 'relative', zIndex: 1 }}>
                <Terminal variant="hero" title="~/my-api — zsh" delay={5} clearFrames={clearFrames}>
                    <Sequence from={0} durationInFrames={c1Clear}>
                        <CommandBlock command="npx env-clinic" lines={OUT_CLINIC} />
                    </Sequence>
                    <Sequence from={c2Start} durationInFrames={c2Clear - c2Start}>
                        <CommandBlock command="npx env-clinic --fix" lines={OUT_FIX} />
                    </Sequence>
                    <Sequence from={c3Start}>
                        <CommandBlock command="npx env-clinic --prune" lines={OUT_PRUNE} />
                    </Sequence>
                </Terminal>
            </div>

            {/* Mouse Cursor */}
            <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 999 }}>
                <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    transform: `translate3d(${calculatePointerX()}px, ${calculatePointerY()}px, 0) scale(${calculateScale()})`,
                    transformOrigin: 'top left',
                    width: 44,
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))',
                    WebkitBackfaceVisibility: 'hidden',
                }}>
                    <img
                        src={staticFile('mouse.png')}
                        style={{
                            width: '100%',
                            filter: 'invert(1) brightness(2)'
                        }}
                        alt="cursor"
                    />
                </div>
            </AbsoluteFill>

        </AbsoluteFill>
    );
};
