<script lang="ts">	
	import '../app.css';

	import { Toaster } from '@skeletonlabs/skeleton-svelte';
	import { toaster } from '$lib/utils/toast';
	
	let { children } = $props();
</script>

{@render children()}

<Toaster {toaster} />