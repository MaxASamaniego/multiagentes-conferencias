<script lang="ts">
    import Calendar from './Calendar.svelte';
    import { Toaster, createToaster } from '@skeletonlabs/skeleton-svelte';
    import { toaster } from '$lib/utils/toast';
    import { Conference } from '$lib/model/conference';
    import { today, getLocalTimeZone, type DateValue } from '@internationalized/date';

    import { reservationAgent } from '$lib/agents/agent_index';

    let { onClose = () => {} } = $props();

    let conference = new Conference("", "", new Date(), new Date(), 0);

    let startDate: DateValue = $state(today(getLocalTimeZone()));
    let endDate: DateValue = $state(today(getLocalTimeZone()));
    let minEndDate: DateValue = $state(today(getLocalTimeZone()));

    function getStartDate() {
        return startDate;
    }

    function setStartDate(date: DateValue) {
        startDate = date;
        minEndDate = date;
        
        if (endDate < minEndDate) {
            endDate = minEndDate;
        }
    }

    function dateUnavailable(date: DateValue): boolean {
        return reservationAgent.unavailableDate(date);
    }

    let name: string = $state("");
    let description: string = $state("");
    let capacity: number = $state(0);

    function clear() {
        name = "";
        description = "";
        startDate = today(getLocalTimeZone());
        endDate = today(getLocalTimeZone());
        minEndDate = today(getLocalTimeZone());
        capacity = 0;

        conference = new Conference("", "", new Date(), new Date(), 0);
    }

    let editToaster = createToaster();

    function save() {
        conference.name = name;
        conference.description = description;
        conference.capacity = capacity;
        conference.startDate = startDate.toDate(getLocalTimeZone());
        conference.endDate = endDate.toDate(getLocalTimeZone());

        if (conference.name.trim().length == 0) {
            editToaster.error({
                title: "Nombre no válido",
                description: "El nombre de la conferencia no puede estar vacío"
            });
            return;
        }

        if (!reservationAgent.verifyDate(conference)) {
            editToaster.error({
                title: "Fecha no disponible",
                description: "La fecha seleccionada está ocupada por otra conferencia"
            });
            return;
        }

        if (!reservationAgent.verifyCapacity(conference)) {
            editToaster.error({
                title: "Capacidad excedida",
                description: "La capacidad de la conferencia excede la capacidad de la sala de conferencias"
            });
            return;
        }

        toaster.success({
            title: "Conferencia guardada",
            description: "La conferencia se ha guardado correctamente"
        });

        
        conference.save();
        clear();
        closeModal();
    }

    let elemModal: HTMLDialogElement | null;

    export function showModal() {
        elemModal?.showModal();
    }

    function closeModal() {
        elemModal?.close();
        onClose();
    }
</script>

<dialog bind:this={elemModal} class="rounded-container bg-surface-100-900 text-inherit max-w-[1280px] top-1/2 left-1/2 -translate-1/2 p-4 space-y-4 z-10 backdrop:bg-surface-50/75 dark:backdrop:bg-surface-950/75">
    <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-4">
            <input type="text" class="input" bind:value={name} placeholder="Nombre">
            <textarea class="input resize-none" bind:value={description} placeholder="Descripción" spellcheck>
            </textarea>
            <div class="flex mr-auto gap-2">
                <b class=" place-self-center">Capacidad:</b>
                <input type="number" class="input" min="1" max={reservationAgent.getTolerableCapacity()} bind:value={capacity}>
            </div>
        </div>

        <div class="flex justify-around">
            <div class="flex flex-col w-auto">
                <b>Fecha de inicio:</b>
                <Calendar bind:value={getStartDate, setStartDate} dateUnavailable={dateUnavailable}/>
            </div>

            <div class="flex flex-col w-auto">
                <b>Fecha de finalización:</b>
                <Calendar bind:value={endDate} bind:minDate={minEndDate} dateUnavailable={dateUnavailable}/>
            </div>
        </div>

        <div class="flex gap-4 mx-auto">
            <button class="btn preset-filled-primary-500" onclick={save}>Guardar</button>
            <button class="btn preset-filled" onclick={closeModal}>Cancelar</button>
        </div>
    </div>

    <Toaster toaster={editToaster}/>
</dialog>