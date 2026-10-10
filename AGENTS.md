<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Preserve the imported Ads Manager frontend routes and shared demo store; they retain the user's existing workflows without implying a live advertising connection.
- Keep campaign-detail visual rules in src/styles.css and use shared Button and Switch controls so the reference treatment stays consistent.
- Keep compact screen spacing in the shared stylesheet, and make plain text-row buttons auto-height and wrapping so long content cannot clip on phones.
- Reuse AssistantIcon for reference-style assistant controls; the assistant presents existing demo recommendations, not a live AI service.
