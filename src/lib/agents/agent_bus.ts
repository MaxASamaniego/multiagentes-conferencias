export class EventBus {
    static instance: EventBus = new EventBus();

    readonly subscribers: Map<String, Array<Function>>;

    constructor() {
        this.subscribers = new Map();
    }

    subscribe(event: string, callback: Function): void {
        if (!this.subscribers.get(event)){this.subscribers.set(event, [])}
        
        this.subscribers.get(event)!.push(callback);
    }

    async emit(event: string, ...args: any[]): Promise<void> {
        if (!this.subscribers.get(event)) return;
        
        this.subscribers.get(event)!.forEach(callback => callback(...args));
    }
}