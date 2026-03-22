import { useCurrentFrame, interpolate, spring } from 'remotion';
import { colors } from '../tokens.jsx';

const FONT_MONO = '"JetBrains Mono", "SF Mono", Menlo, monospace';
const FONT_SANS = '"Inter", -apple-system, BlinkMacSystemFont, sans-serif';

/**
 * Animated terminal window. Takes `children` to render command sequences.
 */
export const Terminal = ({
    title = 'zsh',
    variant = 'default', // 'default' or 'hero'
    delay = 0,
    clearFrames = [], // Array of frames where the "Clear" button is clicked
    children
}) => {
    const frame = useCurrentFrame();
    const fps = 30;

    const windowSpr = spring({
        frame: frame - delay,
        fps,
        config: { damping: 26, stiffness: 90 },
    });

    const isHero = variant === 'hero';

    // The button highlights slightly before the clear frame to simulate the click press
    const isClearingBtn = clearFrames.some(f => frame >= f - 2 && frame < f + 8);

    const terminalStyle = isHero
        ? {
            flex: 1,
            transform: `translateY(${interpolate(windowSpr, [0, 1], [350, 0])}px)`,
            opacity: interpolate(windowSpr, [0, 0.2], [0, 1]),
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            overflow: 'hidden',
            borderRadius: '24px 24px 0 0',
            marginBottom: -200,
            paddingBottom: 200,
            boxShadow: '0 -20px 100px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)',
            fontFamily: FONT_MONO,
        }
        : {
            opacity: windowSpr,
            transform: `scale(${interpolate(windowSpr, [0, 1], [0.95, 1])}) translateY(${interpolate(windowSpr, [0, 1], [30, 0])}px)`,
            width: 900,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 40px 100px rgba(0,0,0,0.25), 0 10px 30px rgba(0,0,0,0.1)',
            fontFamily: FONT_MONO,
            border: '1px solid rgba(255,255,255,0.1)',
        };

    return (
        <div style={terminalStyle}>
            {/* Title bar */}
            <div style={{
                background: '#2c2c2e',
                height: isHero ? 56 : 52,
                display: 'flex',
                alignItems: 'center',
                paddingLeft: isHero ? 24 : 20,
                gap: 10,
                position: 'relative',
                flexShrink: 0,
                borderBottom: '1px solid rgba(0,0,0,0.25)',
            }}>
                {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
                    <div key={i} style={{
                        width: isHero ? 14 : 13,
                        height: isHero ? 14 : 13,
                        borderRadius: '50%',
                        background: c,
                        border: '1px solid rgba(0,0,0,0.12)',
                    }} />
                ))}
                <div style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: isHero ? 15 : 14,
                    fontWeight: 500,
                    color: '#a1a1a6',
                    fontFamily: FONT_SANS,
                    letterSpacing: 0.1,
                }}>
                    {title}
                </div>
                {/* Clear Button */}
                {clearFrames.length > 0 && (
                    <div style={{
                        position: 'absolute',
                        right: isHero ? 24 : 20,
                        fontSize: isHero ? 14 : 12,
                        fontFamily: FONT_SANS,
                        fontWeight: 500,
                        color: isClearingBtn ? colors.black : '#86868b',
                        background: isClearingBtn ? '#ffffff' : 'transparent',
                        padding: '4px 10px',
                        borderRadius: 6,
                        transition: 'all 0.1s',
                        letterSpacing: 0.2,
                    }}>
                        Clear
                    </div>
                )}
            </div>

            {/* Terminal body */}
            <div style={{
                background: colors.terminalBg,
                flex: isHero ? 1 : 'none',
                padding: isHero ? '40px 56px' : '30px 32px 40px',
                minHeight: isHero ? 'auto' : 240,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                position: 'relative',
            }}>
                {children}
            </div>
        </div>
    );
};

export const CommandBlock = ({ command, lines = [], delay = 0, isHero = true }) => {
    const frame = useCurrentFrame();
    const fps = 30;

    const getVisibleText = (lineText, startFrame, charsPerSecond = 35) => {
        const charsPerFrame = charsPerSecond / fps;
        const elapsed = frame - (delay + startFrame);
        if (elapsed < 0) return '';
        const visible = Math.floor(elapsed * charsPerFrame);
        return lineText.slice(0, visible);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, position: 'absolute', top: isHero ? 40 : 30, left: isHero ? 56 : 32 }}>
            {/* Command line */}
            {command && (
                <div style={{ display: 'flex', alignItems: 'center', gap: isHero ? 14 : 12, marginBottom: isHero ? 16 : 12 }}>
                    <span style={{ color: colors.green, fontSize: isHero ? 22 : 18, fontWeight: 700 }}>❯</span>
                    <span style={{ color: colors.terminalText, fontSize: isHero ? 22 : 18, fontFamily: FONT_MONO }}>
                        {getVisibleText(command, 10)}
                        {getVisibleText(command, 10).length < command.length ? (
                            <span style={{
                                display: 'inline-block',
                                width: isHero ? 12 : 10,
                                height: isHero ? 22 : 20,
                                background: colors.terminalText,
                                marginLeft: 2,
                                verticalAlign: 'middle',
                                opacity: Math.floor(frame / 6) % 2 === 0 ? 1 : 0,
                            }} />
                        ) : null}
                    </span>
                </div>
            )}

            {/* Output lines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: isHero ? 4 : 6 }}>
                {lines.map((line, i) => {
                    const lineDelay = line.delay ?? 40;
                    const lineSpr = spring({
                        frame: frame - (delay + lineDelay),
                        fps,
                        config: { damping: 18, stiffness: 120 },
                    });

                    if (frame < (delay + lineDelay)) return null;

                    return (
                        <div key={i} style={{
                            fontSize: isHero ? 22 : 17,
                            lineHeight: 1.6,
                            color: line.color ?? colors.terminalText,
                            whiteSpace: 'pre',
                            fontWeight: line.bold ? 700 : 400,
                            fontFamily: FONT_MONO,
                            opacity: lineSpr,
                            filter: `blur(${interpolate(lineSpr, [0, 1], [1.5, 0])}px)`,
                            transform: `translateY(${interpolate(lineSpr, [0, 1], [10, 0])}px)`,
                        }}>
                            {line.segments ? line.segments.map((s, j) => (
                                <span key={j} style={{ color: s.color, fontWeight: s.bold ? 700 : 'inherit' }}>
                                    {s.text}
                                </span>
                            )) : line.text}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
