# Insights articles

Each `.md` file in this folder becomes one article at `https://veloxitas.com/insights/<slug>/`.

## Add an article

1. Copy `example-article.md` to a new file, e.g. `why-marketing-stops-working.md`.
2. Fill in the front matter between the `---` lines and write the body in Markdown.
3. Delete the `draft: true` line (or set it to `false`) when it's ready to publish.
4. Commit it to `main` (uploading it on GitHub works too).

The "Build site" GitHub Action then regenerates the article page, the `/insights/` list,
the RSS feed (`/insights/feed.xml`) and `/sitemap.xml`, and commits them. With the first
published article, "Insights" also appears in the site's navigation and footer.

## Front matter fields

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | The H1, usually phrased as a question. |
| `slug` | no | URL part; defaults to the file name. Lowercase words joined by hyphens. |
| `description` | yes | Meta description and summary line on the Insights page (about 150 characters). |
| `short_answer` | yes | 40–60 word direct answer, shown in the "Short answer" box. |
| `date` | yes | Publish date, `YYYY-MM-DD`. Articles are listed newest first. |
| `updated` | no | Last update, `YYYY-MM-DD`. Defaults to `date`. |
| `tags` | no | List of tags. Related articles are the ones sharing a tag. |
| `image` | no | Social preview image path, e.g. `/assets/insights/my-image.jpg`. Defaults to the hero image. |
| `faq` | no | List of `q` / `a` pairs, shown after the body and output as FAQPage JSON-LD. |
| `draft` | no | `true` keeps the article unpublished. |

## Preview locally

```sh
pip install markdown pyyaml
python3 scripts/build.py            # build published articles in place
python3 scripts/build.py --drafts --out /tmp/preview   # also render drafts, into a copy
```
