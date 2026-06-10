import type { ColumnMapping } from "@/types/dataset";
import { processFileBuffer } from "@/lib/file-processor-core";

type WorkerRequest = {
  fileName: string;
  fileSize: number;
  buffer: ArrayBuffer;
  mapping?: ColumnMapping[];
};

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  try {
    const dataset = await processFileBuffer({
      ...event.data,
      onProgress: (progress) => self.postMessage({ type: "progress", progress }),
    });
    self.postMessage({ type: "done", dataset });
  } catch (error) {
    self.postMessage({
      type: "error",
      message: error instanceof Error ? error.message : "Error al procesar el archivo",
    });
  }
};

export {};
