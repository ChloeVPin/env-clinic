import { AbsoluteFill, Sequence } from 'remotion';
import { SceneOpener } from './scenes/SceneOpener.jsx';
import { SceneProblem } from './scenes/SceneProblem.jsx';
import { SceneIntroducing } from './scenes/SceneIntroducing.jsx';
import { SceneTerminal } from './scenes/SceneTerminal.jsx';
import { SceneCloser } from './scenes/SceneCloser.jsx';
import { SceneWrapper } from './components/SceneWrapper.jsx';

// Updated Scene timing (frames at 30fps) - 58.6s Total
// Scene 1: 0–150    (0–5.0s)    — Brand opener
// Scene 2: 150–420  (5.0–14.0s) — Problem statement
// Scene 3: 420–660  (14.0–22.0s)— Introducing env-clinic (8s)
// Scene 4: 660–1550 (22.0–51.6s)— Terminal Multi-Command: clinic -> fix -> prune (29.6s)
// Scene 5: 1550–1760(51.6–58.6s)— Closer with links (7s)

export const EnvClinicPromo = () => {
    return (
        <AbsoluteFill style={{ background: '#ffffff', fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif' }}>

            <Sequence from={0} durationInFrames={150}>
                <SceneWrapper duration={150}>
                    <SceneOpener />
                </SceneWrapper>
            </Sequence>

            <Sequence from={150} durationInFrames={270}>
                <SceneWrapper duration={270} fadeDuration={35}>
                    <SceneProblem />
                </SceneWrapper>
            </Sequence>

            <Sequence from={420} durationInFrames={240}>
                <SceneWrapper duration={240}>
                    <SceneIntroducing />
                </SceneWrapper>
            </Sequence>

            <Sequence from={660} durationInFrames={890}>
                <SceneWrapper duration={890}>
                    <SceneTerminal />
                </SceneWrapper>
            </Sequence>

            <Sequence from={1550} durationInFrames={330}>
                <SceneWrapper duration={330}>
                    <SceneCloser />
                </SceneWrapper>
            </Sequence>

        </AbsoluteFill>
    );
};
