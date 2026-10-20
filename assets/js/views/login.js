import {$, escapeHTML} from '../utils.js';
export function render(onLogin) {
  $('#app').innerHTML = `<div class="login-page"><div class="login-side"><div class="login-brand">✦ taskflow<span>.</span></div>
    <div class="login-copy"><div class="login-orbit">✺</div><p class="eyebrow">PRODUTIVIDADE COM PROPÓSITO</p><h1>Boas ideias merecem<br><em>um plano.</em></h1><p>Reúna suas tarefas em um só lugar, acompanhe resultados e avance com clareza.</p><div class="login-feature">✓ Planeje &nbsp; ✓ Priorize &nbsp; ✓ Conquiste</div></div>
    <small>Projeto acadêmico • Universidade FUMEC</small></div>
    <div class="login-main"><div class="login-box"><div class="eyebrow">BEM-VINDO AO TASKFLOW</div><h2>Entre na sua conta</h2><p class="subtitle">Acesse seu espaço e continue de onde parou.</p>
      <form id="login-form"><label for="email">E-mail</label><input type="email" id="email" placeholder="seu@email.com" value="lucas@taskflow.local" required autocomplete="username" />
      <label for="password">Senha</label><input type="password" id="password" value="Demo@2026" required autocomplete="current-password" />
      <p class="form-error" id="auth-error" role="alert"></p><button type="submit" class="btn primary wide" id="submit">Entrar no TaskFlow →</button></form>
      <div class="demo-tip"><strong>Contas para demonstração</strong><p>Lucas (administrador): lucas@taskflow.local</p><p>Giovana (membro): giovana@taskflow.local</p><p>Senha para ambos: <code>Demo@2026</code></p></div>
    </div></div></div>`;
  $('#login-form').onsubmit = async e => {
    e.preventDefault();const btn=$('#submit');btn.disabled=true;btn.textContent='Entrando...';$('#auth-error').textContent='';
    try {await onLogin({email:$('#email').value.trim(),password:$('#password').value});}
    catch(err) {$('#auth-error').textContent=err.message;btn.disabled=false;btn.textContent='Entrar no TaskFlow →';}
  };
}
