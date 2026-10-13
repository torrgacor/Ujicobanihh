"use client"

import { useEffect, useRef, useState } from "react"
import type { HomepageSettings } from "@/data/homepage-settings"

export function HomepageAdvertisement() {
  const [advertisement, setAdvertisement] = useState<HomepageSettings["advertisement"] | null>(null)
  const [trackIndex, setTrackIndex] = useState(1)
  const [dragOffset, setDragOffset] = useState(0)
  const [transitionEnabled, setTransitionEnabled] = useState(true)
  const gesture = useRef<{ pointerId: number; startX: number; startY: number; dragging: boolean } | null>(null)
  const suppressClick = useRef(false)

  useEffect(() => {
    fetch("/api/homepage-settings", { cache: "no-store" })
      .then((response) => response.json())
      .then((settings: HomepageSettings) => setAdvertisement(settings.advertisement))
      .catch((error) => console.error("Gagal memuat iklan:", error))
  }, [])

  const slides = advertisement?.slides.filter((slide) => slide.imageUrl) ?? []

  useEffect(() => {
    if (!advertisement?.enabled || slides.length < 2) return
    const timer = window.setInterval(() => {
      setTrackIndex((index) => index + 1)
    }, advertisement.intervalSeconds * 1000)
    return () => window.clearInterval(timer)
  }, [advertisement, slides.length])

  if (!advertisement?.enabled || slides.length === 0) return null

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (slides.length < 2) return
    gesture.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, dragging: false }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const currentGesture = gesture.current
    if (!currentGesture || currentGesture.pointerId !== event.pointerId) return

    const offsetX = event.clientX - currentGesture.startX
    const offsetY = event.clientY - currentGesture.startY
    if (!currentGesture.dragging && Math.abs(offsetX) > 6 && Math.abs(offsetX) > Math.abs(offsetY)) {
      currentGesture.dragging = true
    }
    if (currentGesture.dragging) setDragOffset(offsetX)
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const currentGesture = gesture.current
    if (!currentGesture || currentGesture.pointerId !== event.pointerId) return

    const offsetX = event.clientX - currentGesture.startX
    if (currentGesture.dragging) {
      const threshold = Math.max(40, event.currentTarget.clientWidth * 0.15)
      if (Math.abs(offsetX) > threshold) {
        setTrackIndex((index) => index + (offsetX < 0 ? 1 : -1))
      }
      if (Math.abs(offsetX) > 10) {
        suppressClick.current = true
        window.setTimeout(() => { suppressClick.current = false }, 400)
      }
    }
    gesture.current = null
    setDragOffset(0)
  }

  const handlePointerCancel = () => {
    gesture.current = null
    setDragOffset(0)
  }

  const handleTrackTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || slides.length < 2) return
    if (trackIndex !== 0 && trackIndex !== slides.length + 1) return

    setTransitionEnabled(false)
    setTrackIndex(trackIndex === 0 ? slides.length : 1)
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setTransitionEnabled(true))
    })
  }

  const trackSlides = slides.length > 1 ? [slides[slides.length - 1], ...slides, slides[0]] : slides
  const visibleTrackIndex = slides.length > 1 ? trackIndex : 0

  return (
    <div
      className={`mx-auto mb-6 w-full max-w-5xl overflow-hidden rounded-lg ${slides.length > 1 ? "cursor-grab touch-pan-y active:cursor-grabbing" : ""}`}
      role="region"
      aria-label="Iklan"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onClickCapture={(event) => {
        if (suppressClick.current) {
          event.preventDefault()
          event.stopPropagation()
          suppressClick.current = false
        }
      }}
      onDragStart={(event) => event.preventDefault()}
    >
      <div
        className={`flex w-full ${gesture.current?.dragging || !transitionEnabled ? "transition-none" : "transition-transform duration-500 ease-in-out"}`}
        style={{ transform: `translate3d(calc(-${visibleTrackIndex * 100}% + ${dragOffset}px), 0, 0)` }}
        onTransitionEnd={handleTrackTransitionEnd}
      >
        {trackSlides.map((slide, index) => (
          <div key={`${slide.id}-${index}`} className="w-full flex-none">
            {slide.destinationUrl ? (
              <a href={slide.destinationUrl} target="_blank" rel="noopener noreferrer" draggable={false} className="block">
                <img src={slide.imageUrl} alt={slide.altText || "Iklan"} draggable={false} className="block max-h-[360px] w-full select-none rounded-lg object-contain" />
              </a>
            ) : (
              <img src={slide.imageUrl} alt={slide.altText || "Iklan"} draggable={false} className="block max-h-[360px] w-full select-none rounded-lg object-contain" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}