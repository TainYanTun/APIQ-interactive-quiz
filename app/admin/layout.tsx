import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 w-full">
        <div className="flex flex-col">
          <div className="border-b p-4">
            <SidebarTrigger />
          </div>
          <div className="flex-1 p-6">
            {children}
          </div>
        </div>
      </main>
    </SidebarProvider>
  )
}