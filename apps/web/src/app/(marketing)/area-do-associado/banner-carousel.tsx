"use client";

import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const BANNER_SLIDES = [
  {
    title: "Bem-vindo à área do associado",
    description: "Acompanhe por aqui as novidades do ecossistema Inova Cumaú.",
    className: "bg-floresta-700",
  },
  {
    title: "Editais e oportunidades",
    description: "Fique atento aos editais e chamadas abertas para associados.",
    className: "bg-rio-700",
  },
  {
    title: "Comunidade Inova Cumaú",
    description:
      "Conecte-se com outras startups de tecnologia e bioeconomia do Amapá.",
    className: "bg-floresta-800",
  },
];

export function BannerCarousel() {
  const autoplay = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  return (
    <Carousel
      className="mt-6"
      opts={{ loop: true }}
      plugins={[autoplay.current]}
    >
      <CarouselContent>
        {BANNER_SLIDES.map((slide) => (
          <CarouselItem key={slide.title}>
            <div
              className={`relative flex h-48 flex-col justify-center overflow-hidden rounded-xl px-10 text-white sm:h-56 ${slide.className}`}
            >
              <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black/40 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black/40 to-transparent" />
              <h2 className="relative font-sans text-xl font-medium sm:text-2xl">
                {slide.title}
              </h2>
              <p className="relative mt-2 max-w-md text-sm text-white/90 sm:text-base">
                {slide.description}
              </p>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2 border-white/20 bg-black/20 text-white hover:bg-black/40 hover:text-white" />
      <CarouselNext className="right-2 border-white/20 bg-black/20 text-white hover:bg-black/40 hover:text-white" />
    </Carousel>
  );
}
