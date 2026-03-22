import { Composition } from 'remotion';
import { EnvClinicPromo } from './Composition.jsx';
import { loadFont } from "@remotion/google-fonts/Inter";

loadFont();

export const Root = () => {
    return (
        <Composition
            id="EnvClinicPromo"
            component={EnvClinicPromo}
            durationInFrames={1880}  // 62.6 seconds at 30fps
            fps={30}
            width={1920}
            height={1080}
        />
    );
};
