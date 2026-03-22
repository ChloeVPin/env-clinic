import { AbsoluteFill, useCurrentFrame } from 'remotion';
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

const FIX_LINES = [
    {
        segments: [
            { text: '  🩺 ', color: colors.white },
            { text: 'env-clinic', color: colors.white, bold: true },
            { text: ' --fix', color: colors.white }
        ],
        delay: 45
    },
    { text: '  Fill in missing variables (press Enter to use default or leave blank):', color: '#86868b', delay: 65 },
    { text: '', delay: 75 },
    {
        segments: [
            { text: '  ❌ ', color: '#ff3b30' },
            { text: 'STRIPE_SECRET_KEY', color: colors.white },
            { text: ' [default: sk_your_secret_key] = ', color: '#86868b' }
        ],
        delay: 85
    },
    {
        text: '     sk_live_my_real_key_here',
        color: '#34c759',
        delay: 130
    },
    { text: '', delay: 155 },
    {
        segments: [
            { text: '  ✅ ', color: '#34c759' },
            { text: '1 variable appended to .env', color: '#34c759' }
        ],
        delay: 170
    },
];

export const SceneFix = () => {
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
                    Fill in the blanks.
                </div>
                <div style={{ ...subStyle, fontFamily: FONT_SANS, color: colors.gray500, fontSize: 32, fontWeight: 400, textAlign: 'center', letterSpacing: -0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <InlineCode>--fix</InlineCode> shows example defaults. Press Enter to accept.
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
                    command="npx env-clinic --fix"
                    lines={FIX_LINES}
                    delay={5}
                />
            </div>
        </AbsoluteFill>
    );
};
