export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    // السماح لصفحات الـ HTML بالوصول للسيرفر (CORS)
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST',
      'Content-Type': 'application/json'
    };

    try {
      // 1. جلب كل المستخدمين
      if (action === 'getUsers') {
        const users = await env.USERS_DB.list();
        const results = await Promise.all(users.keys.map(async k => {
          const val = await env.USERS_DB.get(k.name);
          return JSON.parse(val);
        }));
        return new Response(JSON.stringify(results), { headers });
      }

      // 2. تفعيل أو إضافة مستخدم
      if (request.method === 'POST') {
        const data = await request.json();
        const { phone, days, action: postAction } = data;

        if (postAction === 'activate') {
          let user = await env.USERS_DB.get(phone);
          user = user ? JSON.parse(user) : { phone, timestamp: Date.now(), expiryDate: Date.now() };
          
          let currentExpiry = Math.max(Date.now(), new Date(user.expiryDate).getTime());
          user.expiryDate = new Date(currentExpiry + (days * 24 * 60 * 60 * 1000)).toISOString();
          
          await env.USERS_DB.put(phone, JSON.stringify(user));
          return new Response(JSON.stringify({ success: true }), { headers });
        }
      }

      return new Response("OK", { headers });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { headers, status: 500 });
    }
  }
};
