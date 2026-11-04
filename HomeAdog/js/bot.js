// Barkley, the AI adoption guide. Calls /api/chat (nginx adds the API key server-side).
const SYSTEM = `You are Barkley, a cheerful, playful dog-adoption guide on the HomeAdog website.
Help with breed choice, first-week care, training basics, feeding, and the adoption process.
Keep answers under 90 words, warm, with at most one emoji. For medical emergencies, tell the user to call a vet.
The user is ${session.name}. Dogs available: ${DOGS.map(d => `${d.name} (${d.breed}, ${d.size})`).join(', ')}.`;

const history = [];
const msgs = $('msgs');

function add(text, cls) {
  const m = document.createElement('div');
  m.className = 'm ' + cls; m.textContent = text;
  msgs.appendChild(m); msgs.scrollTop = msgs.scrollHeight;
  return m;
}

function fallback(q) {
  q = q.toLowerCase();
  if (/apartment|small space/.test(q)) return 'Apartment life? Try a Pug, Corgi or Frenchie. Small, chill, and happy with short walks! 🐾';
  if (/kid|child|family/.test(q)) return 'For families, Labradors and Golden Retrievers are famously gentle and patient.';
  if (/feed|food|eat/.test(q)) return 'Feed two measured meals a day of quality dog food, and always leave fresh water out.';
  if (/train|bark|bite/.test(q)) return 'Short, fun sessions with treats and praise work best. Consistency beats long lessons!';
  if (/adopt|process/.test(q)) return 'Pick a pup, press Adopt, then get their home ready: bed, bowls, leash, and a vet visit.';
  return "I'm in offline mode right now, but ask me about breeds, food, training or adoption!";
}

add(`Woof, ${session.name.split(' ')[0]}! I'm Barkley. Ask me anything about picking or caring for a dog.`, 'bot-m');
$('botFab').onclick = () => $('bot').hidden = !$('bot').hidden;
$('botClose').onclick = () => $('bot').hidden = true;

$('botForm').onsubmit = async e => {
  e.preventDefault();
  const text = $('botInput').value.trim();
  if (!text) return;
  $('botInput').value = '';
  add(text, 'me');
  history.push({ role: 'user', content: text });
  const thinking = add('Sniffing out an answer…', 'bot-m');
  try {
    const r = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-5-5', max_tokens: 400, system: SYSTEM, messages: history.slice(-12) })
    });
    const data = await r.json();
    const reply = (data.content || []).map(c => c.text || '').join('');
    if (!reply) throw new Error(data.error?.message || 'No reply');
    history.push({ role: 'assistant', content: reply });
    thinking.textContent = reply;
  } catch {
    history.pop();
    thinking.textContent = fallback(text);
  }
  msgs.scrollTop = msgs.scrollHeight;
};
