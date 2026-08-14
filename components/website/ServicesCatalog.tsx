import type { Service } from "@/models";
import { Reveal } from "@/components/website/Reveal";
import { ServiceCard } from "@/components/website/ServiceCard";

export function ServicesCatalog({ services }: { services: Service[] }) {
  if (!services.length) return null;

  return (
    <section className="section-pad">
      <div className="container-wide">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.id} delay={i * 50} className="h-full">
              <ServiceCard
                name={service.name}
                slug={service.slug}
                description={service.short_description}
                image={service.image_url}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
