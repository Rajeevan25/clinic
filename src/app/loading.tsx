import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex h-[70vh] w-full flex-col items-center justify-center space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-lg font-medium text-slate-500 animate-pulse">
        Healing in progress...
      </p>
    </div>
  )
}
