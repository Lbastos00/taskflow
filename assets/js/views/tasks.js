import {api} from '../api.js';
import {$, escapeHTML, pageTitle, label, statusClass, priorityClass, dateBR} from '../utils.js';
export async function render({user}) {
  const tasks=await api('tasks');
  $('#screen').innerHTML = `${pageTitle('Gerenciar tarefas','Acompanhe, organize e encontre as atividades da equipe.','<a href="#/tarefas/nova" class="btn primary">+ Nova tarefa</a>')}
  <section class="panel list-panel"><div class="filter-bar"><input id="search" type="search" placeholder="⌕  Buscar tarefa..." aria-label="Buscar tarefa por título" />
   <select id="filter-status" aria-label="Filtrar por situação"><option value="">Todas as situações</option><option>Não iniciada</option><option>Em andamento</option><option>Concluída</option></select>
   <select id="filter-priority" aria-label="Filtrar por prioridade"><option value="">Todas as prioridades</option><option>Baixa</option><option>Média</option><option>Alta</option></select></div>
   <div class="table-scroll"><table><thead><tr><th>TAREFA</th><th>RESPONSÁVEL</th><th>PRIORIDADE</th><th>SITUAÇÃO</th><th>PRAZO</th><th></th></tr></thead><tbody id="task-results"></tbody></table></div><div class="list-count" id="count"></div></section>`;
  const update=()=>{
    const search=$('#search').value.toLocaleLowerCase('pt-BR'), status=$('#filter-status').value, priority=$('#filter-priority').value;
    const filtered=tasks.filter(t=>(t.title+' '+t.description+' '+t.owner_name).toLocaleLowerCase('pt-BR').includes(search)&&(!status||t.status===status)&&(!priority||t.priority===priority));
    $('#task-results').innerHTML=filtered.length?filtered.map(t=>`<tr><td><a class="task-title" href="#/tarefas/${t.id}">${escapeHTML(t.title)}</a><span class="task-description">${escapeHTML(t.description||'Sem descrição')}</span></td><td>${escapeHTML(t.owner_name)}</td><td>${label(t.priority,priorityClass(t.priority))}</td><td>${label(t.status,statusClass(t.status))}</td><td>${dateBR(t.deadline)}</td><td><a href="#/tarefas/${t.id}" class="chevron" aria-label="Abrir ${escapeHTML(t.title)}">→</a></td></tr>`).join(''):'<tr><td colspan="6" class="empty">Nenhuma tarefa encontrada.</td></tr>';
    $('#count').textContent=`Exibindo ${filtered.length} de ${tasks.length} tarefas`;
  };
  ['#search','#filter-status','#filter-priority'].forEach(sel=>$(sel).addEventListener('input',update));update();
}
