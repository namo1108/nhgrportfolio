function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

async function handleRecords(request, env) {
  if (request.method === "GET") {
    const { results } = await env.DB.prepare(
      "SELECT * FROM records ORDER BY created_at DESC"
    ).all();
    return json({ records: results });
  }

  if (request.method === "POST") {
    const body = await request.json();
    const id = String(body.id || "");
    const writer = String(body.writer || "");
    const type = String(body.type || "");
    const cat = String(body.cat || "");
    const amt = Number(body.amt) || 0;
    const memo = String(body.memo || "");
    const date = String(body.date || "");

    if (!id || !type || !cat || !date) {
      return json({ error: "id, type, cat, date 필수" }, 400);
    }

    await env.DB.prepare(
      `INSERT INTO records (id, writer, type, cat, amt, memo, date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, writer, type, cat, amt, memo, date).run();

    const row = await env.DB.prepare("SELECT * FROM records WHERE id = ?").bind(id).first();
    return json(row, 201);
  }

  return json({ error: "method not allowed" }, 405);
}

async function handleRecordById(request, env, id) {
  if (request.method === "PATCH") {
    const body = await request.json();
    const type = String(body.type || "");
    const cat = String(body.cat || "");
    const amt = Number(body.amt) || 0;
    const memo = String(body.memo || "");
    const date = String(body.date || "");

    if (!type || !cat || !date) {
      return json({ error: "type, cat, date 필수" }, 400);
    }

    await env.DB.prepare(
      `UPDATE records SET type=?, cat=?, amt=?, memo=?, date=? WHERE id=?`
    ).bind(type, cat, amt, memo, date, id).run();

    const row = await env.DB.prepare("SELECT * FROM records WHERE id = ?").bind(id).first();
    if (!row) return json({ error: "not found" }, 404);
    return json(row);
  }

  if (request.method === "DELETE") {
    await env.DB.prepare("DELETE FROM records WHERE id = ?").bind(id).run();
    return json({ ok: true });
  }

  return json({ error: "method not allowed" }, 405);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/records") {
      return handleRecords(request, env);
    }
    const m = url.pathname.match(/^\/api\/records\/([^/]+)$/);
    if (m) {
      return handleRecordById(request, env, decodeURIComponent(m[1]));
    }

    return env.ASSETS.fetch(request);
  },
};
