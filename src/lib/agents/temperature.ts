import { EventBus } from './agent_bus';
import { getSeason } from '$lib/utils/date';
import { nrgAgent } from './agent_index';

export class TemperatureAgent {
    // Energy consumption ( in Wh )
    static readonly baseLoad: number = 0.1;
    static readonly costPerPerson: number = 0.85;
    static readonly costPerDegree: number = 18;
    //

    static readonly baseline = {
        "spring": 22,
        "summer": 20,
        "autumn": 23,
        "winter": 25
    };

    people: number = 0;
    temperature: number = this.getBaseline(); // Room temperature
    energy: number = TemperatureAgent.baseLoad;

    constructor() {
        EventBus.instance.subscribe('people', this.adjustTemp.bind(this));
        EventBus.instance.subscribe('energy_exceed', this.throttle.bind(this));
    }

    getBaseline(): number {
        return TemperatureAgent.baseline[getSeason(new Date())];
    }

    adjustTemp(peopleEvent: number) {
        if (peopleEvent == this.people) {return}

        let baseline = this.getBaseline();

        this.people = peopleEvent;
        let newTemp = baseline - (this.people * 0.1);

        this.energy = TemperatureAgent.baseLoad + (TemperatureAgent.costPerPerson * this.people) + (TemperatureAgent.costPerDegree * Math.abs(baseline - newTemp));
        this.temperature = newTemp;

        EventBus.instance.emit('energy', this.energy);
        EventBus.instance.emit('temperature', this.temperature);
    }

    throttle(energyEvent: number) {
        let baseline = this.getBaseline();

        let delta = this.temperature <= baseline ? 0.1 : -0.1;

        while(this.energy > energyEvent) {
            this.temperature += delta;
            this.energy = TemperatureAgent.baseLoad + (TemperatureAgent.costPerPerson * this.people) + (TemperatureAgent.costPerDegree * Math.abs(baseline - this.temperature));
        }

        setTimeout(() => {
            EventBus.instance.emit('energy', this.energy);
            EventBus.instance.emit('temperature', this.temperature);
        }, 100)
    }
}