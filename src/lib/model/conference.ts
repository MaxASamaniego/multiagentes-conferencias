export class Conference {
    static readonly list: Array<Conference> = [];
    id = crypto.randomUUID();
    name: string;
    description: string;

    startDate: Date;
    endDate: Date;

    capacity: number;

    usedCapacity: number = 0;

    constructor(name: string, description: string, startDate: Date, endDate: Date, capacity: number) {
        this.name = name;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.capacity = capacity;
    }

    save() {
        Conference.list.push(this);
    }
}

export class ConferenceRoom {
    static readonly instance: ConferenceRoom = new ConferenceRoom();
    readonly capacity: number = 200;
}