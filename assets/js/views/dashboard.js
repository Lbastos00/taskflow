import {api} from '../api.js';
import {$, escapeHTML, pageTitle, label, statusClass, priorityClass, dateBR} from '../utils.js';
export async function render({user}) {
  const tasks=await api('tasks');
  const count = status => tasks.filter(task=>task.status===status).length;
  const completed=count('Concluída');const open=count('Não iniciada');const running=count('Em andamento');
  const percent=tasks.length?Math.round(completed/tasks.length*100):0;
  const thisWeek=tasks.filter(t=>t.deadline && t.status!=='Concluída').sort((a,b)=>a.deadline.localeCompare(b.deadline)).slice(0,5);
  $('#screen').innerHTML = `${pageTitle('Olá, '+user.name.split(' ')[0]+' 👋','Aqui está um resumo do andamento da sua equipe.','<a class="btn primary" href="#/tarefas/nova">+ Nova tarefa</a>')}
  <section class="stats-grid" aria-label="Resumo das tarefas">
    <div class="stat-card"><div class="stat-icon lavender">▣</div><span>Total de tarefas</span><strong>${tasks.length}</strong><small>Todas as atividades</small></div>
    <div class="stat-card"><div class="stat-icon amber">◷</div><span>Não iniciadas</span><strong>${open}</strong><small>Aguardando início</small></div>
    <div class="stat-card"><div class="stat-icon blue">↗</div><span>Em andamento</span><strong>${running}</strong><small>Em execução</small></div>
    <div class="stat-card"><div class="stat-icon green">✓</div><span>Concluídas</span><strong>${completed}</strong><small>Finalizadas</small></div>
  </section>
  <div class="dash-grid"><section class="panel progress-panel"><div class="panel-heading"><div><h2>Progresso geral</h2><p>Percentual de tarefas concluídas</p></div><span class="tiny-icon">◉</span></div>
    <div class="progress-body"><div class="progress-ring" style="--percentage:${percent}"><div><strong>${percent}%</strong><small>Concluído</small></div></div>
    <div class="legend"><div><i class="dot complete"></i> Concluídas <b>${completed}</b></div><div><i class="dot running"></i> Em andamento <b>${running}</b></div><div><i class="dot waiting"></i> Não iniciadas <b>${open}</b></div></div></div></section>
    <section class="panel priorities"><div class="panel-heading"><div><h2>Por prioridade</h2><p>Distribuição das atividades</p></div></div>
      ${['Alta','Média','Baixa'].map(level=>{const n=tasks.filter(t=>t.priority===level).length;return `<div class="priority-item"><div><span>${label(level,priorityClass(level))}</span><strong>${n}</strong></div><div class="bar"><div style="width:${tasks.length?100*n/tasks.length:0}%;" class="bar-fill ${priorityClass(level)}"></div></div></div>`}).join('')}
    </section></div>
  <section class="panel next-tasks"><div class="panel-heading"><div><h2>Próximas entregas</h2><p>Atividades abertas com prazo definido</p></div><a href="#/tarefas">Ver todas →</a></div>
  ${thisWeek.length ? `<div class="compact-list">${thisWeek.map(t=>`<a class="compact-task" href="#/tarefas/${t.id}"><div class="task-monogram">${escapeHTML(t.title[0])}</div><div><strong>${escapeHTML(t.title)}</strong><small>${escapeHTML(t.owner_name)}</small></div>${label(t.status,statusClass(t.status))}<time>${dateBR(t.deadline)}</time></a>`).join('')}</div>`:'<p class="empty">Nenhuma atividade pendente com data definida.</p>'}</section>`;
}
