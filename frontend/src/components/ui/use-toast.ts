"use client"

import * as React from "react"
import type { ToastActionElement } from '@/components/ui/toast'

import { ToastAction } from '@/components/ui/toast'

type ToasterToast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  promise?: Promise<any> | null
  dismissible?: boolean
  [key: string]: any
}

function useToast() {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([])

  const toast = React.useCallback(
    ({
      id,
      title,
      description,
      action,
      promise,
      dismissible = true,
      ...props
    }: ToasterToast) => {
      const _id = id ?? Math.random().toString(36).substring(2, 9)

      const dismiss = () => setToasts((toasts) => toasts.filter((t) => t.id !== _id))

      setToasts((toasts) => [
        ...toasts,
        {
          id: _id,
          title,
          description,
          action,
          promise,
          dismissible,
          onDismiss: dismiss,
          ...props,
        },
      ])

      return _id
    },
    []
  )

  const dismiss = React.useCallback((id?: string) => {
    if (!id) {
      setToasts([])
    } else {
      setToasts((toasts) => toasts.filter((t) => t.id !== id))
    }
  }, [])

  return {
    toasts,
    toast,
    dismiss,
  }
}

function ToastProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { toasts, toast, dismiss } = useToast()

  // This is a workaround to ensure the toast context is available
  // for the `useToast` hook to work correctly.
  const toastContext = React.useMemo(
    () => ({
      toasts,
      toast,
      dismiss,
    }),
    [toasts, toast, dismiss]
  )

  return (
    <ToastContext.Provider value={toastContext}>{children}</ToastContext.Provider>
  )
}

const ToastContext = React.createContext<{
  toasts: ToasterToast[]
  toast: (toast: ToasterToast) => string | undefined
  dismiss: (id?: string) => void
}>({
  toasts: [],
  toast: () => undefined,
  dismiss: () => null,
})

function useToastContext() {
  return React.useContext(ToastContext)
}

// Re-export the useToast hook from the context
// This is a workaround to ensure the toast context is available
export { useToast as useToast }

export { ToastProvider, useToastContext }
