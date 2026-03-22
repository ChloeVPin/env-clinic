import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

/**
 * SceneWrapper — wraps any scene with a smooth fade-in and fade-out.
 *
 * @param {number} fadeDuration - frames to spend fading in/out (default 12)
 */
export const SceneWrapper = ({ children, duration, fadeDuration = 12, fadeInDuration, fadeOutDuration }) => {
    const frame = useCurrentFrame();
    const { durationInFrames: videoDuration } = useVideoConfig();
    const effectiveDuration = duration ?? videoDuration;

    const fIn = fadeInDuration !== undefined ? fadeInDuration : fadeDuration;
    const fOut = fadeOutDuration !== undefined ? fadeOutDuration : fadeDuration;

    const fadeInOpacity = fIn > 0
        ? interpolate(frame, [0, fIn], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.ease) })
        : 1;

    const fadeOutOpacity = fOut > 0
        ? interpolate(frame, [effectiveDuration - fOut, effectiveDuration], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.ease) })
        : 1;

    const opacity = Math.min(fadeInOpacity, fadeOutOpacity);

    return (
        <AbsoluteFill style={{ opacity }}>
            {children}
        </AbsoluteFill>
    );
};
