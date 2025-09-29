// This file patches Radix UI components that try to use useEffectEvent
import { useEffectEvent } from "./use-effect-event-polyfill"

// Export the polyfill so it can be used by patched modules
export { useEffectEvent }

// Add any other patches for Radix UI components here if needed
