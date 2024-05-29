export function getDateString(): string {
    const date = new Date();
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

export function getTimeString(): string {
    const date = new Date();
    return date.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-mm-ss
}

export function getFileName(chunkCounter: number, dateString: string, timeString: string): string {
return `Chunk-${chunkCounter}-${dateString}-T-${timeString}.wav`;
}

export function getFilePath(recordingFolderPath: string, fileName: string): string {
    return `${recordingFolderPath}/${fileName}`;
}