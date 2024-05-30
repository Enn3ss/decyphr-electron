export {};

declare global {
  interface Window {
    electron: {
      getRecordingFolderPath: () => Promise<string>;
      saveRecordingChunk: (filePath: string, buffer: ArrayBuffer) => Promise<void>;
    };
  }
}