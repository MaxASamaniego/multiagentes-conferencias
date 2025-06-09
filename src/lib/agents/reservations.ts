import { Conference, ConferenceRoom } from "$lib/model/conference";
import { getLocalTimeZone, type DateValue } from "@internationalized/date";

export class ReservationAgent {
    static readonly tolerance: number = 0.1;
    constructor() {}

    unavailableDate(date: DateValue): boolean {
        let all = Conference.list

        all.forEach(c => {
            let temp = date.toDate(getLocalTimeZone());
            
            if (temp >= c.startDate && temp <= c.endDate) {
                return true
            }
        });

        return false
    }

    verifyDate(conf: Conference): boolean {
        let all = Conference.list

        console.log(all)

        return !all.some(c => {
            return c.id !== conf.id
                && ((conf.startDate >= c.startDate && conf.startDate < c.endDate)
                    || (conf.endDate > c.startDate && conf.endDate <= c.endDate)
                    || (c.startDate >= conf.startDate && c.startDate < conf.endDate)
                    || (c.endDate > conf.startDate && c.endDate <= conf.endDate)
                );
        });
    }

    verifyCapacity(conf: Conference): boolean {
        return conf.capacity <= this.getTolerableCapacity();
    }

    getTolerableCapacity() {
        return Math.round(ConferenceRoom.instance.capacity * (1 + ReservationAgent.tolerance));
    }
}