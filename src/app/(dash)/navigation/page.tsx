"use client";

import { SectionShell, useSection } from "@/components/SectionEditor";
import { ItemList } from "@/components/fields";
import { Field, Input, Panel } from "@/components/ui";
import type { NavLink } from "@/lib/types";

export default function NavigationPage() {
  const state = useSection<{ items: NavLink[] }>("site.nav");
  const { data, patch } = state;

  return (
    <SectionShell
      title="Site menu"
      description="The links inside the menu that opens from the button in the corner of every page."
      preview="/"
      state={state}
    >
      {data && (
        <Panel
          title="Menu links"
          description="Use / for the home page, /#about to jump to a section, and /content for the content page."
        >
          {/* A fixed set: each link can be edited and reordered, but none added or removed. */}
          <ItemList
            items={data.items}
            onChange={(items) => patch({ items })}
            itemTitle={(item, i) => item.label || `Link ${i + 1}`}
            removable={false}
            renderItem={(item, update) => (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Label">
                  <Input value={item.label} onChange={(e) => update({ label: e.target.value })} />
                </Field>
                <Field label="Link">
                  <Input value={item.href} onChange={(e) => update({ href: e.target.value })} />
                </Field>
              </div>
            )}
          />
        </Panel>
      )}
    </SectionShell>
  );
}
