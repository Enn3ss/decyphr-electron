import {
    getDateString,
    getTimeString,
    getFileName,
    getFilePath
} from './utilityService.ts';
import { timerService } from './timerService.ts';

class RecorderService {
    private mediaRecorder: MediaRecorder | null = null;
    private stream: MediaStream | null = null;
    private recordingQueue: Promise<void> = Promise.resolve();
    private recordingFolderPath!: string;
    private isRecording: boolean = false;
    private chunkCounter: number = 1;

    public async startRecording(): Promise<void> {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.recordingFolderPath = await window.electron.getRecordingFolderPath();
        this.isRecording = true;
        this.chunkCounter = 1;
        timerService.start();
        this.recordChunk();
    }

    public pauseRecording(): void {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.pause();
            this.isRecording = false;
            timerService.pause();
        }
    }

    public resumeRecording(): void {
        if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
            this.mediaRecorder.resume();
            this.isRecording = true;
            timerService.resume();
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
        timerService.stop();
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
                this.recordChunk();
            }
        };

        this.mediaRecorder.start();
        timerService.subscribe(this.handleChunkTimeout.bind(this));
    }

    private handleChunkTimeout(elapsed: number): void {
        const duration = 30000; // 30 seconds in milliseconds
        if (elapsed >= duration && this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
            timerService.stop();
            timerService.start();
        }
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