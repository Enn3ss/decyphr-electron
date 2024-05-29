import {
    getDateString,
    getTimeString,
    getFileName,
    getFilePath
} from './utilityService.ts'

class RecorderService {
    private mediaRecorder: MediaRecorder | null = null;
    private stream: MediaStream | null = null;
    private recordingQueue: Promise<void> = Promise.resolve();
    private recordingFolderPath!: string;
    private isRecording: boolean = false;
    private chunkCounter: number = 1;
    private chunkStartTime: number = 0;
    private recordingInterval: number = 30000;
    private timeoutId: number | null = null;

    public async startRecording(): Promise<void> {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.recordingFolderPath = await window.electron.getRecordingFolderPath();
        this.isRecording = true;
        this.chunkCounter = 1;
        this.recordingInterval = 30000;
        this.recordChunk();
    }

    public pauseRecording(): void {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.pause();
            this.isRecording = false;

            // Clear the current timeout and calculate the remaining time
            if (this.timeoutId !== null) {
                clearTimeout(this.timeoutId);
                this.timeoutId = null;
            }

            const elapsedTime = performance.now() - this.chunkStartTime;
            this.recordingInterval -= elapsedTime;
        }
    }

    public resumeRecording(): void {
        if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
            this.mediaRecorder.resume();
            this.isRecording = true;

            // Set the timeout for the remaining time
            this.chunkStartTime = performance.now();
            this.setChunkTimeout(this.recordingInterval);
        }
    }

    public stopRecording(): void {
        this.isRecording = false;
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        if (this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    private recordChunk(): void {
        if (!this.stream) return;

        this.mediaRecorder = new MediaRecorder(this.stream);
        const localChunks: Blob[] = [];

        this.mediaRecorder.ondataavailable = (event) => {
            localChunks.push(event.data);
        };

        this.mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(localChunks, { type: 'audio/wav' });
            const arrayBuffer = await audioBlob.arrayBuffer();

            this.recordingQueue = this.recordingQueue.then(() => this.saveRecordingChunk(arrayBuffer));

            if (this.isRecording) {
                this.recordingInterval = 30000; // Reset remaining time for the next chunk
                this.recordChunk();
            }
        };

        this.mediaRecorder.start();
        this.chunkStartTime = performance.now();

        if (this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
        }
        this.setChunkTimeout(this.recordingInterval);
    }

    private setChunkTimeout(duration: number): void {
        this.timeoutId = window.setTimeout(() => {
            if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                this.mediaRecorder.stop();
            }
        }, duration);
    }

    private async saveRecordingChunk(buffer: ArrayBuffer): Promise<void> {
        const dateString = getDateString();
        const timeString = getTimeString();
        const fileName = getFileName(this.chunkCounter, dateString, timeString);
        const filePath = getFilePath(this.recordingFolderPath, fileName);

        await window.electron.saveRecordingChunk(filePath, buffer);
        this.chunkCounter++;
    }
}

export const recorderService = new RecorderService();
