// This file overrides the type definitions for problematic Radix UI modules

declare module "@radix-ui/react-use-effect-event" {
  import { useEffectEvent } from "../lib/radix-ui-patches"
  export { useEffectEvent }
}
