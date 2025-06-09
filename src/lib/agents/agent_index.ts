import {TemperatureAgent} from './temperature'
import {EnergyAgent} from './energy'
import {OccupancyAgent} from './occupancy'
import {ReservationAgent} from './reservations';

let tempAgent = new TemperatureAgent();
let nrgAgent = new EnergyAgent();
let occupAgent = new OccupancyAgent();
let reservationAgent = new ReservationAgent();

export {tempAgent, nrgAgent, occupAgent, reservationAgent};
