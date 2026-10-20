let token = sessionStorage.getItem('taskflow_token') || '';
export const getToken = () => token;
export function setToken(next) {
  token = next || '';
  if (token) sessionStorage.setItem('taskflow_token', token);
  else sessionStorage.removeItem('taskflow_token');
}
export async function api(path, {method = 'GET', body} = {}) {
  let response;
  try {
    response = await fetch(`/api/${path}`, {
      method,
      headers: { ...(token ? {Authorization: `Bearer ${token}`} : {}), ...(body !== undefined ? {'Content-Type': 'application/json'} : {}) },
      ...(body !== undefined ? {body: JSON.stringify(body)} : {}),
    });
  } catch {
    throw new Error('Não foi possível acessar a API. Inicie o aplicativo com python server.py.');
  }
  let data;
  try { data = await response.json(); } catch { throw new Error('Resposta inválida do servidor.'); }
  if (!response.ok) {
    if (response.status === 401 && path !== 'login') {
      setToken('');
      window.location.hash = '#/login';
    }
    throw new Error(data?.error || `Falha ${response.status}`);
  }
  return data;
}
