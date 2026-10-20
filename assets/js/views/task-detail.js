import {api} from '../api.js';
import {$, escapeHTML, pageTitle, label, statusClass, priorityClass, dateBR, notify} from '../utils.js';
export async function render({user,params}) {
  const task=await api(`tasks/${params.id}`);
  const editable=user.role==='admin'||user.id===task.owner_id;
  $('#screen').innerHTML=`<div class="back-link"><a href="#/tarefas">← Voltar para tarefas</a></div>
  ${pageTitle(task.title,'Detalhes da atividade selecionada.',editable?`<a href="#/tarefas/${task.id}/editar" class="btn primary">✎ Editar tarefa</a>`:'')}
  <section class="panel detail-panel"><div class="panel-heading"><div><h2>Informações da tarefa</h2><p>Código #${task.id}</p></div>${label(task.status,statusClass(task.status))}</div>
  <div class="detail-grid"><div><small>RESPONSÁVEL</small><strong>${escapeHTML(task.owner_name)}</strong></div><div><small>PRIORIDADE</small>${label(task.priority,priorityClass(task.priority))}</div><div><small>PRAZO DE ENTREGA</small><strong>${dateBR(task.deadline)}</strong></div><div><small>DATA DE CADASTRO</small><strong>${new Date(task.created_at).toLocaleDateString('pt-BR')}</strong></div></div>
  <div class="detail-description"><h3>Descrição</h3><p>${escapeHTML(task.description||'Nenhuma descrição informada.')}</p></div>
  ${editable?'<div class="detail-bottom"><button id="delete-task" class="btn danger">Excluir tarefa</button></div>':''}</section>`;
  if(editable) $('#delete-task').onclick=async()=>{
    if(!confirm('Excluir esta tarefa permanentemente?')) return;
    try {await api(`tasks/${task.id}`,{method:'DELETE'});notify('Tarefa excluída.');location.hash='#/tarefas';}
    catch(err) {notify(err.message,true);}
  };
}
