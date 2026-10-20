export const escapeHTML = (text='') => String(text ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
export const dateBR = date => date ? new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR') : 'Sem prazo';
export const statusClass = text => ({'Não iniciada':'todo','Em andamento':'progress','Concluída':'done'}[text] || 'todo');
export const priorityClass = text => ({'Alta':'high','Média':'medium','Baixa':'low'}[text] || 'medium');
export const $ = selector => document.querySelector(selector);
export function setContent(html) { $('#screen').innerHTML = html; }
export function notify(message, error=false) {
  const node = document.createElement('div');
  node.className = `toast ${error ? 'error' : ''}`;
  node.textContent = message;
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 4200);
}
export function pageTitle(title, subtitle, action='') {
  return `<header class="page-heading"><div><p class="eyebrow">ESPAÇO DE TRABALHO</p><h1>${escapeHTML(title)}</h1><p class="subtitle">${escapeHTML(subtitle)}</p></div>${action}</header>`;
}
export const label = (name, css='') => `<span class="pill ${css}">${escapeHTML(name)}</span>`;
