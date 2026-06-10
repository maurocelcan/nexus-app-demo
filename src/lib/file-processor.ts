import type { ColumnMapping, ProcessedDataset } from "@/types/dataset";
import { NEXUS_FIELD_OPTIONS, processFileBuffer } from "@/lib/file-processor-core";

type WorkerRequest = {
  fileName: string;
  fileSize: number;
  buffer: ArrayBuffer;
  mapping?: ColumnMapping[];
};

type WorkerMessage =
  | { type: "progress"; progress: { step: number; label?: string } }
  | { type: "done"; dataset: ProcessedDataset }
  | { type: "error"; message: string };

export { NEXUS_FIELD_OPTIONS, processFileBuffer };

function processInWorker(file: File, mapping: ColumnMapping[] | undefined, onProgress?: (step: number) => void): Promise<ProcessedDataset> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("../workers/file-processor.worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      if (event.data.type === "progress") onProgress?.(event.data.progress.step);
      if (event.data.type === "done") {
        worker.terminate();
        resolve(event.data.dataset);
      }
      if (event.data.type === "error") {
        worker.terminate();
        reject(new Error(event.data.message));
      }
    };
    worker.onerror = (event) => {
      worker.terminate();
      reject(new Error(event.message || "Error en el worker de procesamiento"));
    };
    file.arrayBuffer().then((buffer) => {
      const request: WorkerRequest = { fileName: file.name, fileSize: file.size, buffer, mapping };
      worker.postMessage(request, [buffer]);
    }).catch(reject);
  });
}

export async function processExcelFile(
  file: File,
  onStep?: (step: number) => void,
  mapping?: ColumnMapping[]
): Promise<ProcessedDataset> {
  if (typeof Worker !== "undefined") {
    try {
      return await processInWorker(file, mapping, onStep);
    } catch {
      // Keep a main-thread fallback for older browsers and local build edge cases.
    }
  }
  const buffer = await file.arrayBuffer();
  return processFileBuffer({ fileName: file.name, fileSize: file.size, buffer, mapping, onProgress: (p) => onStep?.(p.step) });
}
