import type { Metadata } from "next";
import { Hero } from "@/components/ui/hero";
import { Section } from "@/components/ui/section";
import { EnquiryForm } from "@/components/enquiry-form";
import { site } from "@/lib/site";
import { practiceAreas } from "@/content/firm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with P. R. Kumar & Co. — New Delhi office, partner contacts and enquiry form.",
};

const services = [...practiceAreas.map((p) => p.name), "General enquiry"];
const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(site.contact.address)}&output=embed`;

export default function ContactPage() {
  return (
    <>
      <Hero
        image="/cover/contact.jpg"
        eyebrow="Contact"
        title="Let's talk."
        subtitle="Tell us about your organisation and what you need — we'll point you to the right partner."
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-brand">New Delhi office</h2>
            <p className="mt-3 text-muted">{site.contact.address}</p>
            <p className="mt-3 text-muted">
              {site.contact.phone}
              <br />
              <a href={`mailto:${site.contact.email}`} className="hover:text-brand">
                {site.contact.email}
              </a>
            </p>

            <div className="mt-6 overflow-hidden rounded-lg border border-border">
              <iframe
                title="Office location map"
                src={mapSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-64 w-full border-0"
              />
            </div>

            {/* <h2 className="mt-10 text-xl font-semibold text-brand">Partner contacts</h2>
            <ul className="mt-4 space-y-3">
              {partnerContacts.map((p) => (
                <li key={p.slug} className="flex justify-between gap-4 border-b border-border pb-3">
                  <div>
                    <p className="font-medium text-brand">{p.name}</p>
                    <p className="text-xs text-muted">{p.role}</p>
                  </div>
                  <a
                    href={`tel:${p.phone?.replace(/\s+/g, "")}`}
                    className="text-sm text-muted hover:text-brand"
                  >
                    {p.phone}
                  </a>
                </li>
              ))}
            </ul> */}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-brand">Send an enquiry</h2>
            <div className="mt-4">
              <EnquiryForm services={services} />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
