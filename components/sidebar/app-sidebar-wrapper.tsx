"use client"

import { AppSidebar } from "./app-sidebar"

interface AppSidebarWrapperProps {
  credits?: number
  userEmail: string
  userName: string
  avatarUrl?: string
}

export function AppSidebarWrapper(props: AppSidebarWrapperProps) {
  return <AppSidebar {...props} />
}
