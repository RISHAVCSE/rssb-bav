// src/index.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// <-- fixed casing & paths (must match actual filenames)


const container = document.getElementById("root")!;
const root = createRoot(container);

root.render(
     <App />  
);
