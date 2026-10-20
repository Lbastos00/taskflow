import {api} from '../api.js';
import {$, escapeHTML, pageTitle, notify} from '../utils.js';
export async function render({user,params}) {
  const editing=!!params.id;
  const [users,task]=await Promise.all([api('users'),editing?api(`tasks/${params.id}`):Promise.resolve(null)]);
  if(editing && user.role!=='admin' && task.owner_id!==user.id){$('#screen').innerHTML='<section class="panel"><h2>Sem permissão</h2><p>Somente o responsável e o administrador podem alterar esta tarefa.</p><a href="#/tarefas" class="btn ghost">Voltar</a></section>';return;}
  const selected=task?.owner_id||user.id;
  $('#screen').innerHTML = `${pageTitle(editing?'Editar tarefa':'Nova tarefa',editing?'Atualize as informações da atividade.':'Preencha os dados abaixo para cadastrar sua tarefa.')}
    <section class="panel form-panel"><form id="task-form"><div class="form-grid">
      <div class="field full"><label for="title">Título da tarefa *</label><input id="title" name="title" maxlength="120" minlength="3" required placeholder="Ex.: Criar tela de dashboard" value="${escapeHTML(task?.title||'')}"/></div>
      <div class="field full"><label for="description">Descrição</label><textarea id="description" name="description" rows="4" maxlength="2000" placeholder="Explique o que será realizado...">${escapeHTML(task?.description||'')}</textarea></div>
      <div class="field"><label for="status">Situação</label><select id="status" name="status">${['Não iniciada','Em andamento','Concluída'].map(s=>`<option ${task?.status===s?'selected':''}>${s}</option>`).join('')}</select></div>
      <div class="field"><label for="priority">Prioridade</label><select id="priority" name="priority">${['Baixa','Média','Alta'].map(s=>`<option ${task?.priority===s||(!editing && s==='Média')?'selected':''}>${s}</option>`).join('')}</select></div>
      <div class="field"><label for="owner_id">Responsável</label><select id="owner_id" name="owner_id" ${user.role!=='admin'?'disabled':''}>${users.filter(u=>user.role==='admin'||u.id===user.id).map(u=>`<option value="${u.id}" ${u.id===selected?'selected':''}>${escapeHTML(u.name)}</option>`).join('')}</select></div>
      <div class="field"><label for="deadline">Prazo</label><input id="deadline" name="deadline" type="date" value="${escapeHTML(task?.deadline||'')}" /></div></div>
      <p class="form-error" id="form-error" role="alert"></p><div class="form-actions"><a class="btn ghost" href="${editing?'#/tarefas/'+params.id:'#/tarefas'}">Cancelar</a><button class="btn primary" type="submit" id="save">${editing?'Salvar alterações':'Cadastrar tarefa'} →</button></div>
    </form></section>`;
  $('#task-form').onsubmit=async e=>{
    e.preventDefault();const b=$('#save');b.disabled=true;$('#form-error').textContent='';
    const payload={title:$('#title').value,description:$('#description').value,status:$('#status').value,priority:$('#priority').value,owner_id:Number($('#owner_id').value),deadline:$('#deadline').value};
    try {const result=await api(editing?`tasks/${params.id}`:'tasks',{method:editing?'PUT':'POST',body:payload});notify(editing?'Tarefa atualizada.':'Tarefa cadastrada.');location.hash=`#/tarefas/${result.id}`;}
    catch(err) {$('#form-error').textContent=err.message;b.disabled=false;}
  };
}
