<script lang="ts">
    import { AppBar } from '@skeletonlabs/skeleton-svelte';
    import { Plus, Minus } from '@lucide/svelte';
    import { nrgAgent, occupAgent, reservationAgent, tempAgent } from '$lib/agents/agent_index';
    import { EventBus } from '$lib/agents/agent_bus';
    import { Conference, ConferenceRoom } from "$lib/model/conference";

    import ConferenceEdit from '$lib/components/conference_edit.svelte';
    import { toaster } from '$lib/utils/toast';
    import { TemperatureAgent } from '$lib/agents/temperature';

    function computeColor(value: number, min: number, max: number): string {
        const t = Math.min(1, Math.max(0, (value - min) / (max - min)));
    
        // Interpolate between green (0,255,0) and red (255,0,0)
        const r = Math.round(255 * t);
        const g = Math.round(255 * (1 - t));
        const b = 0;

        return `rgb(${r}, ${g}, ${b})`;
    }

    let editDialog: ConferenceEdit | null;

    function showEditDialog() {
        editDialog?.showModal();
    }

    let conferences = $state(Conference.list);
    let selected: Conference | null = $state(null);
    let temperature = $state(tempAgent.temperature);
    let energyUsage = $state(TemperatureAgent.baseLoad);
    let usedCapacity = $state(occupAgent.people);

    let fullCapacityToast = true;

    EventBus.instance.subscribe('people', (people: number) => {
        usedCapacity = people;

        if (selected) {
            if (usedCapacity == reservationAgent.getTolerableCapacity() && fullCapacityToast) {
                toaster.error({
                    title: '¡Demasiado lleno!',
                    description: 'No se admiten más personas en la conferencia'
                })

                fullCapacityToast = false;

                setTimeout(() => {
                    fullCapacityToast = true;
                }, 1000)

                return;
            }

            if (usedCapacity > selected.usedCapacity && usedCapacity == ConferenceRoom.instance.capacity + 1) {
                toaster.error({
                    title: 'Capacidad superada',
                    description: 'Se ha superado la capacidad esperada de la sala'
                })

                return;
            }
            
            if (usedCapacity > selected.usedCapacity && usedCapacity == selected.capacity + 1) {
                toaster.warning( {
                    title: 'Capacidad superada',
                    description: 'Se ha superado la capacidad esperada de la conferencia'
                })
            }

            selected.usedCapacity = usedCapacity;
        }
    })

    EventBus.instance.subscribe('energy', (energy: number) => {
        energyUsage = energy;
    })

    EventBus.instance.subscribe('temperature', (temp: number) => {
        temperature = temp;
    })

    function setSelected(conf: Conference) {
        selected = conf;
        occupAgent.people = conf.usedCapacity;

        EventBus.instance.emit('people', conf.usedCapacity);
    }

    function addPeople(amount: number) {
        for (let i = 0; i < amount; i++) {
            EventBus.instance.emit('entry');
        }
    }

    function removePeople(amount: number) {
        for (let i = 0; i < amount; i++) {
            EventBus.instance.emit('exit');
        }
    }
</script>

<AppBar>
    {#snippet lead()}
        <button onclick={showEditDialog} class="btn-icon preset-filled-primary-500 rounded-full place-self-center">
            <Plus size="24"/>
        </button>
    {/snippet}

    {#snippet trail()}
        <div class="place-self-center flex gap-4">
            <div>
                <b>Temp: </b>
                <span style="color: {computeColor(temperature, tempAgent.getBaseline(), tempAgent.getBaseline() + 10)}">
                    {temperature.toFixed(1)}°C
                </span>
            </div>
            <div>
                <b>Capacidad total: </b>
                <span style="color: {computeColor(usedCapacity, 0, ConferenceRoom.instance.capacity)}">
                    {usedCapacity}/{ConferenceRoom.instance.capacity}
                </span>
            </div>
        </div>
    {/snippet}

    <h1 class="h2">Administrador de sala de conferencias</h1>
</AppBar>

<ConferenceEdit bind:this={editDialog} onClose={() => {conferences = Conference.list}}/>

<div class="p-4 grid grid-cols-[auto_auto_1fr] gap-4 h-full">
    <div class="flex flex-col gap-2 w-48">
        {#if conferences.length > 0}
            {#each conferences as conference}
                <button class="btn" onclick={() => setSelected(conference)}>
                    {conference.name}
                </button>
            {/each}
        {:else}
            <span class="text-surface-500">Aún no hay conferencias</span>
        {/if}
    </div>
    <div class="vr h-full border-primary-500"></div>
    <div class="w-full h-full grid grid-cols-1">
        {#if conferences.length > 0}
            {#if selected}
                <div class="m-auto flex flex-col">
                    <h2 class="h2 self-center justify-self-center pb-4">{selected.name}</h2>
                    <div>
                        <b>Capacidad: </b>
                        <span style="color: {computeColor(usedCapacity, 0, selected.capacity)}">
                            {usedCapacity}/{selected.capacity}
                        </span>
                    </div>
                    <div>
                        <b>Consumo de energía: </b>
                        <span style="color: {computeColor(energyUsage, 0, nrgAgent.limit)}">
                            {energyUsage.toFixed(2)} mWh
                        </span>
                    </div>
                    <div>
                        <b>Sensación térmica: </b>
                        <span>
                            {(temperature + usedCapacity * 0.1).toFixed(1)}°C
                        </span>
                    </div>

                    <div class="flex gap-12 pt-4">
                        <div class="flex flex-col gap-2">
                            <b>Añadir personas</b>
                            <button class="btn preset-filled-primary-500" onclick={() => addPeople(1)}>
                                <Plus />
                                1
                            </button>
                            <button class="btn preset-filled-primary-500" onclick={() => addPeople(5)}>
                                <Plus />
                                5
                            </button>
                            <button class="btn preset-filled-primary-500" onclick={() => addPeople(10)}>
                                <Plus />
                                10
                            </button>
                        </div>

                        <div class="flex flex-col gap-2">
                            <b>Quitar personas</b>
                            <button class="btn preset-filled-tertiary-500" onclick={() => removePeople(1)}>
                                <Minus />
                                1
                            </button>
                            <button class="btn preset-filled-tertiary-500" onclick={() => removePeople(5)}>
                                <Minus />
                                5
                            </button>
                            <button class="btn preset-filled-tertiary-500" onclick={() => removePeople(10)}>
                                <Minus />
                                10
                            </button>
                        </div>
                    </div>
                </div>
            {:else}
                <div class="h3 justify-self-center self-center">Selecciona una conferencia para comenzar</div>
            {/if}
        {:else}
            <div class="h3 justify-self-center self-center">Agrega una conferencia para comenzar</div>
        {/if}
    </div>
</div>
