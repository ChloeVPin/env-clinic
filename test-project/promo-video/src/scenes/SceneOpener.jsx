import { AbsoluteFill, useCurrentFrame, interpolate, Easing, Img, staticFile, spring } from 'remotion';
import { colors, text, useFadeIn } from '../tokens.jsx';

export const SceneOpener = () => {
    const frame = useCurrentFrame();
    const fps = 30;

    // 1. Logo Bounces into center
    const logoSpring = spring({
        frame,
        fps,
        config: { damping: 12, stiffness: 150, mass: 0.8 },
    });
    const logoOpacity = useFadeIn(0, 15);

    // 2. The "Apple" Expansion (Frame 45 onwards)
    const expansionStart = 50;
    const expansionSpring = spring({
        frame: frame - expansionStart,
        fps,
        config: { damping: 22, stiffness: 80, mass: 1 },
    });

    const nameWidth = interpolate(expansionSpring, [0, 1], [0, 720]);
    const nameOpacity = interpolate(expansionSpring, [0, 0.4], [0, 1]);

    // Auto-centering shift (applied to the main container during expansion)
    const containerTranslateX = -nameWidth / 2;

    // 3. Tagline - Snappy 3D Flip-up
    const tagStart = expansionStart + 35;
    const tagSpring = spring({
        frame: frame - tagStart,
        fps,
        config: { damping: 15, stiffness: 180, mass: 0.6 },
    });

    const tagInOpacity = interpolate(tagSpring, [0, 0.5], [0, 1]);
    const tagInRotation = interpolate(tagSpring, [0, 1], [-80, 0]);
    const tagInTranslateY = interpolate(tagSpring, [0, 1], [40, 0]);

    // 4. Free-fall Exit Physics (Starting at frame 125 of 150)
    const exitStart = 125;
    const exitProgress = interpolate(frame, [exitStart, exitStart + 25], [0, 1], {
        extrapolateLeft: 'clamp',
    });

    // Logo physics (Down + Left + Spin)
    const logoExitY = interpolate(exitProgress, [0, 1], [0, 800], { easing: Easing.in(Easing.poly(2)) });
    const logoExitX = interpolate(exitProgress, [0, 1], [0, -300], { easing: Easing.in(Easing.quad) });
    const logoExitRotation = interpolate(exitProgress, [0, 1], [0, -45]);

    // Name physics (Down + Right + Tumble)
    const nameExitY = interpolate(exitProgress, [0, 1], [0, 900], { easing: Easing.in(Easing.poly(2.2)) });
    const nameExitX = interpolate(exitProgress, [0, 1], [0, 200], { easing: Easing.in(Easing.quad) });
    const nameExitRotation = interpolate(exitProgress, [0, 1], [0, 15]);

    // Tagline physics (Quick drop)
    const tagExitY = interpolate(exitProgress, [0, 1], [0, 1000], { easing: Easing.in(Easing.poly(2.5)) });
    const tagExitRotation = interpolate(exitProgress, [0, 1], [0, -10]);

    const exitOpacity = interpolate(exitProgress, [0, 0.4], [1, 0]);

    return (
        <AbsoluteFill
            style={{
                background: colors.white,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                perspective: 1000,
            }}
        >
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: exitOpacity,
            }}>
                {/* Branding Unit - Handled by Flex centering */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 300,
                }}>

                    {/* Logo - Individual Fall */}
                    <div
                        style={{
                            opacity: logoOpacity,
                            transform: `scale(${logoSpring}) translateX(${logoExitX}px) translateY(${logoExitY}px) rotate(${logoExitRotation}deg)`,
                            width: 240,
                            height: 240,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10,
                            flexShrink: 0,
                        }}
                    >
                        <Img
                            src={staticFile("logo.png")}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain'
                            }}
                        />
                    </div>

                    {/* Name Reveal - Individual Fall */}
                    <div style={{
                        width: nameWidth,
                        opacity: nameOpacity,
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        height: 240,
                        marginLeft: nameWidth > 0 ? 24 : 0,
                        transform: `translateX(${nameExitX}px) translateY(${nameExitY}px) rotate(${nameExitRotation}deg)`,
                    }}>
                        <div
                            style={{
                                ...text.hero,
                                fontSize: 140,
                                fontWeight: 900,
                                color: colors.black,
                                lineHeight: 1,
                                letterSpacing: -8,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            env-clinic
                        </div>
                    </div>
                </div>

                {/* Tagline - Individual Fall */}
                <div
                    style={{
                        opacity: tagInOpacity,
                        marginTop: 4,
                        transformStyle: 'preserve-3d',
                        transform: `translateY(${tagInTranslateY + tagExitY}px) rotateX(${tagInRotation}deg) rotate(${tagExitRotation}deg)`,
                        transformOrigin: 'top center',
                    }}
                >
                    <div
                        style={{
                            ...text.lg,
                            color: colors.gray500,
                            fontWeight: 300,
                            letterSpacing: -0.5,
                            textAlign: 'center',
                        }}
                    >
                        Zero-config .env auditing
                    </div>
                </div>
            </div>
        </AbsoluteFill>
    );
};
