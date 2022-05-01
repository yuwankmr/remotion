import React from 'react';
import {Audio, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import music from '../resources/sound1.mp3';

const AudioTestingMute: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	/**
	 * Interleave music with the movie by muting each other
	 * at certain points.
	 */
	const getMuteState = React.useCallback(
		(type: 'movie' | 'music') => {
			const muteParts = [
				{start: Number(fps), end: 2 * fps},
				{start: 4 * fps, end: 5 * fps},
			];
			const toMute = muteParts.some(
				(mp) => frame >= mp.start && frame <= mp.end
			);
			return type === 'movie' ? toMute : !toMute;
		},
		[fps, frame]
	);

	return (
		<div>
			<Sequence from={20} durationInFrames={200}>
				<Audio src={music} muted={getMuteState('music')} />
				<Audio src={music} muted={getMuteState('music')} />
				<Audio src={music} muted={getMuteState('music')} />
			</Sequence>
		</div>
	);
};

export default AudioTestingMute;
