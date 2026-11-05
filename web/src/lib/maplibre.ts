import { browser } from '$app/env';
import { setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

export function initMapLibreWorker(): void {
  if (browser && typeof setWorkerUrl === 'function') {
    setWorkerUrl(workerUrl);
  }
}
