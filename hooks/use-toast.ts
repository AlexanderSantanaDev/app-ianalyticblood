import type React from "react"
import type { ToastActionElement, ToastProps } from "@/components/ui/toast"
import { useToast as useToastOriginal, toast as toastOriginal } from "@/components/ui/use-toast"

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const useToast = () => {
  const { toast, dismiss } = useToastOriginal()

  return {
    toast,
    dismiss,
    // Método de conveniencia para mostrar un toast de éxito
    success: (props: Omit<ToasterToast, "id">) => {
      return toast({
        ...props,
        variant: "default",
      })
    },
    // Método de conveniencia para mostrar un toast de error
    error: (props: Omit<ToasterToast, "id">) => {
      return toast({
        ...props,
        variant: "destructive",
      })
    },
  }
}

export { useToast, toastOriginal as toast }
