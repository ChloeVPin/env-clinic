import { AbsoluteFill } from 'remotion';
import { colors, text, useSlideUp } from '../tokens.jsx';
import { Terminal } from '../components/Terminal.jsx';

const FONT_SANS = '"Inter", -apple-system, BlinkMacSystemFont, sans-serif';
const FONT_MONO = '"JetBrains Mono", "SF Mono", Menlo, monospace';

const InlineCode = ({ children }) => (
    <span style={{
        background: colors.gray100,
        padding: '2px 10px',
        borderRadius: 8,
        fontFamily: FONT_MONO,
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

const PRUNE_LINES = [
    {
        segments: [
            { text: '  🩺 ', color: colors.white },
            { text: 'env-clinic', color: colors.white, bold: true },
            { text: ' --prune', color: colors.white }
        ],
        delay: 45
    },
    { text: '  These variables are in your .env but not in your example file.', color: '#86868b', delay: 65 },
    { text: '  Confirm which ones to remove: [y/N]', color: '#86868b', delay: 80 },
    { text: '', delay: 90 },
    {
        segments: [
            { text: '  ⚠️   ', color: '#ff9f0a' },
            { text: 'OLD_REDIS_URL', color: colors.white },
            { text: ' — remove? [y/N] ', color: '#86868b' },
            { text: 'y', color: colors.white }
        ],
        delay: 100
    },
    { text: '', delay: 120 },
    {
        segments: [
            { text: '  ✅ ', color: '#34c759' },
            { text: 'Removed 1 variable from .env', color: '#34c759' }
        ],
        delay: 135
    },
];

export const ScenePrune = () => {
    const headingStyle = useSlideUp(0, 20);
    const subStyle = useSlideUp(10, 20);

    return (
        <AbsoluteFill style={{ background: colors.white, flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                paddingTop: 220,
                paddingBottom: 120,
                gap: 16,
            }}>
                <div style={{ ...headingStyle, ...text.xl, fontFamily: FONT_SANS, fontWeight: 700, color: colors.black, letterSpacing: -1.5, textAlign: 'center' }}>
                    Clean up the extras.
                </div>
                <div style={{ ...subStyle, fontFamily: FONT_SANS, color: colors.gray500, fontSize: 32, fontWeight: 400, textAlign: 'center', letterSpacing: -0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <InlineCode>--prune</InlineCode> removes stale variables safely.
                </div>
            </div>

            <div style={{
                flex: 1,
                width: '100%',
                paddingLeft: 80,
                paddingRight: 80,
                display: 'flex',
            }}>
                <Terminal
                    variant="hero"
                    title="~/my-api — zsh"
                    command="npx env-clinic --prune"
                    lines={PRUNE_LINES}
                    delay={5}
                />
            </div>
        </AbsoluteFill>
    );
};
