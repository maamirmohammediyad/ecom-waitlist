// netlify/functions/notion-waitlist.js
const { Client } = require("@notionhq/client"); // [web:112]

// تهيئة Notion Client باستخدام الـ API Key من المتغيرات البيئية
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// ID قاعدة بيانات Notion الخاصة بالـ Waitlist
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

exports.handler = async (event, context) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  try {
    const data = JSON.parse(event.body || "{}");

    const {
  store_type,
  selling_since,
  monthly_orders,
  platforms,
  orders_recording,
  cod_usage,
  works_with_affiliates,
  how_track_affiliate_orders,
  main_problem,
  store_name,
  email,
  whatsapp,
  notes,
  status,
} = data;
    if (!store_name || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "store_name and email are required" }),
      };
    }

    const properties = {
  "Store / Person": {
    title: [{ text: { content: store_name } }],
  },
  "Store Type": store_type ? { select: { name: store_type } } : undefined,
  "Selling Since": selling_since ? { select: { name: selling_since } } : undefined,
  "Monthly Orders": monthly_orders ? { select: { name: monthly_orders } } : undefined,
  "Main Platforms": Array.isArray(platforms)
    ? { multi_select: platforms.map((p) => ({ name: p })) }
    : undefined,
  "Orders Recording": orders_recording ? { select: { name: orders_recording } } : undefined,
  "COD Usage": cod_usage ? { select: { name: cod_usage } } : undefined,
  "Works With Affiliates": works_with_affiliates
    ? { select: { name: works_with_affiliates } }
    : undefined,

  "How Track Affiliate Orders": how_track_affiliate_orders
  ? { select: { name: how_track_affiliate_orders } }
  : undefined,

  "Main Problem": main_problem
    ? { rich_text: [{ text: { content: main_problem } }] }
    : undefined,

  Email: { email },
  WhatsApp: whatsapp
    ? { rich_text: [{ text: { content: whatsapp } }] }
    : undefined,
  Notes: notes
    ? { rich_text: [{ text: { content: notes } }] }
    : undefined,
  Status: { status: { name: status || "New" } },
};

    Object.keys(properties).forEach((key) => {
      if (properties[key] === undefined) delete properties[key];
    });

    const response = await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, id: response.id }),
    };
  } catch (error) {
    console.error("Notion error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal Server Error", details: error.message }),
    };
  }
};