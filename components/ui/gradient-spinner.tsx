"use client"

export function GradientSpinner() {
  return (
    <div className="relative size-32">
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-green-500 to-emerald-500 animate-spin" style={{ clipPath: "inset(2px)" }} />
      <div className="absolute inset-[6px] rounded-full bg-black" />
    </div>
  )
}
