"use client";

import { SectionShell, useSection } from "@/components/SectionEditor";
import { Field, Input, Panel, Textarea } from "@/components/ui";
import type { AboutSection } from "@/lib/types";

export default function AboutPage() {
  const state = useSection<AboutSection>("home.about");
  const { data, patch } = state;

  return (
    <SectionShell
      title="About me"
      description="The paragraph that reveals itself word by word as visitors scroll."
      preview="/#about"
      state={state}
    >
      {data && (
        <Panel title="Text">
          <Field label="Small label above the text" hint="The design starts this with a dash, for example -About me.">
            <Input value={data.eyebrow} onChange={(e) => patch({ eyebrow: e.target.value })} />
          </Field>
          <Field label="About me" className="mt-4" hint="Around fifty words reads best at this size.">
            <Textarea rows={7} value={data.statement} onChange={(e) => patch({ statement: e.target.value })} />
          </Field>
        </Panel>
      )}
    </SectionShell>
  );
}
