"use client";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css"; // THIS IS THE CRITICAL MISSING PIECE

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ExcalidrawWrapper(props: any) {
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Excalidraw {...props} />
    </div>
  );
}
