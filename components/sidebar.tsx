import { 
  Play, 
  Box, 
  BookOpen, 
  Settings, 
  Hash, 
  ChevronRight,
  Building2
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Platform items
const platformItems = [
  {
    title: "Playground",
    url: "#",
    icon: Play,
  },
  {
    title: "Models",
    url: "#",
    icon: Box,
  },
  {
    title: "Documentation",
    url: "#",
    icon: BookOpen,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
]

// Project items
const projectItems = [
  {
    title: "Design Engineering",
    url: "#",
    icon: Hash,
  },
  {
    title: "Sales & Marketing",
    url: "#",
    icon: Hash,
  },
]

export function AppSidebar() {
  return (
    <Sidebar className="bg-white text-gray-900">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">Acme Inc</div>
            <div className="text-sm text-gray-600">Enterprise</div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-600 ml-auto" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600 text-sm font-medium mb-2">
            Platform
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {platformItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-gray-100 text-gray-700 hover:text-gray-900">
                    <a href={item.url} className="flex items-center gap-2 px-2 py-2">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-gray-600 text-sm font-medium mb-2">
            Projects
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projectItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-gray-100 text-gray-700 hover:text-gray-900">
                    <a href={item.url} className="flex items-center gap-2 px-2 py-2">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">S</span>
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">shadcn</div>
            <div className="text-sm text-gray-600">m@example.com</div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}