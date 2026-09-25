"use client";

import { SectionShell, useSection } from "@/components/SectionEditor";
import { HeadingField, ImageField, ItemList, VisibilityField } from "@/components/fields";
import { Field, Input, Panel } from "@/components/ui";
import { newId } from "@/lib/heading";
import type { Brand, SectionHeading } from "@/lib/types";

type Data = SectionHeading & { visible?: boolean; items: Brand[] };

export default function CollaborationsPage() {
  const state = useSection<Data>("home.brands");
  const { data, patch } = state;

  // Mirrors the backend schema, so the Save bar explains a problem instead of the API answering 400:
  // every logo needs a brand name (it is the logo's alt text on the site) and an image.
  const incomplete = data?.items.findIndex((b) => !b.name.trim() || !b.logo) ?? -1;
  const invalid =
    incomplete < 0
      ? undefined
      : data!.items[incomplete].name.trim()
        ? `Choose a logo image for ${data!.items[incomplete].name.trim()} before saving.`
        : `Add a brand name to Logo ${incomplete + 1} before saving.`;

  return (
    <SectionShell
      title="Collaborations"
      description="Brand logos in the strip that scrolls sideways on its own. Three or more keeps the strip full."
      preview="/#brands"
      state={state}
      invalid={invalid}
    >
      {data && (
        <>
          <Panel title="Visibility">
            {/* Content saved before this switch existed has no value and is shown. */}
            <VisibilityField visible={data.visible !== false} onChange={(visible) => patch({ visible })} />
          </Panel>

          <Panel title="Section heading">
            <Field label="Small label">
              <Input value={data.eyebrow} onChange={(e) => patch({ eyebrow: e.target.value })} />
            </Field>
            <div className="mt-4">
              <HeadingField value={data.lines} onChange={(lines) => patch({ lines })} rows={2} />
            </div>
          </Panel>

          <Panel title="Logos" description="Upload logos on a transparent background where possible.">
            <ItemList
              items={data.items}
              onChange={(items) => patch({ items })}
              itemTitle={(item, i) => item.name || `Logo ${i + 1}`}
              create={(): Brand => ({ id: newId(), name: "", logo: "", width: 200, height: 41 })}
              addLabel="Add logo"
              renderItem={(item, update) => (
                <>
                  <Field
                    label="Brand name"
                    hint="Used as the image description for screen readers."
                    error={item.name.trim() ? undefined : "Required. It describes the logo to screen readers."}
                  >
                    <Input value={item.name} onChange={(e) => update({ name: e.target.value })} />
                  </Field>
                  <ImageField
                    label="Logo"
                    value={item.logo}
                    onChange={(logo, asset) => update({ logo, width: asset.width ?? item.width, height: asset.height ?? item.height })}
                    folder="brands"
                    aspect="aspect-[3/1]"
                    hint="The strip sizes every logo to the same height."
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Width" hint="Filled in automatically when you upload. Only change it to correct the shape.">
                      <Input
                        type="number"
                        min={1}
                        value={item.width}
                        onChange={(e) => update({ width: Number(e.target.value) || 1 })}
                      />
                    </Field>
                    <Field label="Height">
                      <Input
                        type="number"
                        min={1}
                        value={item.height}
                        onChange={(e) => update({ height: Number(e.target.value) || 1 })}
                      />
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
