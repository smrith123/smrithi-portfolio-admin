"use client";

import { SectionShell, useSection } from "@/components/SectionEditor";
import { HeadingField, ItemList } from "@/components/fields";
import { Field, Input, Panel, Textarea } from "@/components/ui";
import { newId } from "@/lib/heading";
import type { JourneyStep, SectionHeading } from "@/lib/types";

type Data = SectionHeading & { steps: JourneyStep[] };

export default function JourneyPage() {
  const state = useSection<Data>("home.journey");
  const { data, patch } = state;

  return (
    <SectionShell
      title="Professional journey"
      description="The timeline cards that pan sideways as visitors scroll."
      preview="/#journey"
      state={state}
    >
      {data && (
        <>
          <Panel title="Section heading">
            <Field label="Small label">
              <Input value={data.eyebrow} onChange={(e) => patch({ eyebrow: e.target.value })} />
            </Field>
            <div className="mt-4">
              <HeadingField value={data.lines} onChange={(lines) => patch({ lines })} rows={4} />
            </div>
          </Panel>

          <Panel title="Timeline cards">
            <ItemList
              items={data.steps}
              onChange={(steps) => patch({ steps })}
              itemTitle={(step, i) => step.title || `Card ${i + 1}`}
              create={() => ({ id: newId(), category: "", title: "", description: "" })}
              addLabel="Add card"
              renderItem={(step, update) => (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Category" hint="The small word above the title, such as Education.">
                      <Input value={step.category} onChange={(e) => update({ category: e.target.value })} />
                    </Field>
                    <Field label="Title">
                      <Input value={step.title} onChange={(e) => update({ title: e.target.value })} />
                    </Field>
                  </div>
                  <Field label="Details">
                    <Textarea rows={3} value={step.description} onChange={(e) => update({ description: e.target.value })} />
                  </Field>
                </>
              )}
            />
          </Panel>
        </>
      )}
    </SectionShell>
  );
}
