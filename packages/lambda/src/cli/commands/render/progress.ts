import {CliInternals} from '@remotion/cli';
import {Internals} from 'remotion';
import {CleanupInfo, EncodingProgress, RenderProgress} from '../../../defaults';
import {ChunkRetry} from '../../../functions/helpers/get-retry-stats';
import {EnhancedErrorInfo} from '../../../functions/helpers/write-lambda-error';

type LambdaInvokeProgress = {
	totalLambdas: number | null;
	lambdasInvoked: number;
	doneIn: number | null;
};

type ChunkProgress = {
	totalChunks: number | null;
	chunksInvoked: number;
	doneIn: number | null;
};

export type MultiRenderProgress = {
	lambdaInvokeProgress: LambdaInvokeProgress;
	chunkProgress: ChunkProgress;
	encodingProgress: EncodingProgress;
	cleanupInfo: CleanupInfo | null;
};

const makeInvokeProgress = (
	invokeProgress: LambdaInvokeProgress,
	totalSteps: number,
	retriesInfo: ChunkRetry[]
) => {
	const {lambdasInvoked, totalLambdas, doneIn} = invokeProgress;
	const progress = doneIn
		? 1
		: totalLambdas === null
		? 0
		: lambdasInvoked / totalLambdas;
	return [
		'⚡️',
		`(1/${totalSteps})`,
		CliInternals.makeProgressBar(progress),
		`${doneIn === null ? 'Invoking' : 'Invoked'} lambdas`,
		doneIn === null
			? `${Math.round(progress * 100)}%`
			: CliInternals.chalk.gray(`${doneIn}ms`),
		retriesInfo.length > 0 ? `(+${retriesInfo.length} retries)` : [],
	].join(' ');
};

const makeChunkProgress = ({
	chunkProgress,
	invokeProgress,
	totalSteps,
}: {
	chunkProgress: ChunkProgress;
	invokeProgress: LambdaInvokeProgress;
	totalSteps: number;
}) => {
	const lambdaIsDone = invokeProgress.doneIn !== null;
	const {chunksInvoked, totalChunks, doneIn} = chunkProgress;
	const progress = totalChunks === null ? 0 : chunksInvoked / totalChunks;
	const shouldShow = lambdaIsDone || progress > 0;
	if (!shouldShow) {
		return '';
	}

	return [
		'🧩',
		`(2/${totalSteps})`,
		CliInternals.makeProgressBar(progress),
		`${doneIn === null ? 'Rendering' : 'Rendered'} chunks`,
		doneIn === null
			? `${Math.round(progress * 100)}%`
			: CliInternals.chalk.gray(`${doneIn}ms`),
	].join(' ');
};

const makeEncodingProgress = ({
	encodingProgress,
	chunkProgress,
	totalSteps,
}: {
	encodingProgress: EncodingProgress;
	chunkProgress: ChunkProgress;
	totalSteps: number;
}) => {
	const {framesEncoded, totalFrames, doneIn} = encodingProgress;
	const progress = totalFrames === null ? 0 : framesEncoded / totalFrames;
	const chunksDone = chunkProgress.doneIn !== null;
	const shouldShow = progress > 0 || chunksDone;
	if (!shouldShow) {
		return '';
	}

	return [
		'📽 ',
		`(3/${totalSteps})`,
		CliInternals.makeProgressBar(progress),
		`${doneIn === null ? 'Combining' : 'Combined'} videos`,
		doneIn === null
			? `${Math.round(progress * 100)}%`
			: CliInternals.chalk.gray(`${doneIn}ms`),
	].join(' ');
};

const makeCleanupProgress = (
	cleanupInfo: CleanupInfo | null,
	totalSteps: number
) => {
	if (!cleanupInfo) {
		return '';
	}

	const {doneIn, filesDeleted, filesToDelete} = cleanupInfo;
	const progress = filesDeleted / filesToDelete;
	return [
		'🪣 ',
		`(4/${totalSteps})`,
		CliInternals.makeProgressBar(progress),
		`${doneIn === null ? 'Cleaning up' : 'Cleaned up'} artifacts`,
		doneIn === null
			? `${Math.round(progress * 100)}%`
			: CliInternals.chalk.gray(`${doneIn}ms`),
	].join(' ');
};

const makeDownloadProgress = (totalSteps: number, downloadedYet: boolean) => {
	return [
		'💾',
		`(5/${totalSteps})`,
		// TODO: More granularly
		CliInternals.makeProgressBar(Number(downloadedYet)),
		`${downloadedYet ? 'Downloaded' : 'Downloading'} video`,
		// TODO
		downloadedYet ? CliInternals.chalk.gray('TODOms') : '0%',
	].join(' ');
};

export const makeMultiProgressFromStatus = (
	status: RenderProgress
): MultiRenderProgress => {
	return {
		chunkProgress: {
			chunksInvoked: status.chunks,
			totalChunks: status.renderMetadata?.totalChunks ?? null,
			doneIn: status.timeToFinishChunks,
		},
		encodingProgress: {
			framesEncoded: status.encodingStatus?.framesEncoded ?? 0,
			totalFrames: status.renderMetadata?.videoConfig.durationInFrames ?? 1,
			doneIn: status.encodingStatus?.doneIn ?? null,
			timeToInvoke: status.encodingStatus?.timeToInvoke ?? null,
		},
		lambdaInvokeProgress: {
			doneIn: status.timeToInvokeLambdas,
			lambdasInvoked: status.lambdasInvoked,
			totalLambdas:
				status.renderMetadata?.estimatedRenderLambdaInvokations ?? null,
		},
		cleanupInfo: status.cleanup,
	};
};

const makeErrors = (errors: EnhancedErrorInfo[]) => {
	if (errors.length === 0) {
		return null;
	}

	return errors
		.map((err) => {
			const shortStack = `${err.stack.substr(0, 90)}...`;
			if (err.willRetry) {
				if (err.chunk === null) {
					return `Error while preparing render (will retry): ${shortStack}`;
				}

				return `Error in chunk (will retry) ${err.chunk}: ${shortStack}`;
			}

			if (err.chunk === null) {
				return `Error during preparation: ${shortStack}.`;
			}

			return `Error in chunk ${err.chunk}: ${shortStack}`;
		})
		.join('\n');
};

export const makeProgressString = ({
	outName,
	progress,
	steps,
	isDownloaded,
	errors,
	retriesInfo,
}: {
	outName: string | null;
	progress: MultiRenderProgress;
	steps: number;
	isDownloaded: boolean;
	errors: EnhancedErrorInfo[];
	retriesInfo: ChunkRetry[];
}) => {
	return [
		makeInvokeProgress(progress.lambdaInvokeProgress, steps, retriesInfo),
		makeChunkProgress({
			chunkProgress: progress.chunkProgress,
			invokeProgress: progress.lambdaInvokeProgress,
			totalSteps: steps,
		}),
		makeErrors(errors),
		makeEncodingProgress({
			encodingProgress: progress.encodingProgress,
			chunkProgress: progress.chunkProgress,
			totalSteps: steps,
		}),
		makeCleanupProgress(progress.cleanupInfo, steps),
		outName && progress.encodingProgress.doneIn
			? makeDownloadProgress(steps, isDownloaded)
			: null,
	]
		.filter(Internals.truthy)
		.join('\n');
};