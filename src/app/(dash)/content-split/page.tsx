"use client";

import { SectionShell, useSection } from "@/components/SectionEditor";
import { HeadingField, ImageField } from "@/components/fields";
import { Field, Input, Panel, Textarea } from "@/components/ui";
import type { ContentPanel } from "@/lib/types";

interface Data {
  title: string;
  panels: ContentPanel[];
}

export default function ContentSplitPage() {
  const state = useSection<Data>("page.content");
  const { data, patch } = state;

  const updatePanel = (i: number, changes: Partial<ContentPanel>) =>
    patch({ panels: data!.panels.map((p, j) => (j === i ? { ...p, ...changes } : p)) });

  return (
    <SectionShell
      title="Content landing"
      description="The page with two halves that lead to Professional work and Self content."
      preview="/content"
      state={state}
    >
      {data && (
        <>
          <Panel title="Page title">
            <Field label="Title" hint="Used for the browser tab.">
              <Input value={data.title} onChange={(e) => patch({ title: e.target.value })} />
            </Field>
          </Panel>

          {data.panels.map((panel, i) => (
            <Panel key={panel.id} title={i === 0 ? "Left half" : "Right half"}>
              <HeadingField value={panel.lines} onChange={(lines) => updatePanel(i, { lines })} rows={2} />
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <ImageField
                  label="Background photo"
                  value={panel.image}
                  onChange={(image) => updatePanel(i, { image })}
                  folder="content"
                  aspect="aspect-[3/4]"
                />
                <div className="flex flex-col gap-4">
                  <Field label="Image description">
                    <Textarea rows={2} value={panel.alt} onChange={(e) => updatePanel(i, { alt: e.target.value })} />
                  </Field>
                  <Field label="Link" hint="Where this half of the page leads.">
                    <Input value={panel.href} onChange={(e) => updatePanel(i, { href: e.target.value })} />
                  </Field>
                </div>
              </div>
            </Panel>
          ))}
        </>
      )}
    </SectionShell>
  );
}
