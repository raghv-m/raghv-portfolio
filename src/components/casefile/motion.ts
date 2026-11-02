/*
 * The one easing vocabulary for framer-motion (U5, upscale pass).
 *
 * These mirror the CSS tokens in case-file.css exactly:
 *   --cf-ease        cubic-bezier(0.23, 1, 0.32, 1)   strong ease-out
 *   --cf-ease-inout  cubic-bezier(0.77, 0, 0.175, 1)  ease-in-out (drawers/panels that travel far)
 *   --cf-ease-drawer cubic-bezier(0.32, 0.72, 0, 1)   iOS drawer curve
 *
 * No page or component hardcodes a bezier array anymore; import from here.
 */
export const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
export const EASE_INOUT: [number, number, number, number] = [0.77, 0, 0.175, 1];
export const EASE_DRAWER: [number, number, number, number] = [0.32, 0.72, 0, 1];
