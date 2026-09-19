"use client";

import { SectionShell, useSection } from "@/components/SectionEditor";
import { CtaField, ImageField } from "@/components/fields";
import { Field, Input, Panel, Textarea } from "@/components/ui";
import type { HeroSection } from "@/lib/types";

export default function HeroPage() {
  const state = useSection<HeroSection>("home.hero");
  const { data, patch } = state;

  return (
    <SectionShell
      title="Hero"
      description="The first thing visitors see. The heading is three stacked words on the website."
      preview="/"
      state={state}
    >
      {data && (
        <>
          <Panel title="Heading">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="First word">
                <Input value={data.titleTop} onChange={(e) => patch({ titleTop: e.target.value })} />
              </Field>
              <Field label="Second word">
                <Input value={data.titleMid} onChange={(e) => patch({ titleMid: e.target.value })} />
              </Field>
              <Field label="Third word">
                <Input value={data.titleBottom} onChange={(e) => patch({ titleBottom: e.target.value })} />
              </Field>
            </div>
            <Field label="Subheading" className="mt-4" hint="Two or three lines work best under the big heading.">
              <Textarea rows={3} value={data.subtitle} onChange={(e) => patch({ subtitle: e.target.value })} />
            </Field>
          </Panel>

          <Panel title="Buttons">
            <div className="grid gap-4 sm:grid-cols-2">
              <CtaField label="Main button" value={data.primaryCta} onChange={(primaryCta) => patch({ primaryCta })} />
              <CtaField label="Second button" value={data.secondaryCta} onChange={(secondaryCta) => patch({ secondaryCta })} />
            </div>
          </Panel>

          <Panel title="Images">
            <div className="grid gap-6 sm:grid-cols-2">
              <ImageField
                label="Profile photo"
                value={data.portrait}
                onChange={(portrait) => patch({ portrait })}
                folder="hero"
                aspect="aspect-[3/4]"
                hint="A tall portrait, cropped to fill."
              />
              <ImageField
                label="Background texture"
                value={data.texture}
                onChange={(texture) => patch({ texture })}
                folder="hero"
                hint="The paper sheet behind the photo."
              />
            </div>
          </Panel>
        </>
      )}
    </SectionShell>
  );
}
