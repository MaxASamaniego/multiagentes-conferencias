import { EventBus } from './agent_bus';

export class EnergyAgent {
    readonly limit = 500; //Wh
    constructor() {
        EventBus.instance.subscribe('energy', this.onUsage.bind(this));
    }
    onUsage(event: number) {
        if (event > this.limit) {
            EventBus.instance.emit('energy_exceed', this.limit)
        }
    }
}