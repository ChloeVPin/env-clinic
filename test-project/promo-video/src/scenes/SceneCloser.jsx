import { AbsoluteFill, useCurrentFrame, interpolate, Easing, Img, staticFile, spring } from 'remotion';
import { colors, text, useFadeIn } from '../tokens.jsx';

const FONT_SANS = '"Inter", -apple-system, BlinkMacSystemFont, sans-serif';
const FONT_MONO = '"JetBrains Mono", "SF Mono", Menlo, monospace';

const NpmIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: 20, height: 20, fill: '#CB3837', flexShrink: 0 }}>
        <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z" />
    </svg>
);

const GitHubIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: 20, height: 20, fill: colors.black, flexShrink: 0 }}>
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
);

// Bootstrap bi-copy icon
const CopyIcon = ({ copied }) => copied ? (
    // Green checkmark after copy
    <svg viewBox="0 0 16 16" fill="none" stroke={colors.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ width: 18, height: 18, flexShrink: 0 }}>
        <polyline points="2,8 6,12 14,4" />
    </svg>
) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill={colors.gray500} viewBox="0 0 16 16"
        style={{ flexShrink: 0 }}>
        <path fillRule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z" />
    </svg>
);

// Reusable reveal — fades + floats up from below
const Reveal = ({ children, delay, distance = 20 }) => {
    const frame = useCurrentFrame();
    const spr = spring({ frame: frame - delay, fps: 30, config: { damping: 18, stiffness: 100 } });
    return (
        <div style={{
            opacity: interpolate(spr, [0, 1], [0, 1]),
            filter: `blur(${interpolate(spr, [0, 1], [3, 0])}px)`,
            transform: `translateY(${interpolate(spr, [0, 1], [distance, 0])}px)`,
        }}>
            {children}
        </div>
    );
};

