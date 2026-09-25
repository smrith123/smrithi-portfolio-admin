"use client";

import { SectionShell, useSection } from "@/components/SectionEditor";
import { HeadingField, ImageField, ItemList } from "@/components/fields";
import { Field, Input, Panel } from "@/components/ui";
import { newId } from "@/lib/heading";
import type { ContentPiece, SectionHeading } from "@/lib/types";

type Data = SectionHeading & { pieces: ContentPiece[] };

export default function ContentPortfolioPage() {
  const state = useSection<Data>("home.contentPortfolio");
  const { data, patch } = state;

  return (
    <SectionShell
      title="Content portfolio"
      description="The cards that stack on top of each other as visitors scroll through the section."
      preview="/#content"
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

          <Panel title="Cards" description="Reorder with the arrows. The number shown on each card is whatever you type below.">
            <ItemList
              items={data.pieces}
              onChange={(pieces) => patch({ pieces })}
              itemTitle={(piece, i) => piece.label || `Card ${i + 1}`}
              create={(): ContentPiece => ({ id: newId(), number: "", label: "", image: "" })}
              addLabel="Add card"
              renderItem={(piece, update) => (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Number" hint="For example 01.">
                      <Input value={piece.number} onChange={(e) => update({ number: e.target.value })} />
                    </Field>
                    <Field label="Title">
                      <Input value={piece.label} onChange={(e) => update({ label: e.target.value })} />
                    </Field>
                  </div>
                  <ImageField label="Card image" value={piece.image} onChange={(image) => update({ image })} folder="portfolio" />
                </>
              )}
            />
          </Panel>
        </>
      )}
    </SectionShell>
  );
}
