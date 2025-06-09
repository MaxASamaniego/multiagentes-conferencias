import { EventBus } from './agent_bus';
import { reservationAgent } from './agent_index';

export class OccupancyAgent {
    people: number = 0

    constructor() {
        EventBus.instance.subscribe('entry', this.onEntry.bind(this));
        EventBus.instance.subscribe('exit', this.onExit.bind(this));
    }

    onEntry() {
        this.people = Math.min(reservationAgent.getTolerableCapacity(), this.people + 1);
        EventBus.instance.emit('people', this.people);
    }

    onExit() {
        this.people = Math.max(0, this.people - 1);
        EventBus.instance.emit('people', this.people);
    }
}