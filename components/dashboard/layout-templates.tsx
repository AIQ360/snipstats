import type React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const layoutTemplateVariants = cva("grid gap-4 w-full", {
  variants: {
    template: {
      standard: "grid-cols-4",
      metrics: "grid-cols-2",
      chart: "grid-cols-1",
      split: "grid-cols-2",
      minimal: "grid-cols-1",
    },
  },
  defaultVariants: {
    template: "standard",
  },
})

export interface LayoutTemplateProps extends VariantProps<typeof layoutTemplateVariants> {
  children: React.ReactNode
  className?: string
}

export function LayoutTemplate({ children, template, className }: LayoutTemplateProps) {
  return <div className={cn(layoutTemplateVariants({ template }), className)}>{children}</div>
}

export interface LayoutTemplateOption {
  id: string
  name: string
  description: string
  preview: React.ReactNode
}

export const layoutTemplateOptions: LayoutTemplateOption[] = [
  {
    id: "standard",
    name: "Standard",
    description: "Balanced layout with metrics and chart",
    preview: (
      <div className="grid grid-cols-4 gap-2 h-16">
        <div className="bg-primary/20 rounded-md col-span-1"></div>
        <div className="bg-primary/20 rounded-md col-span-1"></div>
        <div className="bg-primary/20 rounded-md col-span-1"></div>
        <div className="bg-primary/20 rounded-md col-span-1"></div>
        <div className="bg-primary/30 rounded-md col-span-4 h-8"></div>
      </div>
    ),
  },
  {
    id: "metrics",
    name: "Metrics Focus",
    description: "Emphasize key metrics",
    preview: (
      <div className="grid grid-cols-2 gap-2 h-16">
        <div className="bg-primary/20 rounded-md col-span-1 h-16"></div>
        <div className="bg-primary/20 rounded-md col-span-1 h-16"></div>
      </div>
    ),
  },
  {
    id: "chart",
    name: "Chart Focus",
    description: "Highlight the main chart",
    preview: (
      <div className="grid grid-cols-1 gap-2 h-16">
        <div className="bg-primary/30 rounded-md col-span-1 h-16"></div>
      </div>
    ),
  },
  {
    id: "split",
    name: "Split View",
    description: "Side-by-side metrics and chart",
    preview: (
      <div className="grid grid-cols-2 gap-2 h-16">
        <div className="grid grid-cols-1 gap-1 h-16">
          <div className="bg-primary/20 rounded-md h-5"></div>
          <div className="bg-primary/20 rounded-md h-5"></div>
          <div className="bg-primary/20 rounded-md h-5"></div>
        </div>
        <div className="bg-primary/30 rounded-md h-16"></div>
      </div>
    ),
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean, focused presentation",
    preview: (
      <div className="grid grid-cols-1 gap-2 h-16">
        <div className="bg-primary/20 rounded-md h-5"></div>
        <div className="bg-primary/30 rounded-md h-10"></div>
      </div>
    ),
  },
]
