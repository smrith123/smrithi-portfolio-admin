"use client";

import { SectionShell, useSection } from "@/components/SectionEditor";
import { HeadingField, ImageField, ItemList } from "@/components/fields";
import { Field, Input, Panel, Textarea } from "@/components/ui";
import { newId } from "@/lib/heading";
import type { Project, SectionHeading } from "@/lib/types";

type Data = SectionHeading & { items: Project[] };

/** The three card colours the design uses. */
const tints = [
  { value: "#e8d5b5", label: "Sand" },
  { value: "#fe9dd2", label: "Pink" },
  { value: "#e5e1da", label: "Stone" },
];

export default function ProjectsPage() {
  const state = useSection<Data>("home.projects");
  const { data, patch } = state;

  return (
    <SectionShell
      title="Projects & campaigns"
      description="The featured work cards further down the home page."
      preview="/#projects"
      state={state}
    >
      {data && (
        <>
          <Panel title="Section heading">
            <Field label="Small label">
              <Input value={data.eyebrow} onChange={(e) => patch({ eyebrow: e.target.value })} />
            </Field>
            <div className="mt-4">
              <HeadingField value={data.lines} onChange={(lines) => patch({ lines })} rows={2} />
            </div>
          </Panel>

          <Panel title="Cards">
            <ItemList
              items={data.items}
              onChange={(items) => patch({ items })}
              itemTitle={(item, i) => item.title || `Card ${i + 1}`}
              create={(): Project => ({ id: newId(), title: "", description: "", image: "", tint: "#e8d5b5" })}
              addLabel="Add card"
              renderItem={(item, update) => (
                <>
                  <Field label="Title">
                    <Input value={item.title} onChange={(e) => update({ title: e.target.value })} />
                  </Field>
                  <Field label="Description">
                    <Textarea rows={2} value={item.description} onChange={(e) => update({ description: e.target.value })} />
                  </Field>
                  <ImageField label="Card image" value={item.image} onChange={(image) => update({ image })} folder="projects" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Card colour">
                      <div className="flex gap-2">
                        {tints.map((tint) => (
                          <button
                            key={tint.value}
                            type="button"
                            onClick={() => update({ tint: tint.value })}
                            aria-pressed={item.tint === tint.value}
                            title={tint.label}
                            className={
                              "size-9 rounded-[--radius-control] border-2 transition-colors duration-150 " +
                              (item.tint === tint.value ? "border-ink" : "border-line hover:border-ink/40")
                            }
                            style={{ background: tint.value }}
                          >
                            <span className="sr-only">{tint.label}</span>
                          </button>
                        ))}
                      </div>
                    </Field>
                    <Field label="Link" hint="Optional.">
                      <Input value={item.href ?? ""} onChange={(e) => update({ href: e.target.value || undefined })} />
                    </Field>
                  </div>
                </>
              )}
            />
          </Panel>
        </>
      )}
    </SectionShell>
  );
}
