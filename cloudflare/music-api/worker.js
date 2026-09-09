const NOTION_VERSION = "2022-06-28";
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const [week, playlists] = await Promise.all([fetchWeek(env), fetchPlaylists(env)]);

      return new Response(JSON.stringify({ week, playlists }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300",
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};

async function notionQuery(env, databaseId, body) {
  const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.NOTION_TOKEN}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body || {}),
  });

  if (!res.ok) {
    throw new Error(`Notion API error ${res.status}`);
  }

  return res.json();
}

function text(prop) {
  if (!prop) return "";
  if (prop.type === "title") return prop.title.map((t) => t.plain_text).join("");
  if (prop.type === "rich_text") return prop.rich_text.map((t) => t.plain_text).join("");
  if (prop.type === "url") return prop.url || "";
  if (prop.type === "date") return prop.date ? prop.date.start : "";
  return "";
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

async function fetchWeek(env) {
  const data = await notionQuery(env, env.NOTION_WEEK_DB_ID, {
    sorts: [{ property: "Date", direction: "descending" }],
    page_size: 14,
  });

  const monday = startOfWeek(new Date());
  const week = DAYS.map((day, i) => {
    const date = new Date(monday);
    date.setUTCDate(date.getUTCDate() + i);
    return { day, date: date.toISOString().slice(0, 10), entry: null };
  });

  for (const page of data.results) {
    const props = page.properties;
    const dateStr = text(props.Date).slice(0, 10);
    const slot = week.find((w) => w.date === dateStr);
    if (slot && !slot.entry) {
      slot.entry = {
        title: text(props.Title),
        artist: text(props.Artist),
        cover: text(props.Cover),
        appleMusic: text(props["Apple Music"]),
        spotify: text(props.Spotify),
      };
    }
  }

  return week;
}

async function fetchPlaylists(env) {
  const data = await notionQuery(env, env.NOTION_PLAYLISTS_DB_ID, {
    sorts: [{ timestamp: "created_time", direction: "descending" }],
  });

  return data.results.map((page) => {
    const props = page.properties;
    return {
      title: text(props.Title),
      url: text(props.URL),
      cover: text(props.Cover),
    };
  });
}
