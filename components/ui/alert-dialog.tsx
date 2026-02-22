"use client"

import * as React from "react"
import { AlertDialog as AlertDialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/**
 * Renders an alert dialog root element annotated with a data-slot for styling and testing.
 *
 * @returns A React element for the alert dialog root with the `data-slot="alert-dialog"` attribute and all provided props applied.
 */
function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

/**
 * Renders an AlertDialog trigger element that applies a standardized `data-slot` and forwards all props.
 *
 * @returns The trigger element with `data-slot="alert-dialog-trigger"` and any forwarded props.
 */
function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  )
}

/**
 * Render a Portal wrapper for the alert dialog that exposes a styling/testing slot.
 *
 * Forwards all received Portal props to Radix's Portal and sets data-slot="alert-dialog-portal".
 *
 * @returns The AlertDialog Portal element with the `data-slot="alert-dialog-portal"` attribute and any forwarded props
 */
function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  )
}

/**
 * Render the alert dialog backdrop with preconfigured styling and a data-slot for slot-based composition.
 *
 * @param className - Additional class names to merge with the default overlay styles
 * @returns The overlay element used as the dialog backdrop
 */
function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders alert dialog content with responsive sizing inside a portal and overlay.
 *
 * @param size - Controls the content sizing variant; `"default"` uses the regular max width and `"sm"` uses a smaller max width.
 * @returns The AlertDialog content element mounted inside a portal together with its overlay.
 */
function AlertDialogContent({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content> & {
  size?: "default" | "sm"
}) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        data-size={size}
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 group/alert-dialog-content fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-lg",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}

/**
 * Renders the header area for an alert dialog with slot-aware layout and responsive alignment.
 *
 * @returns The header element for an AlertDialog, laid out and styled according to present slots (e.g., media) and the dialog size.
 */
function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn(
        "grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-6 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]",
        className
      )}
      {...props}
    />
  )
}

/**
 * Container for dialog actions and footer content that provides a responsive layout.
 *
 * @returns The footer element with responsive layout: stacked column-reverse on small screens and right-aligned row on larger screens.
 */
function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

/**
 * Render the alert dialog title slot with consistent typography, slot attributes, and responsive slot-aware styling.
 *
 * Forwards all provided props to the underlying AlertDialog Title primitive.
 *
 * @returns The alert dialog title element with `data-slot="alert-dialog-title"` and composed class names.
 */
function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn(
        "text-lg font-semibold sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders the alert dialog's description slot with muted, small text styling.
 *
 * @param className - Additional CSS classes to merge with the base "text-muted-foreground text-sm" styles
 * @returns A Description element for the alert dialog with `data-slot="alert-dialog-description"` and the merged `className`
 */
function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

/**
 * Renders the alert dialog's media slot.
 *
 * @returns A div element with `data-slot="alert-dialog-media"` intended for media or visual content inside the dialog.
 */
function AlertDialogMedia({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-media"
      className={cn(
        "bg-muted mb-2 inline-flex size-16 items-center justify-center rounded-md sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-8",
        className
      )}
      {...props}
    />
  )
}

/**
 * Render an AlertDialog action as a styled Button.
 *
 * @param className - Additional CSS class names to apply to the action element.
 * @param variant - Button variant to use for the action (default: "default").
 * @param size - Button size to use for the action (default: "default").
 * @returns A Button-wrapped AlertDialog action element with data-slot="alert-dialog-action".
 */
function AlertDialogAction({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action> &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
  return (
    <Button variant={variant} size={size} asChild>
      <AlertDialogPrimitive.Action
        data-slot="alert-dialog-action"
        className={cn(className)}
        {...props}
      />
    </Button>
  )
}

/**
 * Render a cancel action button for an AlertDialog.
 *
 * Renders Radix's AlertDialog.Cancel wrapped with the project's Button (asChild), sets the `data-slot` to "alert-dialog-cancel", and forwards remaining props.
 *
 * @param className - Additional CSS class names to apply to the underlying cancel element
 * @param variant - Button variant to use for the cancel action (defaults to "outline")
 * @param size - Button size to use for the cancel action (defaults to "default")
 * @returns The cancel action element to place inside an AlertDialog
 */
function AlertDialogCancel({
  className,
  variant = "outline",
  size = "default",
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel> &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
  return (
    <Button variant={variant} size={size} asChild>
      <AlertDialogPrimitive.Cancel
        data-slot="alert-dialog-cancel"
        className={cn(className)}
        {...props}
      />
    </Button>
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}