export const SceneCloser = () => {
    const frame = useCurrentFrame();
    const fps = 30;

    // ── Identical to SceneOpener ────────────────────────────────────────────
    const logoSpring = spring({ frame, fps, config: { damping: 12, stiffness: 150, mass: 0.8 } });
    const logoOpacity = useFadeIn(0, 15);

    const expansionStart = 50;
    const expansionSpring = spring({
        frame: frame - expansionStart,
        fps,
        config: { damping: 22, stiffness: 80, mass: 1 },
    });
    const nameWidth = interpolate(expansionSpring, [0, 1], [0, 720]);
    const nameOpacity = interpolate(expansionSpring, [0, 0.4], [0, 1]);

    const tagStart = expansionStart + 35;
    const tagSpring = spring({ frame: frame - tagStart, fps, config: { damping: 15, stiffness: 180, mass: 0.6 } });
    const tagInOpacity = interpolate(tagSpring, [0, 0.5], [0, 1]);
    const tagInRotation = interpolate(tagSpring, [0, 1], [-80, 0]);
    const tagInTranslateY = interpolate(tagSpring, [0, 1], [40, 0]);
    // ────────────────────────────────────────────────────────────────────────

    // Outro elements
    const extrasStart = tagStart + 40;   // ~125
    const dividerDelay = extrasStart;
    const installDelay = extrasStart + 20; // ~145
    const linksDelay = extrasStart + 35; // ~160

    const dividerOpacity = interpolate(frame, [dividerDelay, dividerDelay + 20], [0, 1], { extrapolateRight: 'clamp' });
    const dividerScale = interpolate(frame, [dividerDelay, dividerDelay + 25], [0, 1], { extrapolateRight: 'clamp' });

    // ── Mouse cursor & copy interaction ────────────────────────────────────
    // The copy button is at the far right of the chip.
    // Chip is ~600px wide centered at X=960. Right edge ≈ 1260. Icon at ≈ 1242, Y ≈ 718.
    const clickFrame = 185;

    // X trajectory: bottom-center → copy button X → back to edge
    const pX = () => {
        const startX = 960;
        const targetX = 1212; // Bullseye! 🎯
        if (frame < clickFrame - 60) return startX;
        if (frame < clickFrame + 15) {
            return interpolate(
                spring({ frame: frame - (clickFrame - 60), fps, config: { damping: 18, stiffness: 55 } }),
                [0, 1], [startX, targetX]
            );
        }
        // Hold ~10 frames, then return to bottom-center
        return interpolate(
            spring({ frame: frame - (clickFrame + 15), fps, config: { damping: 18, stiffness: 40 } }),
            [0, 1], [targetX, startX]
        );
    };

    // Y trajectory: bottom off-screen → chip row → back to bottom
    const pY = () => {
        const startY = 1200;
        const targetY = 705;
        if (frame < clickFrame - 60) return startY;
        if (frame < clickFrame + 15) {
            return interpolate(
                spring({ frame: frame - (clickFrame - 60), fps, config: { damping: 18, stiffness: 55 } }),
                [0, 1], [startY, targetY]
            );
        }
        // Exit down
        return interpolate(
            spring({ frame: frame - (clickFrame + 15), fps, config: { damping: 18, stiffness: 40 } }),
            [0, 1], [targetY, startY]
        );
    };

    // Click: scale down on click, spring back
    const pScale = () => {
        const base = 1.2;
        const s = interpolate(frame, [clickFrame - 2, clickFrame, clickFrame + 10], [1, 0.78, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
        });
        return base * s;
    };

    // Copied state: true after clickFrame
    const isCopied = frame >= clickFrame;
    // ────────────────────────────────────────────────────────────────────────

    return (
        <AbsoluteFill
            style={{
                background: colors.white,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                perspective: 1000,
                fontFamily: FONT_SANS,
            }}
        >
            {/* ── Branding Unit ── */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>

                    <div style={{
                        opacity: logoOpacity,
                        transform: `scale(${logoSpring})`,
                        width: 240, height: 240,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, zIndex: 10,
                    }}>
                        <Img src={staticFile('logo.png')} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>

                    <div style={{
                        width: nameWidth, opacity: nameOpacity, overflow: 'hidden',
                        display: 'flex', alignItems: 'center', height: 240,
                        marginLeft: nameWidth > 0 ? 24 : 0,
                    }}>
                        <div style={{ ...text.hero, fontSize: 140, fontWeight: 900, color: colors.black, lineHeight: 1, letterSpacing: -8, whiteSpace: 'nowrap' }}>
                            env-clinic
                        </div>
                    </div>
                </div>

                <div style={{
                    opacity: tagInOpacity, marginTop: 4,
                    transformStyle: 'preserve-3d',
                    transform: `translateY(${tagInTranslateY}px) rotateX(${tagInRotation}deg)`,
                    transformOrigin: 'top center',
                }}>
                    <div style={{ ...text.lg, color: colors.gray500, fontWeight: 300, letterSpacing: -0.5, textAlign: 'center' }}>
                        Zero-config .env auditing for every project
                    </div>
                </div>
            </div>

            {/* ── Outro section ── */}

            {/* Divider */}
            <div style={{
                opacity: dividerOpacity,
                margin: '44px 0',
                width: 60, height: 2,
                background: colors.gray300,
                borderRadius: 2,
                transform: `scaleX(${dividerScale})`,
            }} />

            {/* Install chip + links */}
            <Reveal delay={installDelay} distance={16}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 44 }}>

                    {/* Install chip */}
                    <div style={{
                        background: colors.gray100,
                        padding: '14px 32px',
                        borderRadius: 12,
                        fontFamily: FONT_MONO,
                        fontSize: 20,
                        fontWeight: 500,
                        color: colors.black,
                        letterSpacing: 0.2,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        {/* Spacer to balance icon and keep text centered */}
                        <div style={{ width: 18 }} />
                        <span>npx env-clinic</span>
                        {/* Copy icon → green check after click */}
                        <CopyIcon copied={isCopied} />
                    </div>

                    {/* Branded links */}
                    <div style={{ display: 'flex', gap: 64, alignItems: 'center', justifyContent: 'space-between' }}>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <NpmIcon />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <div style={{ fontSize: 11, color: colors.gray500, letterSpacing: 1.5, fontWeight: 600, textTransform: 'uppercase' }}>npm</div>
                                <div style={{ fontSize: 15, color: colors.blue, fontWeight: 400, letterSpacing: -0.2 }}>npmjs.com/package/env-clinic</div>
                            </div>
                        </div>

                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: colors.gray300 }} />

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <GitHubIcon />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <div style={{ fontSize: 11, color: colors.gray500, letterSpacing: 1.5, fontWeight: 600, textTransform: 'uppercase' }}>GitHub</div>
                                <div style={{ fontSize: 15, color: colors.blue, fontWeight: 400, letterSpacing: -0.2 }}>github.com/ChloeVPin/env-clinic</div>
                            </div>
                        </div>

                    </div>
                </div>
            </Reveal>

            {/* ── Black mouse cursor ── */}
            <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 999 }}>
                <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    transform: `translate3d(${pX()}px, ${pY()}px, 0) scale(${pScale()})`,
                    transformOrigin: 'top left',
                    width: 44,
                    // No invert — keep it black/default
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                    WebkitBackfaceVisibility: 'hidden',
                }}>
                    <img src={staticFile('mouse.png')} style={{ width: '100%' }} alt="cursor" />
                </div>
            </AbsoluteFill>

        </AbsoluteFill>
    );
};
