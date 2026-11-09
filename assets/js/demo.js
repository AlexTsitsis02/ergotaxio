/* Static demonstration: filters run in this browser. No backend, uploads or outgoing email. */
(() => {
  'use strict';
  const root=new URL(document.body.dataset.demoBase||'./',location.href);
  const page=document.body.dataset.demoPage||'/';
  const normalise=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('el-GR').replaceAll('ς','σ');
  const toast=document.getElementById('demo-toast');let timer;
  function notify(message){if(!toast)return;toast.textContent=message;toast.hidden=false;clearTimeout(timer);timer=setTimeout(()=>toast.hidden=true,6500)}
  const rows=[...document.querySelectorAll('tr[data-demo-row]')];
  const filterForms=[...document.querySelectorAll('form.filters')];
  let demoData=null;
  const money=cents=>new Intl.NumberFormat('el-GR',{style:'currency',currency:'EUR'}).format(cents/100);
  function selectedFilters(){return new URLSearchParams(location.search)}
  function applyFilters(){
    const filters=selectedFilters();let visible=0;
    for(const row of rows){
      let show=true;
      for(const [key,value] of filters){
        if(!value||key==='page')continue;
        if(key==='q'){show=show&&normalise(row.textContent).includes(normalise(value));continue}
        if(key==='from'){show=show&&(!row.dataset.filterDate||row.dataset.filterDate>=value);continue}
        if(key==='to'){show=show&&(!row.dataset.filterDate||row.dataset.filterDate<=value);continue}
        const actual=row.getAttribute('data-filter-'+key);
        if(actual!==null)show=show&&actual===value;
      }
      const orderState=document.getElementById('order-filter')?.value;
      if(page==='/orders'&&orderState&&orderState!=='all')show=show&&row.dataset.orderState===orderState;
      row.hidden=!show;if(show)visible++;
    }
    for(const form of filterForms){for(const field of form.elements){if(field.name&&filters.has(field.name)&&field.type!=='checkbox')field.value=filters.get(field.name)}}
    for(const footer of document.querySelectorAll('.table-footer')){
      const label=footer.querySelector('span');if(label&&rows.length)label.textContent=`Εμφάνιση ${visible} από ${rows.length} εγγραφές`;
      const pagination=footer.querySelector('.pagination');if(pagination)pagination.hidden=true;
    }
    const table=document.querySelector('.table-scroll');
    if(table&&rows.length){let empty=table.nextElementSibling;if(!empty?.classList.contains('demo-empty')){empty=document.createElement('div');empty.className='demo-empty';empty.textContent='Δεν βρέθηκαν εγγραφές με αυτά τα φίλτρα.';table.after(empty)}empty.hidden=visible>0}
    if(page==='/work'&&demoData){
      const summary={cost_cents:0,certified_cents:0,outstanding_cents:0,paid_cents:0};
      for(const row of rows.filter(row=>!row.hidden)){const stats=demoData.contract_summaries[row.dataset.filterContract_id];if(stats)for(const key in summary)summary[key]+=stats[key]}
      [...document.querySelectorAll('.work-stats .finance-value')].forEach((label,i)=>label.textContent=money(Object.values(summary)[i]));
    }
    document.querySelectorAll('.category-chip').forEach(link=>{const url=new URL(link.href);link.classList.toggle('active',filters.get('category')===url.searchParams.get('category'))});
    document.querySelectorAll('.documents-panel .tabs a').forEach(link=>{const url=new URL(link.href);link.classList.toggle('active',(filters.get('status')||'')===(url.searchParams.get('status')||''))});
  }
  for(const form of document.querySelectorAll('form')){
    form.addEventListener('submit',event=>{
      event.preventDefault();event.stopImmediatePropagation();
      if(form.classList.contains('filters')){
        const params=new URLSearchParams();for(const [name,value] of new FormData(form))if(typeof value==='string'&&value)params.set(name,value);
        history.replaceState(null,'',location.pathname+(params.size?'?'+params.toString():''));applyFilters();return;
      }
      const action=form.dataset.demoAction||'';
      const message=action.endsWith('/send')||action.includes('/smtp')?'Επίδειξη: δεν αποστέλλονται email και δεν αποθηκεύονται στοιχεία SMTP.':'Επίδειξη: η φόρμα παρουσιάζει τη ροή εργασίας. Δεν αποθηκεύονται στοιχεία ή αρχεία σε server.';
      notify(message);
      const button=form.querySelector('button[type="submit"]');if(button)button.disabled=false;
    },true);
  }
  document.querySelectorAll('input[type=password]').forEach(input=>{input.disabled=true;input.value=''});
  document.querySelectorAll('a[href*="parastatika-demo.csv"]').forEach(link=>link.addEventListener('click',event=>{
    if(!demoData)return;event.preventDefault();
    const selected=new Set(rows.filter(row=>!row.hidden).map(row=>Number(row.dataset.filterDocument_id)));
    const docs=demoData.documents.filter(d=>!rows.length||selected.has(d.id));
    const find=(table,id)=>table.find(item=>item.id===id);
    const values=[['Αριθμός','Προμηθευτής','Έργο','Τύπος','Ποσό EUR','Ημερομηνία','Παραλήπτης','Κατάσταση'],...docs.map(d=>[d.number,find(demoData.suppliers,d.supplier_id).name,find(demoData.projects,d.project_id).name,d.type,d.amount??'',d.received_at.slice(0,10).split('-').reverse().join('/'),d.recipient,d.status])];
    const csv='\ufeff'+values.map(row=>row.map(value=>'"'+String(value).replaceAll('"','""')+'"').join(';')).join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const download=document.createElement('a');download.href=url;download.download='parastatika-demo.csv';download.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }));
  const orderFilter=document.getElementById('order-filter');if(orderFilter)orderFilter.addEventListener('change',()=>{applyFilters();const oldEmpty=document.getElementById('order-empty');if(oldEmpty)oldEmpty.hidden=true});
  document.querySelectorAll('.category-chip,.documents-panel .tabs a').forEach(link=>link.addEventListener('click',event=>{
    event.preventDefault();const target=new URL(link.href);const params=selectedFilters();
    const key=link.classList.contains('category-chip')?'category':'status';
    if(target.searchParams.has(key))params.set(key,target.searchParams.get(key));else params.delete(key);
    params.delete('page');history.pushState(null,'',location.pathname+(params.size?'?'+params.toString():''));applyFilters();
  }));
  window.addEventListener('popstate',applyFilters);
  applyFilters();
  fetch(new URL('assets/demo-data.json',root)).then(response=>{if(!response.ok)throw new Error('Demo data');return response.json()}).then(data=>{demoData=data;applyFilters()}).catch(()=>notify('Η πλοήγηση λειτουργεί. Κάνε ανανέωση για να φορτωθούν και τα δεδομένα εξαγωγής.'));
})();
