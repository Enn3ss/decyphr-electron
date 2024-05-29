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
    private chunkCounter = 1;
    private isRecording = false;
    private recordingFolderPath!: string;
  
    public async startRecording(): Promise<void> {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.isRecording = true;
      this.chunkCounter = 1;
  
      this.recordingFolderPath = await window.electron.getRecordingFolderPath();
      this.recordChunk();
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
  
      setTimeout(() => {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
          this.mediaRecorder.stop();
        }
      }, 30000); // Stop after 30 seconds
    }
  
    private async saveRecordingChunk(buffer: ArrayBuffer): Promise<void> {
      const dateString = getDateString();
      const timeString = getTimeString();
      const fileName = getFileName(this.chunkCounter, dateString, timeString);
      const filePath = getFilePath(this.recordingFolderPath, fileName);
      
      await window.electron.saveRecordingChunk(filePath, buffer);
      this.chunkCounter++;
    }
  
    public stopRecording(): void {
      this.isRecording = false;
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop();
      }
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }
    }
  }
  
export const recorderService = new RecorderService();