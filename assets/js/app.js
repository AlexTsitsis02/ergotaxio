document.querySelector('[data-toggle-nav]')?.addEventListener('click',()=>document.body.classList.toggle('nav-open'));
document.querySelector('[data-close-nav]')?.addEventListener('click',()=>document.body.classList.remove('nav-open'));
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.body.classList.remove('nav-open')});
document.querySelectorAll('[data-dismiss]').forEach(button=>button.addEventListener('click',()=>button.closest('.flash').remove()));
document.querySelectorAll('[data-open-dialog]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.openDialog).showModal()));
document.querySelectorAll('[data-close-dialog]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
const rowChecks=[...document.querySelectorAll('[data-row-check]')],allCheck=document.querySelector('[data-select-all]');
function updateSelection(){const count=rowChecks.filter(c=>c.checked).length;const bar=document.getElementById('bulk-bar');if(bar)bar.hidden=count===0;document.querySelectorAll('[data-selection-count]').forEach(el=>el.textContent=count);if(allCheck){allCheck.checked=count===rowChecks.length&&count>0;allCheck.indeterminate=count>0&&count<rowChecks.length}}
allCheck?.addEventListener('change',()=>{rowChecks.forEach(c=>c.checked=allCheck.checked);updateSelection()});
rowChecks.forEach(c=>c.addEventListener('change',updateSelection));
document.querySelector('[data-file-preview]')?.addEventListener('change',e=>{const file=e.target.files[0],zone=e.target.closest('.upload-zone');zone.classList.toggle('has-file',!!file);zone.querySelector('[data-upload-label]').textContent=file?file.name:'Πάτησε για φωτογραφία ή ανέβασμα';if(file&&file.size>10*1024*1024){e.target.value='';zone.classList.remove('has-file');zone.querySelector('[data-upload-label]').textContent='Το αρχείο υπερβαίνει τα 10 MB. Επίλεξε μικρότερο.'}});
const orderSelect=document.getElementById('receipt-order');
function fillOrder(){const option=orderSelect?.selectedOptions[0];if(!option?.value)return;document.getElementById('receipt-project').value=option.dataset.project;document.getElementById('receipt-supplier').value=option.dataset.supplier;document.getElementById('receipt-material').value=option.dataset.material;document.getElementById('receipt-expected').value=option.dataset.quantity;document.getElementById('receipt-received').value=option.dataset.quantity;document.getElementById('receipt-unit').value=option.dataset.unit}
orderSelect?.addEventListener('change',fillOrder);
if(orderSelect){const id=new URLSearchParams(location.search).get('order');if(id&&!orderSelect.value){orderSelect.value=id;fillOrder()}}
document.getElementById('order-filter')?.addEventListener('change',e=>{let visible=0;document.querySelectorAll('[data-order-state]').forEach(row=>{row.hidden=e.target.value!=='all'&&row.dataset.orderState!==e.target.value;if(!row.hidden)visible++});document.getElementById('order-empty').hidden=visible!==0});
const certChecks=[...document.querySelectorAll('[data-cert-cents]')];
function updateCertificateTotal(){const total=certChecks.reduce((sum,input)=>sum+(input.checked?Number(input.dataset.certCents):0),0);const label=document.querySelector('[data-cert-total]');if(label)label.textContent=new Intl.NumberFormat('el-GR',{style:'currency',currency:'EUR'}).format(total/100)}
certChecks.forEach(input=>input.addEventListener('change',updateCertificateTotal));updateCertificateTotal();
const workQuantity=document.querySelector('[data-work-quantity]'),workPrice=document.querySelector('[data-work-price]'),workTotal=document.querySelector('[data-work-total]');
function updateWorkTotal(){if(!workTotal)return;const calculated=!!workQuantity.value||!!workPrice.value;workTotal.readOnly=calculated;workTotal.required=!calculated;workTotal.placeholder=calculated?'Υπολογίζεται κατά την αποθήκευση':'Καταχώρισε συνολικό κόστος';if(calculated)workTotal.value=''}
workQuantity?.addEventListener('input',updateWorkTotal);workPrice?.addEventListener('input',updateWorkTotal);updateWorkTotal();
const paymentKind=document.querySelector('[data-payment-kind]'),paymentStatus=document.querySelector('[data-payment-status]');
function updatePaymentFields(){const cert=document.querySelector('[data-payment-cert]'),date=document.querySelector('[data-payment-date]');if(!cert||!date)return;cert.disabled=paymentKind.value==='Προκαταβολή';if(cert.disabled)cert.value='';date.required=paymentStatus.value==='Ολοκληρώθηκε';date.disabled=!date.required;if(date.disabled)date.value=''}
paymentKind?.addEventListener('change',updatePaymentFields);paymentStatus?.addEventListener('change',updatePaymentFields);updatePaymentFields();
document.querySelectorAll('input[type=file]').forEach(input=>input.addEventListener('change',()=>document.querySelectorAll('input[type=file]').forEach(el=>el.setCustomValidity(''))));
