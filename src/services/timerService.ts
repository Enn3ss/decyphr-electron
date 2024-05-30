class TimerService {
    private startTimestamp: number = 0;
    private elapsed: number = 0;
    private isPaused: boolean = false;
    private intervalId: number | null = null;
    private subscribers: Set<(elapsed: number) => void> = new Set();

    public start(): void {
        this.startTimestamp = performance.now();
        this.isPaused = false;
        this.intervalId = window.setInterval(this.update.bind(this), 1000);
    }

    public stop(): void {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isPaused = true;
        this.elapsed = 0;
    }

    public pause(): void {
        if (!this.isPaused) {
            this.elapsed += performance.now() - this.startTimestamp;
            this.isPaused = true;
            if (this.intervalId !== null) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
        }
    }

    public resume(): void {
        if (this.isPaused) {
            this.startTimestamp = performance.now();
            this.isPaused = false;
            this.intervalId = window.setInterval(this.update.bind(this), 1000);
        }
    }

    public subscribe(callback: (elapsed: number) => void): void {
        this.subscribers.add(callback);
    }

    public unsubscribe(callback: (elapsed: number) => void): void {
        this.subscribers.delete(callback);
    }

    public getElapsed(): number {
        if (this.isPaused) {
            return this.elapsed;
        } else {
            return this.elapsed + (performance.now() - this.startTimestamp);
        }
    }

    private update(): void {
        if (!this.isPaused) {
            const now = performance.now();
            const elapsed = this.elapsed + (now - this.startTimestamp);
            this.notifySubscribers(elapsed);
        }
    }

    private notifySubscribers(elapsed: number): void {
        this.subscribers.forEach(callback => callback(elapsed));
    }
}

export const timerService = new TimerService();