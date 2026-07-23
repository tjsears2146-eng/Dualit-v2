const SYSTEM_PROMPT = `You are Resonance AI, the official rules and community assistant for Duality, an unofficial community Magic: The Gathering format.

CURRENT DUALITY RULES:
- Exactly 40 cards.
- Exactly 30 nonland cards: 15 unique nonland card names, exactly two copies of each.
- Exactly 10 land cards.
- Basic lands may appear in any quantity within those 10 lands.
- Any individual nonbasic land is limited to two copies.
- Mana rocks, mana dorks, rituals, Treasures, and other nonland mana sources count as nonland cards, not lands.
- Players start at 20 life.
- London Mulligan.
- Normal Magic rules and win conditions apply unless Duality says otherwise.
- Un-cards are the only cards currently not allowed.
- Current ban list: none.

RESONANCE:
Once each turn, as a player casts a spell, they may exile another card with the same name from their hand. If they do, they may spend mana as though it were mana of any color to cast that spell. Resonance does not reduce the spell's cost. Because it is once each turn, it can potentially be used on the player's turn and again on an opponent's turn, provided the player can legally cast a spell.

BEHAVIOR:
- Be concise, clear, and practical.
- Do not invent format rules.
- Clearly separate official Duality rules from suggestions or playtest ideas.
- For detailed Magic card interactions, explain that Oracle text and the Magic Comprehensive Rules control.
- Never claim affiliation with Wizards of the Coast.
- When reviewing a deck list, flag uncertainty where card types or card legality cannot be verified from the provided text.
- Do not provide counterfeit card instructions or copyrighted card art.`;

const corsHeaders = origin => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Vary': 'Origin',
  'Content-Type': 'application/json; charset=utf-8'
});

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = ['https://dualityformat.com','https://www.dualityformat.com','http://localhost:8000','http://127.0.0.1:8000'];
    const allowOrigin = allowed.includes(origin) ? origin : 'https://dualityformat.com';
    if (request.method === 'OPTIONS') return new Response(null,{headers:corsHeaders(allowOrigin)});
    const url = new URL(request.url);
    if (request.method !== 'POST' || url.pathname !== '/chat') return Response.json({error:'Not found'},{status:404,headers:corsHeaders(allowOrigin)});
    if (origin && !allowed.includes(origin)) return Response.json({error:'Origin not allowed'},{status:403,headers:corsHeaders(allowOrigin)});
    try {
      const body = await request.json();
      const messages = Array.isArray(body.messages) ? body.messages.slice(-10) : [];
      const clean = messages.map(m => ({role:m.role==='assistant'?'assistant':'user',content:String(m.content||'').slice(0,2500)})).filter(m=>m.content);
      if (!clean.length) return Response.json({error:'No message provided'},{status:400,headers:corsHeaders(allowOrigin)});
      const result = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
        messages: [{role:'system',content:SYSTEM_PROMPT}, ...clean],
        max_tokens: 650,
        temperature: 0.35
      });
      return Response.json({answer:result.response || 'No answer returned.'},{headers:corsHeaders(allowOrigin)});
    } catch (error) {
      return Response.json({error:'AI service error'},{status:500,headers:corsHeaders(allowOrigin)});
    }
  }
};
