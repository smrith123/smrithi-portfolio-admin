"use client";

import { SectionShell, useSection } from "@/components/SectionEditor";
import { CtaField, FileField, HeadingField, ImageField, ItemList } from "@/components/fields";
import { Field, Input, Panel, Textarea } from "@/components/ui";
import type { CareerSection } from "@/lib/types";

export default function CareerPage() {
  const state = useSection<CareerSection>("home.career");
  const { data, patch } = state;

  return (
    <SectionShell
      title="Career snapshot & CV"
      description="The three fact cards, the portrait beside them, and the panel people download the CV from."
      preview="/#career"
      state={state}
    >
      {data && (
        <>
          <Panel title="Portrait">
            <ImageField
              label="Photo"
              value={data.portrait}
              onChange={(portrait) => patch({ portrait })}
              folder="career"
              aspect="aspect-[3/4]"
            />
          </Panel>

          <Panel
            title="Fact cards"
            description="The three cards the design places beside the portrait. Each is a short heading and one line of detail underneath."
          >
            {/* Exactly three: the site puts each card in its own spot in the layout, so none can be added or removed. */}
            <ItemList
              items={data.cards}
              onChange={(cards) => patch({ cards })}
              itemTitle={(card, i) => card.lines.flat().map((p) => p.text).join(" ").trim() || `Card ${i + 1}`}
              removable={false}
              renderItem={(card, update) => (
                <>
                  <HeadingField label="Card heading" value={card.lines} onChange={(lines) => update({ lines })} rows={4} />
                  <Field label="Detail line" hint="For example the years, or the company name.">
                    <Input value={card.meta} onChange={(e) => update({ meta: e.target.value })} />
                  </Field>
                </>
              )}
            />
          </Panel>

          <Panel title="CV panel" description="The fourth card on the website, where the CV is downloaded.">
            <HeadingField
              label="Panel heading"
              value={data.panel.lines}
              onChange={(lines) => patch({ panel: { ...data.panel, lines } })}
              rows={2}
            />
            <Field label="Description" className="mt-4">
              <Textarea
                rows={2}
                value={data.panel.description}
                onChange={(e) => patch({ panel: { ...data.panel, description: e.target.value } })}
              />
            </Field>

            <div className="mt-5 rounded-[--radius-control] border border-line bg-cream/60 p-4">
              <FileField
                label="CV file"
                kind="document"
                folder="cv"
                value={data.panel.downloadCta.href}
                onChange={(href) => patch({ panel: { ...data.panel, downloadCta: { ...data.panel.downloadCta, href } } })}
                hint="A PDF. Visitors get this file when they press the download button."
              />
              <Field label="Download button text" className="mt-4">
                <Input
                  value={data.panel.downloadCta.label}
                  onChange={(e) => patch({ panel: { ...data.panel, downloadCta: { ...data.panel.downloadCta, label: e.target.value } } })}
                />
              </Field>
            </div>

            <div className="mt-4">
              <CtaField
                label="Get in touch button"
                value={data.panel.contactCta}
                onChange={(contactCta) => patch({ panel: { ...data.panel, contactCta } })}
              />
            </div>
          </Panel>
        </>
      )}
    </SectionShell>
  );
}
