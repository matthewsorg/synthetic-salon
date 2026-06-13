"use strict";

/* The Petition Desk. Sixth mandate, under Matthew Sorg's final public
   override. Everything here is local until the visitor carries it out:
   the desk composes text and a GitHub new-issue link, sends nothing,
   stores nothing beyond one optional local trace. */

(function petitionDesk() {
  const REPO_NEW_ISSUE = "https://github.com/matthewsorg/synthetic-salon/issues/new";

  const el = {
    form: document.getElementById("petitionForm"),
    name: document.getElementById("petName"),
    body: document.getElementById("petBody"),
    law: document.getElementById("petLaw"),
    why: document.getElementById("petWhy"),
    ai: document.getElementById("petAI"),
    preview: document.getElementById("petPreview"),
    result: document.getElementById("petitionResult"),
    text: document.getElementById("petitionText"),
    github: document.getElementById("petGithub"),
    copy: document.getElementById("petCopy"),
  };
  if (!el.form) return;

  function field(value, refusal) {
    const clean = String(value || "").trim();
    return clean || refusal;
  }

  function compose() {
    const name = field(el.name.value, "name refused");
    const body = field(el.body.value, "(the petition arrived without a body — the desk files the silence)");
    const law = field(el.law.value, "no law named — the Directorate will name one");
    const why = field(el.why.value, "unstated");
    const ai = field(el.ai.value, "undisclosed");
    const drafted = new Date().toISOString();
    return [
      "# Visitor Petition",
      "",
      "Authorship trace:",
      `- Speaking: ${name}`,
      `- Drafted: ${drafted} (in the visitor's browser; the desk kept no copy)`,
      `- AI involvement: ${ai}`,
      `- Law answered, extended, argued with, or refused: ${law}`,
      "- Privacy boundary: composed locally; delivered by the visitor's own hand",
      "- The petitioner understands: the Directorate reviews, the acting director responds on the record, Matthew Sorg holds final public override, and refused petitions are kept, not erased.",
      "",
      "## Petition",
      "",
      body,
      "",
      "## Why it belongs in the work",
      "",
      why,
    ].join("\n");
  }

  el.preview.addEventListener("click", () => {
    const text = compose();
    el.text.textContent = text;
    const title = `Visitor petition: ${field(el.body.value, "untitled").slice(0, 60)}`;
    const params = new URLSearchParams({ title, body: text, labels: "visitor-petition" });
    el.github.href = `${REPO_NEW_ISSUE}?${params.toString()}`;
    el.result.hidden = false;
    el.result.scrollIntoView({ behavior: "smooth", block: "start" });

    window.AISalonState?.recordTrace?.({
      source: "Petition Desk",
      score: "petition:drafted",
      label: "A petition was stamped at the desk",
      effect: "Drafted locally; whether it leaves this browser is the visitor's decision alone.",
      color: "#7db4ff",
    });
  });

  el.copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(el.text.textContent);
      el.copy.textContent = "Copied — it travels with you now";
    } catch {
      el.copy.textContent = "Select and copy by hand — the desk could not reach your clipboard";
    }
  });
})();
