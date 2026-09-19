"use client";

import { useParams } from "next/navigation";
import { SectionShell, useSection } from "@/components/SectionEditor";
import { CtaField, HeadingField, ImageField, ItemList } from "@/components/fields";
import { Field, Input, Panel, Select, Textarea } from "@/components/ui";
import { newId } from "@/lib/heading";
import type { WorkCard, WorkPage } from "@/lib/types";

const titles: Record<string, string> = {
  "professional-work": "Professional work",
  "self-content": "Self content",
};

export default function WorkPageEditor() {
  const slug = String(useParams().slug ?? "professional-work");
  const state = useSection<WorkPage>(`works.${slug}`);
  const { data, patch } = state;

  return (
    <SectionShell
      title={titles[slug] ?? "Work page"}
      description="The banner at the top of the page and the grid of posts underneath it."
      preview={`/content/${slug}`}
      state={state}
    >
      {data && (
        <>
          <Panel title="Page title" description="Used for the browser tab and for screen readers.">
            <Field label="Title">
              <Input value={data.title} onChange={(e) => patch({ title: e.target.value })} />
            </Field>
          </Panel>

          <Panel title="Banner">
            <Field label="Small label">
              <Input value={data.banner.eyebrow} onChange={(e) => patch({ banner: { ...data.banner, eyebrow: e.target.value } })} />
            </Field>
            <div className="mt-4">
              <HeadingField value={data.banner.lines} onChange={(lines) => patch({ banner: { ...data.banner, lines } })} rows={3} />
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <ImageField
                label="Banner image"
                value={data.banner.image}
                onChange={(image) => patch({ banner: { ...data.banner, image } })}
                folder={slug}
                aspect="aspect-[16/7]"
              />
              <Field label="Image description" hint="Read aloud by screen readers.">
                <Textarea rows={2} value={data.banner.alt} onChange={(e) => patch({ banner: { ...data.banner, alt: e.target.value } })} />
              </Field>
            </div>
            <div className="mt-5">
              <CtaField
                label="Banner button"
                value={data.banner.cta}
                onChange={(cta) => patch({ banner: { ...data.banner, cta } })}
                hint="Usually a link across to the other content page."
              />
            </div>
          </Panel>

          <Panel
            title="Posts"
            description="Tall cards are taller than wide, square cards are even. The grid arranges them automatically."
          >
            <ItemList
              items={data.cards}
              onChange={(cards) => patch({ cards })}
              itemTitle={(card, i) => card.title.join(" ").trim() || `Post ${i + 1}`}
              create={(): WorkCard => ({ id: newId(), tag: "", title: [""], image: "", alt: "", size: "square" })}
              addLabel="Add post"
              min={0}
              renderItem={(card, update) => (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Tag" hint="The small word above the title, such as Reels.">
                      <Input value={card.tag} onChange={(e) => update({ tag: e.target.value })} />
                    </Field>
                    <Field label="Shape">
                      <Select value={card.size} onChange={(e) => update({ size: e.target.value as WorkCard["size"] })}>
                        <option value="square">Square</option>
                        <option value="tall">Tall</option>
                      </Select>
                    </Field>
                  </div>
                  <Field label="Title" hint="One line per row, so the title breaks where you want it to.">
                    <Textarea
                      rows={2}
                      value={card.title.join("\n")}
                      onChange={(e) => update({ title: e.target.value.split("\n") })}
                    />
                  </Field>
                  <Field label="Description" hint="Appears when someone hovers over the card.">
                    <Textarea
                      rows={2}
                      value={card.description ?? ""}
                      onChange={(e) => update({ description: e.target.value || undefined })}
                    />
                  </Field>
                  <ImageField label="Image" value={card.image} onChange={(image) => update({ image })} folder={slug} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Image description">
                      <Input value={card.alt} onChange={(e) => update({ alt: e.target.value })} />
                    </Field>
                    <Field label="Post link" hint="Optional link to the Instagram, TikTok or YouTube post.">
                      <Input
                        value={card.href ?? ""}
                        placeholder="https://"
                        onChange={(e) => update({ href: e.target.value || undefined })}
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
