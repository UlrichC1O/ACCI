/* =========================================================================
   ACCI — CRM complet · 100 sections
   Association des Créateurs de Contenu Ivoiriens
   Piliers : Sensibiliser · Former · Protéger · Plaider
   ========================================================================= */
(function(){
"use strict";

/* =========================== CONSTANTES ================================= */
var CUSTOMER_STATUSES=["Lead","Actif","Inactif"];
var CUSTOMER_TYPES=["Entreprise","Individuel"];
var CATEGORIES=["Éducation","Humour & divertissement","Mode & lifestyle","Cuisine","Sport & santé","Entrepreneuriat","Culture & société","Technologie","Actualité & médias","Autre"];
var TICKET_PRIORITIES=["Faible","Moyen","Élevé","Urgent"];
var TICKET_STATUSES=["Ouvert","En cours","En attente","Résolu","Fermé"];
var DEAL_STAGES=["Nouveau","Qualifié","Proposition","Négociation","Gagné","Perdu"];
var DEAL_PROBS={Nouveau:10,"Qualifié":25,Proposition:50,"Négociation":75,"Gagné":100,Perdu:0};
var INVOICE_TYPES=["Devis","Facture"];
var INVOICE_STATUSES=["Brouillon","Envoyé","Payé","En retard","Annulé"];
var PROJECT_STATUSES=["Planifié","En cours","En pause","Terminé","Annulé"];
var TASK_STATUSES=["À faire","En cours","En revue","Terminé"];
var TASK_PRIORITIES=["Basse","Moyenne","Haute","Critique"];
var CAMPAIGN_STATUSES=["Brouillon","Planifié","En cours","Terminé","Annulé"];
var LEAVE_TYPES=["Congé payé","Maladie","Personnel","Formation","Autre"];
var LEAVE_STATUSES=["En attente","Approuvé","Rejeté"];
var CONTRACT_STATUSES=["Brouillon","Envoyé","Signé","Expiré","Annulé"];
var PAL=["#F77F00","#0B7A3B","#0B3D2E","#E16500","#1b6ec2","#c87f0a","#7c3aed","#2d9cdb","#27ae60","#e74c3c","#8e44ad","#0d9488"];

/* =========================== OUTILS ===================================== */
var $=function(s,r){return(r||document).querySelector(s);};
var $$=function(s,r){return[].slice.call((r||document).querySelectorAll(s));};
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function uid(){return"x"+Date.now().toString(36)+"_"+Math.floor(Math.random()*1e6).toString(36);}
function norm(s){return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");}
function todayISO(){return new Date().toISOString().slice(0,10);}
function fmtDate(d){if(!d)return"\u2014";var x=new Date(d);if(isNaN(x))return d;return x.toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"});}
function fmtMoney(a){return(Number(a)||0).toLocaleString("fr-FR")+" "+(localStorage.getItem("acci_currency")||"FCFA");}
function hash(s){var h=5381,i=s.length;while(i)h=(h*33)^s.charCodeAt(--i);return(h>>>0).toString(16);}
function slug(s){return norm(s).replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}
function optH(arr,v){return arr.map(function(o){return"<option"+(o===v?" selected":"")+">"+o+"</option>";}).join("");}
function custOpt(sel){return'<option value="">\u2014 Choisir \u2014</option>'+S.customers.all().map(function(c){return'<option value="'+c.id+'"'+(c.id===sel?" selected":"")+'>'+esc(c.name)+'</option>';}).join("");}
function pctBar(val,max,color){var p=max?Math.round(val/max*100):0;return'<span class="cb__track"><span class="cb__fill" style="width:'+p+'%;background:'+(color||PAL[0])+'"></span></span>';}

/* =========================== APPROVAL CODE ============================== */
function genCode(){
  var L="ABCDEFGHIJKLMNOPQRSTUVWXYZ",code="";
  for(var i=0;i<5;i++)code+=L[Math.floor(Math.random()*26)];
  for(var i=0;i<3;i++)code+=Math.floor(Math.random()*10);
  return code;
}

/* =========================== STORE FACTORY ============================== */
function Store(key){
  return{
    all:function(){try{return JSON.parse(localStorage.getItem(key))||[];}catch(e){return[];}},
    save:function(a){localStorage.setItem(key,JSON.stringify(a));},
    get:function(id){return this.all().find(function(x){return x.id===id;});},
    add:function(r){r.id=r.id||uid();r.createdAt=r.createdAt||new Date().toISOString();var a=this.all();a.unshift(r);this.save(a);return r;},
    update:function(r){this.save(this.all().map(function(x){return x.id===r.id?r:x;}));},
    remove:function(id){this.save(this.all().filter(function(x){return x.id!==id;}));},
    count:function(){return this.all().length;},
    where:function(fn){return this.all().filter(fn);}
  };
}

/* All stores */
var S={
  admins:Store("acci_admins"),
  customers:Store("acci_customers"),contacts:Store("acci_contacts"),tickets:Store("acci_tickets"),
  deals:Store("acci_deals"),invoices:Store("acci_invoices"),services:Store("acci_services"),
  inbox:Store("acci_inbox"),audit:Store("acci_audit"),
  segments:Store("acci_segments"),loyalty:Store("acci_loyalty"),satisfaction:Store("acci_satisfaction"),
  custDocs:Store("acci_cust_docs"),contactGroups:Store("acci_contact_groups"),
  ticketTemplates:Store("acci_ticket_tpl"),kb:Store("acci_kb"),faq:Store("acci_faq"),
  surveys:Store("acci_surveys"),salesGoals:Store("acci_sales_goals"),salesActivities:Store("acci_sales_acts"),
  invTemplates:Store("acci_inv_tpl"),payments:Store("acci_payments"),expenses:Store("acci_expenses"),
  creditNotes:Store("acci_credit_notes"),recurring:Store("acci_recurring"),
  campaigns:Store("acci_campaigns"),emailTpl:Store("acci_email_tpl"),subscribers:Store("acci_subscribers"),
  socialPosts:Store("acci_social"),landingPages:Store("acci_landing"),
  projects:Store("acci_projects"),tasks:Store("acci_tasks"),timelogs:Store("acci_timelogs"),
  milestones:Store("acci_milestones"),projectTpl:Store("acci_proj_tpl"),
  emails:Store("acci_emails"),sms:Store("acci_sms"),calls:Store("acci_calls"),
  meetings:Store("acci_meetings"),announcements:Store("acci_announcements"),messages:Store("acci_messages"),
  teamMembers:Store("acci_team"),performance:Store("acci_perf"),attendance:Store("acci_attendance"),
  leaves:Store("acci_leaves"),trainings:Store("acci_trainings"),certifications:Store("acci_certifs"),
  docLib:Store("acci_doc_lib"),docTpl:Store("acci_doc_tpl"),contracts:Store("acci_contracts"),
  signatures:Store("acci_signatures"),shares:Store("acci_shares"),
  notes:Store("acci_notes"),reminders:Store("acci_reminders"),favorites:Store("acci_favorites"),
  notifications:Store("acci_notifs"),
  onboarding:Store("acci_onboarding"),healthScores:Store("acci_health"),renewals:Store("acci_renewals"),
  custGoals:Store("acci_cust_goals"),
  roles:Store("acci_roles"),customFields:Store("acci_custom_fields"),workflows:Store("acci_workflows")
};

function alog(entity,id,action,detail){
  var e=S.audit.all();e.unshift({id:uid(),entity:entity,entityId:id,action:action,detail:detail||"",createdAt:new Date().toISOString()});
  if(e.length>500)e=e.slice(0,500);S.audit.save(e);
}

/* =========================== STATE ====================================== */
var state={view:"dashboard",sub:{},query:"",cFSt:"",cFCat:"",cSort:"createdAt",cDir:-1,cSel:{},tFSt:"",tFPr:"",iFTy:"",iFSt:""};

/* =========================== ADMIN HELPERS =============================== */
var SUPER_USER="ogou";
function currentAdmin(){try{return JSON.parse(sessionStorage.getItem("acci_admin"));}catch(e){return null;}}
function isSuperAdmin(){var a=currentAdmin();return a&&a.role==="super_admin";}
function canAccess(mod){var a=currentAdmin();if(!a)return false;if(a.role==="super_admin")return true;if(!a.allowedModules)return false;return a.allowedModules.indexOf(mod)!==-1;}

/* All sidebar items definition */
var SIDEBAR_ITEMS=[
  {view:"dashboard",icon:"📊",label:"Tableau de bord"},
  {view:"customers",icon:"👥",label:"Membres & Partenaires"},
  {view:"contacts",icon:"📇",label:"Contacts"},
  {view:"tickets",icon:"🎫",label:"Demandes & Signalements"},
  {view:"pipeline",icon:"💰",label:"Adhésions & Pipeline"},
  {view:"invoices",icon:"📄",label:"Cotisations & Factures"},
  {view:"marketing",icon:"📣",label:"Sensibilisation"},
  {view:"projects",icon:"📁",label:"Projets & Initiatives"},
  {view:"comms",icon:"💬",label:"Communication"},
  {view:"team",icon:"👔",label:"Équipe ACCI"},
  {view:"docs",icon:"📎",label:"Documents & Chartes"},
  {view:"reports",icon:"📈",label:"Rapports"},
  {view:"productivity",icon:"⭐",label:"Productivité"},
  {view:"success",icon:"🤝",label:"Suivi Membres"},
  {sep:true},
  {view:"inbox",icon:"📥",label:"Réception",badge:"inbox-count"},
  {view:"data",icon:"↕",label:"Import / Export"},
  {view:"admin",icon:"🔧",label:"Administration"}
];
/* Module keys for permission checkboxes */
var ALL_MODULES=["dashboard","customers","contacts","tickets","pipeline","invoices","marketing","projects","comms","team","docs","reports","productivity","success","inbox","data","admin"];

function buildSidebar(){
  var adm=currentAdmin();if(!adm)return;
  var isSuper=adm.role==="super_admin";
  /* User info */
  $("#sidebar-user").innerHTML='<strong>'+esc(adm.name||adm.username)+'</strong><span class="su-role'+(isSuper?' su-role--super':'')+'">'+
    (isSuper?'👑 Super Admin':'🔧 Admin')+'</span>';
  /* Nav */
  var html="";
  SIDEBAR_ITEMS.forEach(function(item){
    if(item.sep){html+='<hr class="sidebar__sep">';return;}
    if(!isSuper&&!canAccess(item.view))return;
    html+='<button class="snav" data-view="'+item.view+'">'+item.icon+' '+item.label;
    if(item.badge)html+=' <span class="snav__badge" id="'+item.badge+'" hidden>0</span>';
    html+='</button>';
  });
  $("#snav").innerHTML=html;
}

/* =========================== AUTH ======================================= */
function initAuth(){
  var lEl=$("#login"),aEl=$("#app"),mEl=$("#member-app");

  /* Toggle admin / member */
  $$(".ltog").forEach(function(btn){
    btn.addEventListener("click",function(){
      var mode=btn.getAttribute("data-mode");
      $$(".ltog").forEach(function(b){b.classList.toggle("is-active",b===btn);});
      $("#admin-login").hidden=(mode!=="admin");
      $("#member-login").hidden=(mode!=="member");
    });
  });

  /* Member login */
  $("#member-form").addEventListener("submit",function(e){
    e.preventDefault();
    var code=$("#member-code").value.trim().toUpperCase();
    var err=$("#member-err");
    if(code.length!==8){err.textContent="Le code doit contenir 8 caractères (5 lettres + 3 chiffres).";err.hidden=false;return;}
    var member=S.customers.all().find(function(c){return c.approved===true&&c.approvalCode===code;});
    if(!member){err.textContent="Code invalide ou accès non approuvé.";err.hidden=false;return;}
    err.hidden=true;
    lEl.hidden=true;aEl.hidden=true;mEl.hidden=false;
    renderMemberPortal(member);
  });

  /* Member logout */
  $("#m-logout").addEventListener("click",function(){
    mEl.hidden=true;lEl.hidden=false;
    $("#member-code").value="";
  });

  /* Ensure ogou super-admin always exists with correct credentials */
  var ogouExists=S.admins.all().some(function(a){return a.username===SUPER_USER;});
  if(!ogouExists){
    S.admins.add({id:"adm_super",username:SUPER_USER,name:"Ogou",passHash:hash("NEWcomm"),role:"super_admin",approved:true,approvalCode:"",allowedModules:["*"],createdAt:new Date().toISOString()});
  }

  /* Resume session */
  if(currentAdmin()){show();return;}

  var hint=$("#login-hint");if(hint){hint.textContent="Demandez vos identifiants à l'administrateur ogou.";hint.hidden=false;}

  /* Admin login form */
  $("#login-form").addEventListener("submit",function(e){
    e.preventDefault();
    var err=$("#login-err");
    var usr=$("#login-user").value.trim().toLowerCase();
    var pw=$("#login-pass").value.trim();

    var admin=S.admins.all().find(function(a){return a.username===usr;});
    if(!admin){err.textContent="Utilisateur introuvable.";err.hidden=false;return;}
    if(!admin.approved){err.textContent="Compte non approuvé. Contactez ogou.";err.hidden=false;return;}
    if(admin.passHash!==hash(pw)){err.textContent="Mot de passe incorrect.";err.hidden=false;return;}
    err.hidden=true;
    sessionStorage.setItem("acci_admin",JSON.stringify(admin));
    show();
  });

  function show(){lEl.hidden=true;aEl.hidden=false;mEl.hidden=true;migrate();seedAll();boot();}
}

/* =========================== MEMBER PORTAL ============================== */
function renderMemberPortal(member){
  $("#m-name").textContent=member.name;
  var tks=S.tickets.where(function(t){return t.customerId===member.id;});
  var invs=S.invoices.where(function(i){return i.customerId===member.id;});
  var svcs=S.services.all();
  var kbArticles=S.kb.all();
  var anns=S.announcements.all();
  var openT=tks.filter(function(t){return t.status==="Ouvert"||t.status==="En cours";}).length;
  var svcIcons=["🎓","⚖️","🏅","🔍","🤝","💰","🚨","💚","✅"];

  var html='';

  /* Welcome banner — improved typography */
  html+='<div class="member-welcome">';
  html+='<h1>Bienvenue, '+esc(member.name)+'</h1>';
  html+='<p>Votre espace personnel au sein de l\'<strong>Association des Créateurs de Contenu Ivoiriens</strong>.<br>';
  html+='Ensemble pour un usage <strong>responsable, sûr et éthique</strong> des réseaux sociaux.</p>';
  html+='<div class="member-code-display"><span class="member-code-label">Code d\'approbation</span> <strong>'+esc(member.approvalCode)+'</strong></div>';
  html+='</div>';

  /* KPI cards */
  html+='<div class="kpis" style="margin-bottom:28px">';
  html+='<div class="kpi"><span class="kpi__icon kpi__icon--info">🎫</span><span class="kpi__val">'+tks.length+'</span><span class="kpi__label">Demandes ACCI</span></div>';
  html+='<div class="kpi"><span class="kpi__icon kpi__icon--warn">⏳</span><span class="kpi__val">'+openT+'</span><span class="kpi__label">En cours</span></div>';
  html+='<div class="kpi"><span class="kpi__icon kpi__icon--ok">📄</span><span class="kpi__val">'+invs.length+'</span><span class="kpi__label">Factures</span></div>';
  html+='<div class="kpi"><span class="kpi__icon kpi__icon--'+(member.charter?"ok":"danger")+'">📜</span><span class="kpi__val">'+(member.charter?"Signée":"Non signée")+'</span><span class="kpi__label">Charte ACCI</span></div>';
  html+='</div>';

  /* Services catalog — card grid */
  html+='<div class="member-section"><h2>🛡️ Services ACCI <span>· Sensibiliser · Former · Protéger · Plaider</span></h2>';
  html+='<div class="member-services">';
  svcs.forEach(function(s,i){
    html+='<div class="member-svc"><div class="member-svc__icon">'+(svcIcons[i]||"⚙️")+'</div>';
    html+='<h3>'+esc(s.name)+'</h3>';
    html+=(s.defaultPrice>0?'<div class="member-svc__price">'+fmtMoney(s.defaultPrice)+'</div>':'<div class="member-svc__free">✓ Gratuit</div>');
    html+='</div>';
  });
  html+='</div></div>';

  /* Tickets */
  html+='<div class="member-section"><h2>🎫 Mes demandes & signalements <span>('+tks.length+')</span></h2>';
  if(tks.length){
    html+='<div class="member-panel"><div class="dtable"><table><thead><tr><th>Titre</th><th>Priorité</th><th>Statut</th><th>Date</th></tr></thead><tbody>';
    tks.forEach(function(t){html+='<tr><td><b>'+esc(t.title)+'</b></td><td>'+badge(t.priority)+'</td><td>'+badge(t.status)+'</td><td class="muted">'+fmtDate(t.createdAt)+'</td></tr>';});
    html+='</tbody></table></div></div>';
  }else{
    html+='<div class="member-panel"><p class="muted">Aucune demande en cours. Contactez l\'ACCI pour signaler un abus ou demander un accompagnement.</p></div>';
  }
  html+='</div>';

  /* Invoices */
  html+='<div class="member-section"><h2>📄 Mes cotisations & factures <span>('+invs.length+')</span></h2>';
  if(invs.length){
    html+='<div class="member-panel"><div class="dtable"><table><thead><tr><th>N°</th><th>Type</th><th>Total</th><th>Statut</th><th>Date</th></tr></thead><tbody>';
    invs.forEach(function(i){html+='<tr><td>'+esc(i.number)+'</td><td>'+badge(i.type)+'</td><td><b>'+fmtMoney(i.total)+'</b></td><td>'+badge(i.status)+'</td><td class="muted">'+fmtDate(i.issueDate)+'</td></tr>';});
    html+='</tbody></table></div></div>';
  }else{
    html+='<div class="member-panel"><p class="muted">Aucune facture. Vos cotisations et paiements apparaîtront ici.</p></div>';
  }
  html+='</div>';

  /* Knowledge base */
  html+='<div class="member-section"><h2>📚 Ressources & Base de connaissances</h2>';
  if(kbArticles.length){
    kbArticles.forEach(function(a){
      html+='<div class="member-panel"><h3>'+esc(a.title)+'</h3><p style="font-size:14px;line-height:1.7;color:var(--body);margin-top:6px">'+esc(a.content)+'</p></div>';
    });
  }else{
    html+='<div class="member-panel"><p class="muted">Aucun article disponible.</p></div>';
  }
  html+='</div>';

  /* Announcements */
  html+='<div class="member-section"><h2>📢 Annonces ACCI</h2>';
  if(anns.length){
    anns.forEach(function(a){
      html+='<div class="member-panel" style="border-left:4px solid var(--orange)"><h3>'+esc(a.title)+'</h3><p style="font-size:14px;line-height:1.7;color:var(--body);margin-top:4px">'+esc(a.content)+'</p><span class="muted" style="font-size:12px">'+fmtDate(a.createdAt)+'</span></div>';
    });
  }else{
    html+='<div class="member-panel"><p class="muted">Aucune annonce pour le moment.</p></div>';
  }
  html+='</div>';

  html+='<div class="member-footer">ACCI — Sensibiliser · Former · Protéger · Plaider</div>';

  $("#member-view").innerHTML=html;
}

/* =========================== MIGRATION ================================== */
function migrate(){
  var old=localStorage.getItem("acci_crm_members");
  if(old&&S.customers.count()===0){
    try{var m=JSON.parse(old);m.forEach(function(x){S.customers.add({id:x.id,type:"Individuel",name:x.name,company:"",email:x.email||"",phone:x.phone||"",address:"",city:x.city||"",country:"Côte d'Ivoire",tags:x.category?[x.category]:[],status:x.status==="Actif"?"Actif":x.status==="Inactif"?"Inactif":"Lead",notes:x.notes||"",charter:x.charter||false,social:x.social||"",approved:false,approvalCode:"",approvedAt:"",createdAt:x.createdAt,updatedAt:x.updatedAt||todayISO()});});}catch(e){}
  }
  var oldIn=localStorage.getItem("acci_crm_inbox");
  if(oldIn&&S.inbox.count()===0){try{S.inbox.save(JSON.parse(oldIn));}catch(e){}}
}

/* =========================== SEED DATA ================================== */
function seedAll(){
  if(localStorage.getItem("acci_seeded_v4"))return;
  var N=Date.now();
  if(S.services.count()===0){
    [["Formation création de contenu",150000],["Accompagnement juridique",75000],["Certification créateur responsable",50000],["Audit de chaîne / page",100000],["Médiation de conflit",60000],["Atelier monétisation",120000],["Signalement d'abus",0],["Cellule d'écoute",0],["Vérification d'information",30000]].forEach(function(s){S.services.add({name:s[0],defaultPrice:s[1],active:true});});
  }
  if(S.customers.count()===0){
    var cs=[
      {id:"c1",type:"Individuel",name:"Awa Koné",company:"",email:"awa.kone@exemple.ci",phone:"+225 07 01 02 03",city:"Abidjan",country:"Côte d'Ivoire",tags:["Éducation"],status:"Actif",notes:"Créatrice éducative engagée dans la sensibilisation ACCI.",charter:true,approved:true,approvalCode:"FHBXZ294",approvedAt:new Date(N-86400000*30).toISOString()},
      {id:"c2",type:"Individuel",name:"Yao Brou",company:"",email:"yao.brou@exemple.ci",phone:"+225 05 11 22 33",city:"Bouaké",country:"Côte d'Ivoire",tags:["Humour & divertissement"],status:"Actif",charter:true,approved:true,approvalCode:"RXKMT847",approvedAt:new Date(N-86400000*25).toISOString()},
      {id:"c3",type:"Entreprise",name:"MediaPro CI",company:"MediaPro CI",email:"contact@mediapro.ci",phone:"+225 27 22 33 44",city:"Abidjan",country:"Côte d'Ivoire",tags:["Technologie"],status:"Actif",charter:false,approved:true,approvalCode:"GWPLN512",approvedAt:new Date(N-86400000*20).toISOString()},
      {id:"c4",type:"Individuel",name:"Fatou Diarra",company:"",email:"fatou.d@exemple.ci",phone:"+225 01 44 55 66",city:"Yamoussoukro",country:"Côte d'Ivoire",tags:["Cuisine"],status:"Lead",charter:false,approved:false,approvalCode:"",approvedAt:""},
      {id:"c5",type:"Individuel",name:"Koffi N'Guessan",company:"",email:"koffi.ng@exemple.ci",phone:"+225 07 77 88 99",city:"San-Pédro",country:"Côte d'Ivoire",tags:["Sport & santé"],status:"Actif",charter:true,approved:true,approvalCode:"TCVNQ683",approvedAt:new Date(N-86400000*15).toISOString()},
      {id:"c6",type:"Individuel",name:"Mariam Touré",company:"",email:"mariam.t@exemple.ci",phone:"+225 05 22 33 44",city:"Korhogo",country:"Côte d'Ivoire",tags:["Mode & lifestyle"],status:"Inactif",approved:false,approvalCode:"",approvedAt:""},
      {id:"c7",type:"Entreprise",name:"Djigui Productions",company:"Djigui Productions",email:"info@djigui.ci",phone:"+225 27 33 44 55",city:"Abidjan",country:"Côte d'Ivoire",tags:["Culture & société"],status:"Actif",charter:true,approved:true,approvalCode:"BQMZR159",approvedAt:new Date(N-86400000*10).toISOString()},
      {id:"c8",type:"Individuel",name:"Sékou Ouattara",company:"",email:"sekou.o@exemple.ci",phone:"+225 07 55 66 77",city:"Abidjan",country:"Côte d'Ivoire",tags:["Actualité & médias"],status:"Actif",charter:true,approved:true,approvalCode:"DVXJY471",approvedAt:new Date(N-86400000*8).toISOString()},
      {id:"c9",type:"Individuel",name:"Aminata Coulibaly",company:"",email:"aminata.c@exemple.ci",phone:"+225 01 88 99 00",city:"Daloa",country:"Côte d'Ivoire",tags:["Entrepreneuriat"],status:"Lead",approved:false,approvalCode:"",approvedAt:""},
      {id:"c10",type:"Individuel",name:"Ibrahim Sanogo",company:"",email:"ibrahim.s@exemple.ci",phone:"+225 05 99 00 11",city:"Man",country:"Côte d'Ivoire",tags:["Éducation"],status:"Lead",approved:false,approvalCode:"",approvedAt:""}
    ];
    cs.forEach(function(c,i){c.address="";c.social="";c.notes=c.notes||"";c.charter=c.charter||false;c.createdAt=new Date(N-86400000*(60-i*5)).toISOString();c.updatedAt=todayISO();S.customers.save(S.customers.all().concat([c]));});

    S.contacts.save([
      {id:uid(),customerId:"c3",name:"Marc Diouf",role:"Directeur",email:"marc@mediapro.ci",phone:"+225 07 11 00 11",createdAt:new Date(N-86400000*38).toISOString()},
      {id:uid(),customerId:"c3",name:"Aïcha Konaté",role:"Comm.",email:"aicha@mediapro.ci",phone:"+225 05 22 00 22",createdAt:new Date(N-86400000*35).toISOString()},
      {id:uid(),customerId:"c7",name:"Moussa Fofana",role:"Producteur",email:"moussa@djigui.ci",phone:"",createdAt:new Date(N-86400000*8).toISOString()}
    ]);

    var svcs=S.services.all();
    S.tickets.save([
      {id:uid(),customerId:"c1",title:"Demande de certification créateur responsable",description:"Certification créateur responsable ACCI.",serviceId:svcs[2]?svcs[2].id:"",priority:"Moyen",status:"En cours",comments:[{text:"Dossier reçu par l'équipe ACCI.",date:new Date(N-86400000*2).toISOString()}],dueDate:todayISO(),createdAt:new Date(N-86400000*10).toISOString(),resolvedAt:""},
      {id:uid(),customerId:"c2",title:"Signalement cyberharcèlement",description:"Harcèlement sur réseaux sociaux — pilier Protéger de l'ACCI.",serviceId:svcs[6]?svcs[6].id:"",priority:"Urgent",status:"Ouvert",comments:[],dueDate:"",createdAt:new Date(N-86400000*3).toISOString(),resolvedAt:""},
      {id:uid(),customerId:"c5",title:"Accompagnement juridique contrat",description:"Aide contrat partenariat — pilier Protéger.",serviceId:svcs[1]?svcs[1].id:"",priority:"Élevé",status:"En attente",comments:[{text:"En attente documents du membre.",date:new Date(N-86400000).toISOString()}],dueDate:new Date(N+86400000*7).toISOString().slice(0,10),createdAt:new Date(N-86400000*5).toISOString(),resolvedAt:""},
      {id:uid(),customerId:"c3",title:"Formation équipe vidéo déontologie",description:"Formation déontologie — pilier Former de l'ACCI.",serviceId:svcs[0]?svcs[0].id:"",priority:"Faible",status:"Résolu",comments:[],dueDate:"",createdAt:new Date(N-86400000*20).toISOString(),resolvedAt:new Date(N-86400000*5).toISOString()},
      {id:uid(),customerId:"c8",title:"Vérification d'information fact-checking",description:"Fact-checking — pilier Sensibiliser.",serviceId:svcs[8]?svcs[8].id:"",priority:"Moyen",status:"Ouvert",comments:[],dueDate:new Date(N+86400000*3).toISOString().slice(0,10),createdAt:new Date(N-86400000).toISOString(),resolvedAt:""}
    ]);

    S.deals.save([
      {id:uid(),customerId:"c3",title:"Pack formation MediaPro",value:450000,stage:"Proposition",probability:50,expectedCloseDate:new Date(N+86400000*15).toISOString().slice(0,10),notes:"3 sessions formation ACCI.",createdAt:new Date(N-86400000*12).toISOString(),updatedAt:todayISO()},
      {id:uid(),customerId:"c7",title:"Certification Djigui",value:50000,stage:"Gagné",probability:100,expectedCloseDate:todayISO(),notes:"Certification créateur responsable.",createdAt:new Date(N-86400000*20).toISOString(),updatedAt:todayISO()},
      {id:uid(),customerId:"c4",title:"Adhésion Fatou",value:25000,stage:"Nouveau",probability:10,expectedCloseDate:new Date(N+86400000*30).toISOString().slice(0,10),notes:"Adhésion en attente.",createdAt:new Date(N-86400000*5).toISOString(),updatedAt:todayISO()},
      {id:uid(),customerId:"c5",title:"Audit chaîne Koffi",value:100000,stage:"Négociation",probability:75,expectedCloseDate:new Date(N+86400000*10).toISOString().slice(0,10),notes:"Audit de chaîne ACCI.",createdAt:new Date(N-86400000*8).toISOString(),updatedAt:todayISO()},
      {id:uid(),customerId:"c9",title:"Formation Aminata",value:150000,stage:"Qualifié",probability:25,expectedCloseDate:new Date(N+86400000*25).toISOString().slice(0,10),notes:"Formation contenu responsable.",createdAt:new Date(N-86400000*2).toISOString(),updatedAt:todayISO()},
      {id:uid(),customerId:"c1",title:"Atelier monétisation Awa",value:120000,stage:"Gagné",probability:100,expectedCloseDate:new Date(N-86400000*5).toISOString().slice(0,10),notes:"Terminé — pilier Former.",createdAt:new Date(N-86400000*25).toISOString(),updatedAt:todayISO()}
    ]);

    S.invoices.save([
      {id:uid(),customerId:"c7",number:"F-2026-001",type:"Facture",status:"Payé",issueDate:new Date(N-86400000*15).toISOString().slice(0,10),dueDate:new Date(N-86400000*5).toISOString().slice(0,10),items:[{description:"Certification créateur responsable",serviceId:svcs[2]?svcs[2].id:"",qty:1,unitPrice:50000,lineTotal:50000}],subtotal:50000,taxRate:18,tax:9000,total:59000,notes:"",createdAt:new Date(N-86400000*15).toISOString()},
      {id:uid(),customerId:"c1",number:"F-2026-002",type:"Facture",status:"Payé",issueDate:new Date(N-86400000*10).toISOString().slice(0,10),dueDate:todayISO(),items:[{description:"Atelier monétisation",serviceId:svcs[5]?svcs[5].id:"",qty:1,unitPrice:120000,lineTotal:120000}],subtotal:120000,taxRate:18,tax:21600,total:141600,notes:"",createdAt:new Date(N-86400000*10).toISOString()},
      {id:uid(),customerId:"c3",number:"D-2026-001",type:"Devis",status:"Envoyé",issueDate:todayISO(),dueDate:new Date(N+86400000*30).toISOString().slice(0,10),items:[{description:"Formation contenu responsable",serviceId:svcs[0]?svcs[0].id:"",qty:3,unitPrice:150000,lineTotal:450000}],subtotal:450000,taxRate:18,tax:81000,total:531000,notes:"Pack 3 sessions ACCI.",createdAt:new Date(N-86400000*2).toISOString()},
      {id:uid(),customerId:"c5",number:"F-2026-003",type:"Facture",status:"En retard",issueDate:new Date(N-86400000*20).toISOString().slice(0,10),dueDate:new Date(N-86400000*5).toISOString().slice(0,10),items:[{description:"Accompagnement juridique",serviceId:svcs[1]?svcs[1].id:"",qty:1,unitPrice:75000,lineTotal:75000}],subtotal:75000,taxRate:18,tax:13500,total:88500,notes:"",createdAt:new Date(N-86400000*20).toISOString()}
    ]);

    S.projects.save([
      {id:uid(),name:"Campagne sensibilisation Q3 — Pilier Sensibiliser",description:"Campagne ACCI contre la désinformation en Côte d'Ivoire.",status:"En cours",customerId:"",startDate:new Date(N-86400000*10).toISOString().slice(0,10),endDate:new Date(N+86400000*50).toISOString().slice(0,10),createdAt:new Date(N-86400000*10).toISOString()},
      {id:uid(),name:"Refonte site web ACCI",description:"Modernisation du site — renforcer le pilier Plaider.",status:"Planifié",customerId:"",startDate:new Date(N+86400000*5).toISOString().slice(0,10),endDate:new Date(N+86400000*60).toISOString().slice(0,10),createdAt:new Date(N-86400000*3).toISOString()}
    ]);
    S.tasks.save([
      {id:uid(),title:"Rédiger contenu campagne sensibilisation",projectId:"",status:"En cours",priority:"Haute",assignee:"",dueDate:new Date(N+86400000*5).toISOString().slice(0,10),description:"",createdAt:new Date(N-86400000*5).toISOString()},
      {id:uid(),title:"Design visuels réseaux sociaux ACCI",projectId:"",status:"À faire",priority:"Moyenne",assignee:"",dueDate:new Date(N+86400000*8).toISOString().slice(0,10),description:"",createdAt:new Date(N-86400000*3).toISOString()},
      {id:uid(),title:"Préparer support formation créateurs",projectId:"",status:"Terminé",priority:"Haute",assignee:"",dueDate:new Date(N-86400000*2).toISOString().slice(0,10),description:"",createdAt:new Date(N-86400000*10).toISOString()}
    ]);
    S.notes.save([
      {id:uid(),title:"Idées campagne Q4 — Sensibiliser",content:"- Partenariat avec influenceurs responsables\n- Webinaire droits d'auteur\n- Série vidéo bonnes pratiques numériques",createdAt:new Date(N-86400000*2).toISOString()},
      {id:uid(),title:"Points réunion équipe ACCI",content:"1. Bilan tickets et signalements\n2. Pipeline adhésions\n3. Formations à planifier (Former)\n4. Plaidoyer auprès des institutions (Plaider)",createdAt:new Date(N-86400000).toISOString()}
    ]);
    S.kb.save([
      {id:uid(),title:"Comment signaler un abus — ACCI",content:"Guide étape par étape pour signaler du contenu abusif sur les principales plateformes. L'ACCI vous accompagne dans la démarche (Protéger).",category:"Support",createdAt:new Date(N-86400000*15).toISOString()},
      {id:uid(),title:"Processus de certification créateur responsable",content:"La certification créateur responsable ACCI se déroule en 3 étapes : dossier, formation, évaluation (Former).",category:"Services",createdAt:new Date(N-86400000*10).toISOString()}
    ]);
    S.faq.save([
      {id:uid(),question:"Comment adhérer à l'ACCI ?",answer:"Remplissez le formulaire d'adhésion en ligne ou contactez-nous directement. L'ACCI accueille tous les créateurs de contenu ivoiriens.",createdAt:new Date(N-86400000*20).toISOString()},
      {id:uid(),question:"Quel est le coût de l'adhésion ACCI ?",answer:"L'adhésion standard est de 25 000 FCFA/an. L'ACCI offre des services gratuits comme le signalement d'abus et la cellule d'écoute.",createdAt:new Date(N-86400000*18).toISOString()}
    ]);
    S.announcements.save([
      {id:uid(),title:"Prochaine formation ACCI — Création responsable",content:"Formation ouverte à tous les membres ACCI sur la création de contenu responsable. Inscriptions en cours.",priority:"Haute",createdAt:new Date(N-86400000*5).toISOString()}
    ]);
    S.teamMembers.save([
      {id:uid(),name:"Admin ACCI",role:"Administrateur",email:"admin@acci.ci",phone:"+225 07 00 00 00",department:"Direction",status:"Actif",createdAt:new Date(N-86400000*90).toISOString()},
      {id:uid(),name:"Agent Support ACCI",role:"Agent",email:"support@acci.ci",phone:"+225 05 00 00 01",department:"Support",status:"Actif",createdAt:new Date(N-86400000*60).toISOString()},
      {id:uid(),name:"Agent Commercial ACCI",role:"Agent",email:"commercial@acci.ci",phone:"+225 05 00 00 02",department:"Commercial",status:"Actif",createdAt:new Date(N-86400000*45).toISOString()}
    ]);
  }
  localStorage.setItem("acci_seeded_v4","1");
}

/* =========================== UI COMPONENTS ============================== */
function avatar(x,sz){var ini=(x.name||"?").split(/\s+/).slice(0,2).map(function(w){return w[0];}).join("").toUpperCase();var s=sz||32;return'<span class="avatar" style="width:'+s+'px;height:'+s+'px;font-size:'+(s/2.6)+'px">'+esc(ini)+'</span>';}
function badge(v){return'<span class="badge badge--'+slug(v)+'">'+esc(v)+'</span>';}
function ffield(l,c){return'<label class="afield"><span>'+l+'</span>'+c+'</label>';}
function emptyHTML(icon,msg){return'<div class="empty-state"><div class="empty-state__ic">'+(icon||"📋")+'</div><h2>'+(msg||"Vide.")+'</h2><button class="abtn abtn--primary crud-add">+ Ajouter</button></div>';}
function kpiCard(icon,val,label,cls){return'<div class="kpi"><span class="kpi__icon kpi__icon--'+(cls||"n")+'">'+icon+'</span><span class="kpi__val">'+val+'</span><span class="kpi__label">'+label+'</span></div>';}
function chartBars(data){var max=Math.max.apply(null,data.map(function(d){return d.val;}).concat([1]));return'<div class="chartbars">'+data.map(function(d,i){return'<div class="cb"><span class="cb__label">'+(d.badge?badge(d.label):esc(d.label))+'</span>'+pctBar(d.val,max,PAL[i%PAL.length])+'<span class="cb__val">'+(d.fmt||d.val)+'</span></div>';}).join("")+'</div>';}

function openModal(h,wide){var m=$("#modal");m.innerHTML='<div class="modal__box'+(wide?" modal__box--wide":"")+'">'+h+'</div>';m.hidden=false;$$("[data-close]",m).forEach(function(b){b.addEventListener("click",closeModal);});m.addEventListener("click",function(e){if(e.target===m)closeModal();});}
function closeModal(){var m=$("#modal");m.hidden=true;m.innerHTML="";}
var _tt;function toast(msg,k){var t=$("#toast");t.textContent=msg;t.className="toast toast--"+(k||"ok");t.hidden=false;clearTimeout(_tt);_tt=setTimeout(function(){t.hidden=true;},2600);}
function dl(name,content,mime){var b=new Blob([content],{type:mime+";charset=utf-8"});var a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(function(){URL.revokeObjectURL(a.href);},1000);}
function confirmDel(cb,msg){openModal('<div class="modal__head"><h2>Confirmer</h2><button class="modal__x" data-close>&times;</button></div><div class="modal__body"><p>'+(msg||"Supprimer ? Irréversible.")+'</p></div><div class="modal__foot"><span style="flex:1"></span><button class="abtn abtn--ghost" data-close>Annuler</button><button class="abtn abtn--danger" id="_dy">Supprimer</button></div>');$("#_dy").addEventListener("click",function(){cb();closeModal();});}

/* =========================== CRUD FACTORY ================================ */
function crudHTML(store,cfg){
  var q=norm(state.query);
  var list=store.all();
  if(q){list=list.filter(function(x){return norm((cfg.sk||["name","title"]).map(function(k){return x[k]||"";}).join(" ")).indexOf(q)!==-1;});}
  if(!list.length)return emptyHTML(cfg.ic,cfg.em);
  var ths=cfg.cs.map(function(c){return'<th>'+c.l+'</th>';}).join("")+'<th></th>';
  var trs=list.map(function(x){
    var tds=cfg.cs.map(function(c){
      var v=c.fn?c.fn(x[c.k],x):(x[c.k]||"\u2014");
      if(c.bg)return'<td>'+badge(v)+'</td>';
      if(typeof v==="string"&&c.mx&&v.length>c.mx)v=v.slice(0,c.mx)+"\u2026";
      return'<td>'+(c.b?'<b>'+esc(v)+'</b>':esc(v))+'</td>';
    }).join("");
    return'<tr class="rowlink cr" data-id="'+x.id+'">'+tds+'<td class="rowact"><button class="iact ce" data-id="'+x.id+'">✎</button><button class="iact iact--del cd" data-id="'+x.id+'">🗑</button></td></tr>';
  }).join("");
  return'<div class="filterbar"><span class="filterbar__count">'+list.length+' enreg.</span></div><div class="dtable"><table><thead><tr>'+ths+'</tr></thead><tbody>'+trs+'</tbody></table></div>';
}
function crudBind(store,cfg){
  $$(".crud-add,.empty-state .abtn").forEach(function(b){b.addEventListener("click",function(){crudForm(store,cfg,null);});});
  $$(".ce").forEach(function(b){b.addEventListener("click",function(e){e.stopPropagation();crudForm(store,cfg,b.getAttribute("data-id"));});});
  $$(".cd").forEach(function(b){b.addEventListener("click",function(e){e.stopPropagation();var id=b.getAttribute("data-id");confirmDel(function(){store.remove(id);toast("Supprimé.");refresh();});});});
}
function crudForm(store,cfg,id){
  var item=id?store.get(id):Object.assign({id:""},cfg.df||{});if(!item)return;
  var flds=(cfg.fs||[]).map(function(f){
    var v=item[f.n]!=null?item[f.n]:(f.dv||"");var ctrl;
    if(f.t==="textarea")ctrl='<textarea name="'+f.n+'" rows="'+(f.rows||3)+'">'+esc(v)+'</textarea>';
    else if(f.t==="select")ctrl='<select name="'+f.n+'">'+optH(f.o||[],v)+'</select>';
    else if(f.t==="customer")ctrl='<select name="'+f.n+'">'+custOpt(v)+'</select>';
    else if(f.t==="date")ctrl='<input name="'+f.n+'" type="date" value="'+esc(v)+'">';
    else if(f.t==="number")ctrl='<input name="'+f.n+'" type="number" value="'+(v||0)+'">';
    else ctrl='<input name="'+f.n+'"'+(f.rq?' required':'')+' value="'+esc(v)+'"'+(f.ph?' placeholder="'+esc(f.ph)+'"':'')+'>';
    return ffield(f.l,ctrl);
  }).join("");
  openModal('<div class="modal__head"><h2>'+(id?"Modifier":"Nouveau")+'</h2><button class="modal__x" data-close>&times;</button></div><form id="crf" class="modal__body"><div class="fgrid">'+flds+'</div><p class="ferr" id="crf-e" hidden></p></form><div class="modal__foot"><span style="flex:1"></span><button class="abtn abtn--ghost" data-close>Annuler</button><button class="abtn abtn--primary" id="crf-s">'+(id?"Enregistrer":"Créer")+'</button></div>');
  $("#crf-s").addEventListener("click",function(){
    var form=$("#crf");var rec={id:item.id||uid(),createdAt:item.createdAt||new Date().toISOString(),updatedAt:todayISO()};
    (cfg.fs||[]).forEach(function(f){var el=form.querySelector('[name="'+f.n+'"]');if(el)rec[f.n]=f.t==="number"?parseInt(el.value,10)||0:el.value.trim();});
    var miss=(cfg.fs||[]).filter(function(f){return f.rq&&!rec[f.n];});
    if(miss.length){var er=$("#crf-e");er.textContent=miss[0].l+" obligatoire.";er.hidden=false;return;}
    if(id){store.update(rec);toast("Mis à jour.");}else{store.add(rec);toast("Créé.");}
    closeModal();refresh();
  });
}
/* Register CRUD sub-section shorthand */
function RC(key,store,cfg){SEC[key]={r:function(){return crudHTML(store,cfg);},b:function(){crudBind(store,cfg);},a:function(){crudForm(store,cfg,null);}};}
/* Register analytics sub-section shorthand */
function RA(key,renderFn,bindFn){SEC[key]={r:renderFn,b:bindFn||null,a:null};}

/* =========================== MODULE DEFINITIONS ========================= */
var MODS={
  dashboard:{title:"Tableau de bord ACCI",tabs:[{id:"overview",l:"Vue d'ensemble"},{id:"widgets",l:"Widgets"},{id:"activity",l:"Activité"}]},
  customers:{title:"Membres & Partenaires ACCI",tabs:[{id:"list",l:"Liste"},{id:"segments",l:"Segments"},{id:"tags",l:"Domaines"},{id:"map",l:"Géographie"},{id:"loyalty",l:"Fidélité"},{id:"satisfaction",l:"Satisfaction"},{id:"documents",l:"Documents"},{id:"history",l:"Historique"},{id:"risks",l:"Risques"},{id:"events",l:"Événements"}]},
  contacts:{title:"Contacts ACCI",tabs:[{id:"list",l:"Répertoire"},{id:"groups",l:"Groupes"},{id:"import",l:"Import"},{id:"dedup",l:"Dédoublonnage"}]},
  tickets:{title:"Demandes & Signalements ACCI",tabs:[{id:"list",l:"Liste"},{id:"board",l:"Tableau"},{id:"sla",l:"SLA"},{id:"templates",l:"Modèles"},{id:"escalation",l:"Escalades"},{id:"knowledge",l:"Base connaissances"},{id:"faq",l:"FAQ ACCI"},{id:"surveys",l:"Enquêtes"},{id:"metrics",l:"Métriques"}]},
  pipeline:{title:"Adhésions & Pipeline ACCI",tabs:[{id:"kanban",l:"Kanban"},{id:"forecast",l:"Prévisions"},{id:"goals",l:"Objectifs"},{id:"won",l:"Gagnées"},{id:"lost",l:"Perdues"},{id:"activities",l:"Activités"},{id:"leaderboard",l:"Classement"},{id:"revenue",l:"Revenus"}]},
  invoices:{title:"Cotisations & Factures ACCI",tabs:[{id:"list",l:"Liste"},{id:"templates",l:"Modèles"},{id:"payments",l:"Paiements"},{id:"expenses",l:"Dépenses"},{id:"revdash",l:"Revenus"},{id:"tax",l:"TVA"},{id:"credits",l:"Avoirs"},{id:"recurring",l:"Récurrentes"},{id:"calendar",l:"Calendrier"}]},
  marketing:{title:"Campagnes de sensibilisation ACCI",tabs:[{id:"campaigns",l:"Campagnes"},{id:"manager",l:"Gestionnaire"},{id:"templates",l:"Modèles"},{id:"subscribers",l:"Abonnés"},{id:"calendar",l:"Calendrier"},{id:"social",l:"Réseaux"},{id:"analytics",l:"Analytique"},{id:"landing",l:"Pages"}]},
  projects:{title:"Projets & Initiatives ACCI",tabs:[{id:"list",l:"Projets"},{id:"tasks",l:"Tâches"},{id:"calendar",l:"Calendrier"},{id:"time",l:"Temps"},{id:"milestones",l:"Jalons"},{id:"templates",l:"Modèles"}]},
  comms:{title:"Communication ACCI",tabs:[{id:"email",l:"E-mails"},{id:"sms",l:"SMS"},{id:"calls",l:"Appels"},{id:"meetings",l:"Réunions"},{id:"announcements",l:"Annonces"},{id:"messaging",l:"Messagerie"}]},
  team:{title:"Équipe ACCI",tabs:[{id:"directory",l:"Répertoire"},{id:"performance",l:"Performance"},{id:"attendance",l:"Présence"},{id:"leaves",l:"Congés"},{id:"training",l:"Formations"},{id:"certifications",l:"Certifications"}]},
  docs:{title:"Documents & Chartes ACCI",tabs:[{id:"library",l:"Bibliothèque"},{id:"templates",l:"Modèles"},{id:"contracts",l:"Contrats"},{id:"signatures",l:"Signatures"},{id:"sharing",l:"Partage"}]},
  reports:{title:"Rapports ACCI",tabs:[{id:"predefined",l:"Prédéfinis"},{id:"builder",l:"Constructeur"},{id:"sales",l:"Adhésions"},{id:"customerAnalytics",l:"Membres"},{id:"financial",l:"Finance"},{id:"support",l:"Support"},{id:"activityR",l:"Activité"},{id:"export",l:"Exports"}]},
  productivity:{title:"Productivité ACCI",tabs:[{id:"notes",l:"Notes"},{id:"reminders",l:"Rappels"},{id:"actions",l:"Actions"},{id:"favorites",l:"Favoris"},{id:"notifications",l:"Notifications"},{id:"calendar",l:"Calendrier"}]},
  success:{title:"Suivi & Accompagnement des membres ACCI",tabs:[{id:"onboarding",l:"Onboarding"},{id:"health",l:"Santé"},{id:"renewals",l:"Renouvellements"},{id:"churn",l:"Churn"},{id:"goals",l:"Objectifs"}]},
  admin:{title:"Administration ACCI",tabs:[{id:"admins",l:"Administrateurs"},{id:"audit",l:"Audit"},{id:"logs",l:"Logs"},{id:"backup",l:"Sauvegarde"},{id:"integrations",l:"Intégrations"},{id:"fields",l:"Champs"},{id:"automation",l:"Automatisation"}]}
};
/* Standalone views (no tabs) */
var STANDALONE={inbox:"Réception ACCI",data:"Import / Export"};

/* =========================== SECTION REGISTRY =========================== */
var SEC={};

/* ---- DASHBOARD (3 sections) ---- */
/* 1. dashboard.overview */
RA("dashboard.overview",function(){
  var c=S.customers.all(),t=S.tickets.all(),d=S.deals.all(),inv=S.invoices.all();
  var actifs=c.filter(function(x){return x.status==="Actif";}).length;
  var approvedN=c.filter(function(x){return x.approved===true;}).length;
  var openT=t.filter(function(x){return x.status==="Ouvert"||x.status==="En cours";}).length;
  var pVal=d.filter(function(x){return x.stage!=="Perdu"&&x.stage!=="Gagné";}).reduce(function(s,x){return s+(x.value||0);},0);
  var rev=inv.filter(function(x){return x.status==="Payé";}).reduce(function(s,x){return s+(x.total||0);},0);
  var certified=c.filter(function(x){return x.charter===true;}).length;
  var overdue=inv.filter(function(x){return x.status==="En retard";}).length;
  var kpis=[kpiCard("👥",c.length,"Membres ACCI",""),kpiCard("✅",actifs,"Actifs","ok"),kpiCard("🔑",approvedN,"Membres approuvés","info"),kpiCard("🎫",openT,"Signalements en cours","info"),kpiCard("🎓",certified,"Créateurs certifiés (charte)","ok"),kpiCard("💰",fmtMoney(rev),"Cotisations encaissées","ok"),kpiCard("📈",fmtMoney(pVal),"Pipeline adhésions","warn"),kpiCard("⚠️",overdue,"Factures en retard",overdue?"danger":"")].join("");
  var stageData=DEAL_STAGES.map(function(s){return{label:s,val:d.filter(function(x){return x.stage===s;}).length,badge:true};});
  var tsData=TICKET_STATUSES.map(function(s){return{label:s,val:t.filter(function(x){return x.status===s;}).length,badge:true};});
  var recent=S.audit.all().slice(0,8);
  var auditRows=recent.length?recent.map(function(a){return'<tr><td>'+badge(a.entity)+'</td><td>'+esc(a.action)+'</td><td>'+esc(a.detail)+'</td><td class="muted">'+fmtDate(a.createdAt)+'</td></tr>';}).join(""):'<tr><td colspan="4" class="muted" style="padding:18px">Aucune activité enregistrée dans le CRM ACCI.</td></tr>';
  var inboxN=S.inbox.count();
  return'<div class="banner banner--success" style="margin-bottom:16px"><b>ACCI</b> — Sensibiliser · Former · Protéger · Plaider — Pour un usage responsable des réseaux sociaux en Côte d\'Ivoire.</div>'+
    (inboxN?'<div class="banner banner--info">📥 <b>'+inboxN+'</b> demande(s) de service ACCI. <button class="link" data-go="inbox">Voir</button></div>':"")+
    '<div class="kpis">'+kpis+'</div><div class="cols"><section class="panel"><div class="panel__head"><h2 class="panel__title">Adhésions & partenariats par étape</h2></div>'+chartBars(stageData)+'</section><section class="panel"><div class="panel__head"><h2 class="panel__title">Demandes & signalements par statut</h2></div>'+chartBars(tsData)+'</section></div>'+
    '<section class="panel"><div class="panel__head"><h2 class="panel__title">Activité récente ACCI</h2></div><div class="dtable"><table><thead><tr><th>Entité</th><th>Action</th><th>Détail</th><th>Date</th></tr></thead><tbody>'+auditRows+'</tbody></table></div></section>';
},function(){$$("[data-go]").forEach(function(b){b.addEventListener("click",function(){go(b.getAttribute("data-go"));});});});

/* 2. dashboard.widgets */
RA("dashboard.widgets",function(){
  var widgets=[
    {icon:"👥",title:"Nouveaux membres ACCI ce mois",val:S.customers.where(function(c){var d=new Date(c.createdAt),n=new Date();return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear();}).length},
    {icon:"🎫",title:"Signalements urgents (Protéger)",val:S.tickets.where(function(t){return t.priority==="Urgent"&&t.status!=="Fermé"&&t.status!=="Résolu";}).length},
    {icon:"💰",title:"Adhésions gagnées ce mois",val:S.deals.where(function(d){var dt=new Date(d.updatedAt||d.createdAt),n=new Date();return d.stage==="Gagné"&&dt.getMonth()===n.getMonth();}).length},
    {icon:"📄",title:"Cotisations en attente",val:S.invoices.where(function(i){return i.status==="Envoyé";}).length},
    {icon:"📁",title:"Initiatives ACCI actives",val:S.projects.where(function(p){return p.status==="En cours";}).length},
    {icon:"🎓",title:"Formations dispensées (Former)",val:S.trainings.count()},
    {icon:"🔑",title:"Portails membres actifs",val:S.customers.where(function(c){return c.approved===true;}).length},
    {icon:"📝",title:"Notes de suivi",val:S.notes.count()}
  ];
  return'<div class="kpis">'+widgets.map(function(w){return kpiCard(w.icon,w.val,w.title,"");}).join("")+'</div>';
});

/* 3. dashboard.activity */
RA("dashboard.activity",function(){
  var all=S.audit.all().slice(0,50);
  if(!all.length)return'<p class="muted">Aucune activité enregistrée dans le CRM ACCI.</p>';
  var rows=all.map(function(a){return'<tr><td>'+badge(a.entity)+'</td><td>'+esc(a.action)+'</td><td>'+esc(a.detail)+'</td><td class="muted">'+fmtDate(a.createdAt)+'</td></tr>';}).join("");
  return'<div class="dtable"><table><thead><tr><th>Entité</th><th>Action</th><th>Détail</th><th>Date</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
});

/* ---- CUSTOMERS (10 sections) ---- */
/* 4. customers.list — complex, defined later */

/* 5. customers.segments */
RA("customers.segments",function(){
  var c=S.customers.all();
  var byStatus={};CUSTOMER_STATUSES.forEach(function(s){byStatus[s]=c.filter(function(x){return x.status===s;}).length;});
  var byType={};CUSTOMER_TYPES.forEach(function(t){byType[t]=c.filter(function(x){return x.type===t;}).length;});
  var byCity={};c.forEach(function(x){var ci=x.city||"Autre";byCity[ci]=(byCity[ci]||0)+1;});
  var cities=Object.keys(byCity).sort(function(a,b){return byCity[b]-byCity[a];}).slice(0,10);
  var approvedCount=c.filter(function(x){return x.approved;}).length;
  return'<div class="banner banner--info" style="margin-bottom:14px">Segmentation des membres ACCI — '+approvedCount+' membre(s) avec accès portail approuvé.</div>'+
    '<div class="cols"><section class="panel"><div class="panel__head"><h2 class="panel__title">Par statut</h2></div>'+chartBars(CUSTOMER_STATUSES.map(function(s){return{label:s,val:byStatus[s],badge:true};}))+'</section><section class="panel"><div class="panel__head"><h2 class="panel__title">Par type</h2></div>'+chartBars(CUSTOMER_TYPES.map(function(t){return{label:t,val:byType[t],badge:true};}))+'</section></div>'+
    '<section class="panel"><div class="panel__head"><h2 class="panel__title">Par ville (top 10)</h2></div>'+chartBars(cities.map(function(ci){return{label:ci,val:byCity[ci]};}))+'</section>';
});

/* 6. customers.tags */
RA("customers.tags",function(){
  var c=S.customers.all(),tagMap={};
  c.forEach(function(x){(x.tags||[]).forEach(function(t){tagMap[t]=(tagMap[t]||0)+1;});});
  var tags=Object.keys(tagMap).sort(function(a,b){return tagMap[b]-tagMap[a];});
  return'<section class="panel"><div class="panel__head"><h2 class="panel__title">Domaines de création des membres ACCI</h2></div>'+(tags.length?chartBars(tags.map(function(t){return{label:t,val:tagMap[t]};})):'<p class="muted">Aucun domaine de création renseigné. Les membres ACCI couvrent tous les domaines du contenu numérique.</p>')+'</section>';
});

/* 7. customers.map */
RA("customers.map",function(){
  var c=S.customers.all(),byCountry={},byCity={};
  c.forEach(function(x){var co=x.country||"Autre";byCountry[co]=(byCountry[co]||0)+1;var ci=x.city||"Autre";byCity[ci]=(byCity[ci]||0)+1;});
  return'<div class="banner banner--info" style="margin-bottom:14px">Répartition géographique des membres ACCI en Côte d\'Ivoire et au-delà.</div>'+
    '<div class="cols"><section class="panel"><div class="panel__head"><h2 class="panel__title">Par pays</h2></div>'+chartBars(Object.keys(byCountry).map(function(k){return{label:k,val:byCountry[k]};}))+'</section><section class="panel"><div class="panel__head"><h2 class="panel__title">Par ville</h2></div>'+chartBars(Object.keys(byCity).sort(function(a,b){return byCity[b]-byCity[a];}).slice(0,12).map(function(k){return{label:k,val:byCity[k]};}))+'</section></div>';
});

/* 8. customers.loyalty */
RC("customers.loyalty",S.loyalty,{ic:"⭐",em:"Aucun programme de fidélité ACCI enregistré. Récompensez les créateurs engagés !",cs:[{k:"customerId",l:"Membre",fn:function(v){var c=S.customers.get(v);return c?c.name:"\u2014";}},{k:"points",l:"Points",b:true},{k:"level",l:"Niveau",bg:true},{k:"createdAt",l:"Date",fn:fmtDate}],fs:[{n:"customerId",l:"Membre ACCI",t:"customer"},{n:"points",l:"Points",t:"number"},{n:"level",l:"Niveau",t:"select",o:["Bronze","Argent","Or","Platine"]}],df:{customerId:"",points:0,level:"Bronze"},sk:["customerId"]});

/* 9. customers.satisfaction */
RC("customers.satisfaction",S.satisfaction,{ic:"😊",em:"Aucun score de satisfaction ACCI. Évaluez la qualité de l'accompagnement des membres.",cs:[{k:"customerId",l:"Membre",fn:function(v){var c=S.customers.get(v);return c?c.name:"\u2014";}},{k:"score",l:"Score",b:true},{k:"feedback",l:"Commentaire",mx:50},{k:"createdAt",l:"Date",fn:fmtDate}],fs:[{n:"customerId",l:"Membre ACCI",t:"customer"},{n:"score",l:"Score (1-10)",t:"number"},{n:"feedback",l:"Commentaire",t:"textarea",rows:2}],df:{customerId:"",score:0,feedback:""},sk:["feedback"]});

/* 10. customers.documents */
RC("customers.documents",S.custDocs,{ic:"📎",em:"Aucun document membre ACCI. Stockez chartes, contrats et pièces ici.",cs:[{k:"name",l:"Nom",b:true},{k:"type",l:"Type"},{k:"customerId",l:"Membre",fn:function(v){var c=S.customers.get(v);return c?c.name:"\u2014";}},{k:"createdAt",l:"Date",fn:fmtDate}],fs:[{n:"name",l:"Nom *",rq:true},{n:"type",l:"Type",t:"select",o:["Charte ACCI","Contrat","Facture","Pièce d'identité","Autre"]},{n:"customerId",l:"Membre ACCI",t:"customer"},{n:"notes",l:"Notes",t:"textarea",rows:2}],df:{name:"",type:"Autre",customerId:"",notes:""},sk:["name","type"]});

/* 11. customers.history */
RA("customers.history",function(){
  var logs=S.audit.where(function(a){return a.entity==="client";}).slice(0,30);
  if(!logs.length)return'<div class="empty-state"><div class="empty-state__ic">📋</div><h2>Aucun historique d\'interaction membre ACCI</h2><p class="muted">Les actions sur les membres seront enregistrées ici.</p></div>';
  return'<div class="timeline">'+logs.map(function(a){return'<div class="timeline__item"><span class="timeline__icon">📋</span><div class="timeline__body"><b>'+esc(a.action)+'</b> — '+esc(a.detail)+'<div class="timeline__date">'+fmtDate(a.createdAt)+'</div></div></div>';}).join("")+'</div>';
});

/* 12. customers.risks */
RA("customers.risks",function(){
  var c=S.customers.all();
  var inactive=c.filter(function(x){return x.status==="Inactif";});
  var noTickets=c.filter(function(x){return S.tickets.where(function(t){return t.customerId===x.id;}).length===0;});
  var noCharter=c.filter(function(x){return!x.charter&&x.status==="Actif";});
  return'<div class="banner banner--info" style="margin-bottom:14px">Identification des risques membres ACCI — Pilier Protéger.</div>'+
    '<div class="cols"><section class="panel panel--danger"><div class="panel__head"><h2 class="panel__title">⚠️ Membres inactifs ('+inactive.length+')</h2></div>'+(inactive.length?'<div class="dtable"><table><thead><tr><th>Membre</th><th>E-mail</th><th>Ville</th></tr></thead><tbody>'+inactive.map(function(x){return'<tr><td><b>'+esc(x.name)+'</b></td><td>'+esc(x.email||"\u2014")+'</td><td>'+esc(x.city||"\u2014")+'</td></tr>';}).join("")+'</tbody></table></div>':'<p class="muted">Aucun membre inactif.</p>')+'</section><section class="panel"><div class="panel__head"><h2 class="panel__title">Membres actifs sans charte signée ('+noCharter.length+')</h2></div><p class="muted">'+noCharter.length+' membre(s) actif(s) n\'ont pas encore signé la charte ACCI.</p></section></div>'+
    '<section class="panel"><div class="panel__head"><h2 class="panel__title">Membres sans demande de service ('+noTickets.length+')</h2></div><p class="muted">'+noTickets.length+' membre(s) n\'ont jamais utilisé les services ACCI. Proposez-leur un accompagnement !</p></section>';
});

/* 13. customers.events */
RA("customers.events",function(){
  var c=S.customers.all();
  var recent=c.filter(function(x){var d=new Date(x.createdAt),n=new Date();return d.getMonth()===n.getMonth();});
  return'<section class="panel"><div class="panel__head"><h2 class="panel__title">Membres inscrits ce mois à l\'ACCI ('+recent.length+')</h2></div>'+(recent.length?'<div class="dtable"><table><thead><tr><th>Membre</th><th>Inscrit le</th><th>Statut</th><th>Portail</th></tr></thead><tbody>'+recent.map(function(x){return'<tr><td><b>'+esc(x.name)+'</b></td><td>'+fmtDate(x.createdAt)+'</td><td>'+badge(x.status)+'</td><td>'+(x.approved?'<span style="color:var(--green)">✅ Approuvé</span>':'<span class="muted">En attente</span>')+'</td></tr>';}).join("")+'</tbody></table></div>':'<p class="muted">Aucun nouveau membre ACCI ce mois. Activez le pilier Sensibiliser !</p>')+'</section>';
});

/* ---- CONTACTS (4 sections) ---- */
/* 14. contacts.list — complex, defined later */

/* 15. contacts.groups */
RC("contacts.groups",S.contactGroups,{ic:"📂",em:"Aucun groupe de contacts ACCI. Organisez vos contacts par partenaire ou initiative.",cs:[{k:"name",l:"Nom",b:true},{k:"description",l:"Description",mx:50},{k:"createdAt",l:"Date",fn:fmtDate}],fs:[{n:"name",l:"Nom *",rq:true},{n:"description",l:"Description",t:"textarea",rows:2}],df:{name:"",description:""},sk:["name","description"]});

/* 16. contacts.import */
RA("contacts.import",function(){
  return'<section class="panel"><div class="panel__head"><h2 class="panel__title">Importer des contacts ACCI</h2></div><p class="muted">Importez des contacts depuis un fichier CSV. Colonnes attendues : name, role, email, phone, customerId.</p><div class="btnrow"><label class="abtn abtn--ghost abtn--sm">⬆ Choisir un fichier<input type="file" id="ct-imp" accept=".csv" hidden></label></div><p class="ferr" id="ct-msg" hidden></p></section>';
},function(){
  var imp=$("#ct-imp");if(imp)imp.addEventListener("change",function(e){
    var file=e.target.files[0];if(!file)return;var r=new FileReader();
    r.onload=function(){try{var rows=parseCSV(r.result);var added=0;rows.forEach(function(row){if(!row.name)return;S.contacts.add({customerId:row.customerid||"",name:row.name,role:row.role||"",email:row.email||"",phone:row.phone||""});added++;});toast(added+" contact(s) importé(s).");refresh();}catch(err){var m=$("#ct-msg");m.textContent="Erreur de lecture.";m.hidden=false;}};
    r.readAsText(file,"utf-8");e.target.value="";
  });
});

/* 17. contacts.dedup */
RA("contacts.dedup",function(){
  var all=S.contacts.all(),dupes=[],seen={};
  all.forEach(function(c){var key=norm(c.name+c.email);if(seen[key])dupes.push({a:seen[key],b:c});else seen[key]=c;});
  if(!dupes.length)return'<div class="empty-state"><div class="empty-state__ic">✅</div><h2>Aucun doublon détecté</h2><p class="muted">Tous les contacts ACCI semblent uniques.</p></div>';
  var rows=dupes.map(function(d){return'<tr><td><b>'+esc(d.a.name)+'</b><br><span class="muted">'+esc(d.a.email)+'</span></td><td><b>'+esc(d.b.name)+'</b><br><span class="muted">'+esc(d.b.email)+'</span></td><td><button class="abtn abtn--danger abtn--sm dup-del" data-id="'+d.b.id+'">Supprimer doublon</button></td></tr>';}).join("");
  return'<section class="panel"><div class="panel__head"><h2 class="panel__title">Doublons potentiels ('+dupes.length+')</h2></div><div class="dtable"><table><thead><tr><th>Contact A</th><th>Contact B (doublon)</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div></section>';
},function(){$$(".dup-del").forEach(function(b){b.addEventListener("click",function(){S.contacts.remove(b.getAttribute("data-id"));toast("Doublon supprimé.");refresh();});});});

/* ---- TICKETS (9 sections) ---- */
/* 18. tickets.list — complex, defined later */

/* 19. tickets.board */
RA("tickets.board",function(){
  var tickets=S.tickets.all();
  var cols=TICKET_STATUSES.map(function(status){
    var items=tickets.filter(function(t){return t.status===status;});
    var cards=items.map(function(t){var c=S.customers.get(t.customerId);return'<div class="kanban__card" data-id="'+t.id+'"><div class="kanban__card-title">'+esc(t.title)+'</div><div class="kanban__card-sub">'+(c?esc(c.name):"\u2014")+'</div><div>'+badge(t.priority)+'</div></div>';}).join("");
    return'<div class="kanban__col"><div class="kanban__col-head"><h3>'+esc(status)+' <span class="muted">('+items.length+')</span></h3></div><div class="kanban__cards">'+cards+'</div></div>';
  }).join("");
  return'<div class="banner banner--info" style="margin-bottom:14px">Tableau des demandes et signalements ACCI — Pilier Protéger & Plaider.</div><div class="kanban">'+cols+'</div>';
},function(){$$(".kanban__card").forEach(function(c){c.addEventListener("click",function(){openTicketEdit(c.getAttribute("data-id"));});});});

/* 20. tickets.sla */
RA("tickets.sla",function(){
  var t=S.tickets.all();
  var overdue=t.filter(function(x){return x.dueDate&&x.status!=="Résolu"&&x.status!=="Fermé"&&new Date(x.dueDate)<new Date();});
  var onTime=t.filter(function(x){return x.resolvedAt&&x.dueDate&&new Date(x.resolvedAt)<=new Date(x.dueDate);});
  var total=t.filter(function(x){return x.dueDate;}).length;
  var rate=total?Math.round(onTime.length/total*100):0;
  return'<div class="banner banner--info" style="margin-bottom:14px">Respect des délais de traitement des demandes ACCI — engagement envers nos membres.</div>'+
    '<div class="stat-row"><div class="stat-box"><div class="stat-box__val">'+rate+'%</div><div class="stat-box__label">Respect SLA ACCI</div><div class="progress-bar"><div class="progress-bar__fill" style="width:'+rate+'%"></div></div></div><div class="stat-box"><div class="stat-box__val">'+overdue.length+'</div><div class="stat-box__label">En dépassement</div></div></div>'+
    (overdue.length?'<section class="panel panel--danger"><div class="panel__head"><h2 class="panel__title">Demandes ACCI en dépassement SLA</h2></div><div class="dtable"><table><thead><tr><th>Titre</th><th>Échéance</th><th>Priorité</th><th>Statut</th></tr></thead><tbody>'+overdue.map(function(x){return'<tr><td><b>'+esc(x.title)+'</b></td><td class="muted">'+fmtDate(x.dueDate)+'</td><td>'+badge(x.priority)+'</td><td>'+badge(x.status)+'</td></tr>';}).join("")+'</tbody></table></div></section>':'');
});

/* 21. tickets.templates */
RC("tickets.templates",S.ticketTemplates,{ic:"📋",em:"Aucun modèle de demande ACCI. Créez des modèles pour les services fréquents (signalement, certification, etc.).",cs:[{k:"name",l:"Nom",b:true},{k:"priority",l:"Priorité",bg:true},{k:"description",l:"Description",mx:40}],fs:[{n:"name",l:"Nom *",rq:true},{n:"description",l:"Description",t:"textarea",rows:3},{n:"priority",l:"Priorité",t:"select",o:TICKET_PRIORITIES}],df:{name:"",description:"",priority:"Moyen"},sk:["name"]});

/* 22. tickets.escalation */
RA("tickets.escalation",function(){
  var urgent=S.tickets.where(function(t){return t.priority==="Urgent"&&t.status!=="Résolu"&&t.status!=="Fermé";});
  var high=S.tickets.where(function(t){return t.priority==="Élevé"&&t.status!=="Résolu"&&t.status!=="Fermé";});
  return'<div class="banner banner--info" style="margin-bottom:14px">File d\'escalade ACCI — Signalements urgents nécessitant une intervention immédiate (Protéger).</div>'+
    '<div class="stat-row"><div class="stat-box" style="border-color:var(--danger)"><div class="stat-box__val" style="color:var(--danger)">'+urgent.length+'</div><div class="stat-box__label">Urgents non résolus</div></div><div class="stat-box" style="border-color:var(--orange)"><div class="stat-box__val" style="color:var(--orange)">'+high.length+'</div><div class="stat-box__label">Élevés non résolus</div></div></div>'+
    (urgent.length?'<section class="panel panel--danger"><div class="panel__head"><h2 class="panel__title">🚨 File d\'escalade urgente ACCI</h2></div><div class="dtable"><table><thead><tr><th>Titre</th><th>Membre</th><th>Statut</th><th>Créé le</th></tr></thead><tbody>'+urgent.map(function(t){var c=S.customers.get(t.customerId);return'<tr><td><b>'+esc(t.title)+'</b></td><td>'+(c?esc(c.name):"\u2014")+'</td><td>'+badge(t.status)+'</td><td class="muted">'+fmtDate(t.createdAt)+'</td></tr>';}).join("")+'</tbody></table></div></section>':'');
});

/* 23. tickets.knowledge */
RC("tickets.knowledge",S.kb,{ic:"📚",em:"Aucun article dans la base de connaissances ACCI. Documentez les procédures de Sensibilisation, Formation, Protection et Plaidoyer.",cs:[{k:"title",l:"Titre",b:true},{k:"category",l:"Catégorie"},{k:"content",l:"Contenu",mx:60},{k:"createdAt",l:"Date",fn:fmtDate}],fs:[{n:"title",l:"Titre *",rq:true},{n:"category",l:"Catégorie",t:"select",o:["Sensibiliser","Former","Protéger","Plaider","Services","Technique","Autre"]},{n:"content",l:"Contenu",t:"textarea",rows:6}],df:{title:"",category:"Sensibiliser",content:""},sk:["title","content","category"]});

/* 24. tickets.faq */
RC("tickets.faq",S.faq,{ic:"❓",em:"Aucune FAQ ACCI. Ajoutez les questions fréquentes sur les services, l'adhésion et les piliers de l'association.",cs:[{k:"question",l:"Question",b:true},{k:"answer",l:"Réponse",mx:60},{k:"createdAt",l:"Date",fn:fmtDate}],fs:[{n:"question",l:"Question *",rq:true},{n:"answer",l:"Réponse",t:"textarea",rows:4}],df:{question:"",answer:""},sk:["question","answer"]});

/* 25. tickets.surveys */
RC("tickets.surveys",S.surveys,{ic:"📊",em:"Aucune enquête ACCI. Lancez des sondages pour évaluer l'impact de vos actions de sensibilisation.",cs:[{k:"name",l:"Nom",b:true},{k:"status",l:"Statut",bg:true},{k:"responses",l:"Réponses"},{k:"createdAt",l:"Date",fn:fmtDate}],fs:[{n:"name",l:"Nom *",rq:true},{n:"status",l:"Statut",t:"select",o:["Brouillon","En cours","Terminé"]},{n:"responses",l:"Réponses",t:"number"},{n:"description",l:"Description",t:"textarea",rows:2}],df:{name:"",status:"Brouillon",responses:0,description:""},sk:["name"]});

/* 26. tickets.metrics */
RA("tickets.metrics",function(){
  var t=S.tickets.all();var total=t.length;
  var resolved=t.filter(function(x){return x.status==="Résolu"||x.status==="Fermé";}).length;
  var avgResolve=0;var resTimes=t.filter(function(x){return x.resolvedAt&&x.createdAt;}).map(function(x){return(new Date(x.resolvedAt)-new Date(x.createdAt))/86400000;});
  if(resTimes.length)avgResolve=Math.round(resTimes.reduce(function(a,b){return a+b;},0)/resTimes.length);
  return'<div class="banner banner--info" style="margin-bottom:14px">Métriques de traitement des demandes et signalements ACCI.</div>'+
    '<div class="stat-row"><div class="stat-box"><div class="stat-box__val">'+total+'</div><div class="stat-box__label">Total demandes ACCI</div></div><div class="stat-box"><div class="stat-box__val">'+resolved+'</div><div class="stat-box__label">Résolues</div></div><div class="stat-box"><div class="stat-box__val">'+avgResolve+'j</div><div class="stat-box__label">Temps moyen résolution</div></div><div class="stat-box"><div class="stat-box__val">'+(total?Math.round(resolved/total*100):0)+'%</div><div class="stat-box__label">Taux résolution</div></div></div>'+
    '<div class="cols"><section class="panel"><div class="panel__head"><h2 class="panel__title">Par statut</h2></div>'+chartBars(TICKET_STATUSES.map(function(s){return{label:s,val:t.filter(function(x){return x.status===s;}).length,badge:true};}))+'</section><section class="panel"><div class="panel__head"><h2 class="panel__title">Par priorité</h2></div>'+chartBars(TICKET_PRIORITIES.map(function(p){return{label:p,val:t.filter(function(x){return x.priority===p;}).length,badge:true};}))+'</section></div>';
});

/* ---- PIPELINE (8 sections) ---- */
/* 27. pipeline.kanban — complex, defined later */

/* 28. pipeline.forecast */
RA("pipeline.forecast",function(){
  var d=S.deals.all().filter(function(x){return x.stage!=="Perdu"&&x.stage!=="Gagné";});
  var weighted=d.reduce(function(s,x){return s+(x.value||0)*(DEAL_PROBS[x.stage]||0)/100;},0);
  var total=d.reduce(function(s,x){return s+(x.value||0);},0);
  return'<div class="banner banner--info" style="margin-bottom:14px">Prévisions des adhésions et partenariats ACCI en cours de négociation.</div>'+
    '<div class="stat-row"><div class="stat-box"><div class="stat-box__val">'+fmtMoney(total)+'</div><div class="stat-box__label">Pipeline adhésions total</div></div><div class="stat-box"><div class="stat-box__val">'+fmtMoney(Math.round(weighted))+'</div><div class="stat-box__label">Valeur pondérée</div></div><div class="stat-box"><div class="stat-box__val">'+d.length+'</div><div class="stat-box__label">Adhésions actives</div></div></div>'+
    '<section class="panel"><div class="panel__head"><h2 class="panel__title">Détail par étape</h2></div>'+chartBars(DEAL_STAGES.filter(function(s){return s!=="Gagné"&&s!=="Perdu";}).map(function(s){var sd=d.filter(function(x){return x.stage===s;});var v=sd.reduce(function(a,x){return a+(x.value||0);},0);return{label:s,val:v,fmt:fmtMoney(v),badge:true};}))+'</section>';
});

/* 29. pipeline.goals */
RC("pipeline.goals",S.salesGoals,{ic:"🎯",em:"Aucun objectif d'adhésion ACCI défini. Fixez vos objectifs pour les 4 piliers : Sensibiliser, Former, Protéger, Plaider.",cs:[{k:"name",l:"Objectif",b:true},{k:"target",l:"Cible",fn:function(v){return fmtMoney(v);}},{k:"current",l:"Actuel",fn:function(v){return fmtMoney(v);}},{k:"deadline",l:"Échéance",fn:fmtDate}],fs:[{n:"name",l:"Nom *",rq:true},{n:"target",l:"Cible",t:"number"},{n:"current",l:"Actuel",t:"number"},{n:"deadline",l:"Échéance",t:"date"}],df:{name:"",target:0,current:0,deadline:""},sk:["name"]});

/* 30. pipeline.won */
RA("pipeline.won",function(){
  var won=S.deals.where(function(d){return d.stage==="Gagné";});
  var total=won.reduce(function(s,d){return s+(d.value||0);},0);
  if(!won.length)return'<div class="empty-state"><div class="empty-state__ic">🏆</div><h2>Aucune adhésion ou partenariat ACCI conclu</h2><p class="muted">Les adhésions gagnées apparaîtront ici. Continuez le travail de sensibilisation !</p></div>';
  return'<div class="stat-row"><div class="stat-box"><div class="stat-box__val">'+won.length+'</div><div class="stat-box__label">Adhésions/partenariats gagnés</div></div><div class="stat-box"><div class="stat-box__val">'+fmtMoney(total)+'</div><div class="stat-box__label">Revenu total ACCI</div></div></div>'+
    '<div class="dtable"><table><thead><tr><th>Affaire</th><th>Membre/Partenaire</th><th>Valeur</th><th>Date</th></tr></thead><tbody>'+won.map(function(d){var c=S.customers.get(d.customerId);return'<tr><td><b>'+esc(d.title)+'</b></td><td>'+(c?esc(c.name):"\u2014")+'</td><td>'+fmtMoney(d.value)+'</td><td class="muted">'+fmtDate(d.updatedAt)+'</td></tr>';}).join("")+'</tbody></table></div>';
});

/* 31. pipeline.lost */
RA("pipeline.lost",function(){
  var lost=S.deals.where(function(d){return d.stage==="Perdu";});
  if(!lost.length)return'<div class="empty-state"><div class="empty-state__ic">📉</div><h2>Aucune adhésion ACCI perdue</h2><p class="muted">Bonne nouvelle ! Aucun prospect perdu pour le moment.</p></div>';
  return'<div class="banner banner--info" style="margin-bottom:14px">Analyse des adhésions perdues — identifiez les points d\'amélioration pour l\'ACCI.</div>'+
    '<div class="dtable"><table><thead><tr><th>Affaire</th><th>Prospect</th><th>Valeur</th><th>Notes</th></tr></thead><tbody>'+lost.map(function(d){var c=S.customers.get(d.customerId);return'<tr><td><b>'+esc(d.title)+'</b></td><td>'+(c?esc(c.name):"\u2014")+'</td><td>'+fmtMoney(d.value)+'</td><td class="muted">'+esc((d.notes||"").slice(0,50))+'</td></tr>';}).join("")+'</tbody></table></div>';
});

/* 32. pipeline.activities */
RC("pipeline.activities",S.salesActivities,{ic:"📋",em:"Aucune activité de prospection ACCI. Suivez vos démarches de sensibilisation et d'adhésion.",cs:[{k:"type",l:"Type",bg:true},{k:"description",l:"Description",mx:50},{k:"customerId",l:"Membre/Prospect",fn:function(v){var c=S.customers.get(v);return c?c.name:"\u2014";}},{k:"date",l:"Date",fn:fmtDate}],fs:[{n:"type",l:"Type",t:"select",o:["Appel","E-mail","Réunion","Note","Autre"]},{n:"description",l:"Description *",rq:true},{n:"customerId",l:"Membre/Prospect",t:"customer"},{n:"date",l:"Date",t:"date"}],df:{type:"Appel",description:"",customerId:"",date:todayISO()},sk:["description","type"]});

/* 33. pipeline.leaderboard */
RA("pipeline.leaderboard",function(){
  return'<section class="panel"><div class="panel__head"><h2 class="panel__title">🏅 Classement équipe ACCI (adhésions gagnées)</h2></div><p class="muted">Le classement est basé sur les adhésions et partenariats gagnés par l\'équipe ACCI. En mode multi-utilisateurs, chaque agent verra ses résultats.</p><div class="stat-row"><div class="stat-box"><div class="stat-box__val">'+S.deals.where(function(d){return d.stage==="Gagné";}).length+'</div><div class="stat-box__label">Total adhésions gagnées</div></div><div class="stat-box"><div class="stat-box__val">'+fmtMoney(S.deals.where(function(d){return d.stage==="Gagné";}).reduce(function(s,d){return s+(d.value||0);},0))+'</div><div class="stat-box__label">Valeur totale ACCI</div></div></div></section>';
});

/* 34. pipeline.revenue */
RA("pipeline.revenue",function(){
  var inv=S.invoices.where(function(i){return i.status==="Payé";});
  var byMonth={};inv.forEach(function(i){var m=(i.issueDate||"").slice(0,7);byMonth[m]=(byMonth[m]||0)+(i.total||0);});
  var months=Object.keys(byMonth).sort();
  return'<section class="panel"><div class="panel__head"><h2 class="panel__title">📈 Revenu mensuel ACCI (cotisations & services)</h2></div>'+(months.length?chartBars(months.map(function(m){return{label:m,val:byMonth[m],fmt:fmtMoney(byMonth[m])};})):'<p class="muted">Aucune donnée de revenu ACCI.</p>')+'</section>';
});

/* ---- INVOICES (9 sections) ---- */
/* 35. invoices.list — complex, defined later */

/* 36. invoices.templates */
RC("invoices.templates",S.invTemplates,{ic:"📄",em:"Aucun modèle de facture ACCI. Créez des modèles pour les cotisations et services récurrents.",cs:[{k:"name",l:"Nom",b:true},{k:"description",l:"Description",mx:40},{k:"createdAt",l:"Date",fn:fmtDate}],fs:[{n:"name",l:"Nom *",rq:true},{n:"description",l:"Description",t:"textarea",rows:3}],df:{name:"",description:""},sk:["name"]});

/* 37. invoices.payments */
RC("invoices.payments",S.payments,{ic:"💳",em:"Aucun paiement enregistré. Suivez les cotisations et paiements des membres ACCI.",cs:[{k:"invoiceNum",l:"Facture"},{k:"amount",l:"Montant",fn:function(v){return fmtMoney(v);}},{k:"method",l:"Méthode"},{k:"date",l:"Date",fn:fmtDate}],fs:[{n:"invoiceNum",l:"N° facture"},{n:"amount",l:"Montant",t:"number"},{n:"method",l:"Méthode",t:"select",o:["Virement","Espèces","Mobile Money","Chèque","Carte","Autre"]},{n:"date",l:"Date",t:"date"},{n:"notes",l:"Notes",t:"textarea",rows:2}],df:{invoiceNum:"",amount:0,method:"Mobile Money",date:todayISO(),notes:""},sk:["invoiceNum"]});

/* 38. invoices.expenses */
RC("invoices.expenses",S.expenses,{ic:"💸",em:"Aucune dépense ACCI enregistrée. Suivez les dépenses liées aux formations, sensibilisations et actions de protection.",cs:[{k:"description",l:"Description",b:true},{k:"amount",l:"Montant",fn:function(v){return fmtMoney(v);}},{k:"category",l:"Catégorie"},{k:"date",l:"Date",fn:fmtDate}],fs:[{n:"description",l:"Description *",rq:true},{n:"amount",l:"Montant",t:"number"},{n:"category",l:"Catégorie",t:"select",o:["Sensibilisation","Formation","Protection","Plaidoyer","Fournitures","Transport","Communication","Loyer","Autre"]},{n:"date",l:"Date",t:"date"}],df:{description:"",amount:0,category:"Autre",date:todayISO()},sk:["description","category"]});

/* 39. invoices.revdash */
RA("invoices.revdash",function(){
  var inv=S.invoices.all();
  var paid=inv.filter(function(i){return i.status==="Payé";}).reduce(function(s,i){return s+(i.total||0);},0);
  var pending=inv.filter(function(i){return i.status==="Envoyé";}).reduce(function(s,i){return s+(i.total||0);},0);
  var overdue=inv.filter(function(i){return i.status==="En retard";}).reduce(function(s,i){return s+(i.total||0);},0);
  var expenses=S.expenses.all().reduce(function(s,e){return s+(e.amount||0);},0);
  return'<div class="banner banner--info" style="margin-bottom:14px">Tableau financier ACCI — Cotisations, services et dépenses.</div>'+
    '<div class="stat-row"><div class="stat-box"><div class="stat-box__val" style="color:var(--green)">'+fmtMoney(paid)+'</div><div class="stat-box__label">Cotisations encaissées</div></div><div class="stat-box"><div class="stat-box__val" style="color:var(--info)">'+fmtMoney(pending)+'</div><div class="stat-box__label">En attente</div></div><div class="stat-box"><div class="stat-box__val" style="color:var(--danger)">'+fmtMoney(overdue)+'</div><div class="stat-box__label">En retard</div></div><div class="stat-box"><div class="stat-box__val" style="color:var(--warn)">'+fmtMoney(expenses)+'</div><div class="stat-box__label">Dépenses ACCI</div></div></div><div class="stat-row"><div class="stat-box"><div class="stat-box__val">'+fmtMoney(paid-expenses)+'</div><div class="stat-box__label">Résultat net ACCI</div></div></div>';
});

/* 40. invoices.tax */
RA("invoices.tax",function(){
  var inv=S.invoices.where(function(i){return i.status==="Payé";});
  var totalTax=inv.reduce(function(s,i){return s+(i.tax||0);},0);
  var totalHT=inv.reduce(function(s,i){return s+(i.subtotal||0);},0);
  return'<div class="stat-row"><div class="stat-box"><div class="stat-box__val">'+fmtMoney(totalHT)+'</div><div class="stat-box__label">Total HT ACCI</div></div><div class="stat-box"><div class="stat-box__val">'+fmtMoney(totalTax)+'</div><div class="stat-box__label">TVA collectée</div></div><div class="stat-box"><div class="stat-box__val">'+(localStorage.getItem("acci_tax")||"18")+'%</div><div class="stat-box__label">Taux TVA</div></div></div>';
});

/* 41. invoices.credits */
RC("invoices.credits",S.creditNotes,{ic:"📝",em:"Aucun avoir ACCI émis.",cs:[{k:"number",l:"N°",b:true},{k:"customerId",l:"Membre",fn:function(v){var c=S.customers.get(v);return c?c.name:"\u2014";}},{k:"amount",l:"Montant",fn:function(v){return fmtMoney(v);}},{k:"date",l:"Date",fn:fmtDate}],fs:[{n:"number",l:"N°"},{n:"customerId",l:"Membre ACCI",t:"customer"},{n:"amount",l:"Montant",t:"number"},{n:"reason",l:"Motif",t:"textarea",rows:2},{n:"date",l:"Date",t:"date"}],df:{number:"",customerId:"",amount:0,reason:"",date:todayISO()},sk:["number"]});

/* 42. invoices.recurring */
RC("invoices.recurring",S.recurring,{ic:"🔄",em:"Aucune cotisation récurrente ACCI. Configurez les adhésions annuelles et abonnements.",cs:[{k:"name",l:"Nom",b:true},{k:"frequency",l:"Fréquence"},{k:"amount",l:"Montant",fn:function(v){return fmtMoney(v);}},{k:"nextDate",l:"Prochaine",fn:fmtDate}],fs:[{n:"name",l:"Nom *",rq:true},{n:"frequency",l:"Fréquence",t:"select",o:["Mensuel","Trimestriel","Annuel"]},{n:"amount",l:"Montant",t:"number"},{n:"customerId",l:"Membre ACCI",t:"customer"},{n:"nextDate",l:"Prochaine date",t:"date"}],df:{name:"",frequency:"Annuel",amount:0,customerId:"",nextDate:""},sk:["name"]});

/* 43. invoices.calendar */
RA("invoices.calendar",function(){return calendarView(S.invoices.all().map(function(i){return{date:i.dueDate||i.issueDate,label:i.number+" ("+fmtMoney(i.total)+")"};}).concat(S.recurring.all().map(function(r){return{date:r.nextDate,label:"🔄 "+r.name};})));});

/* ---- MARKETING (8 sections) ---- */
/* 44. marketing.campaigns */
RC("marketing.campaigns",S.campaigns,{ic:"📣",em:"Aucune campagne de sensibilisation ACCI. Lancez des campagnes pour promouvoir un usage responsable du numérique en Côte d'Ivoire !",cs:[{k:"name",l:"Nom",b:true},{k:"status",l:"Statut",bg:true},{k:"channel",l:"Canal"},{k:"startDate",l:"Début",fn:fmtDate},{k:"endDate",l:"Fin",fn:fmtDate}],fs:[{n:"name",l:"Nom *",rq:true},{n:"status",l:"Statut",t:"select",o:CAMPAIGN_STATUSES},{n:"channel",l:"Canal",t:"select",o:["E-mail","Réseaux sociaux","SMS","Web","Terrain","Autre"]},{n:"startDate",l:"Début",t:"date"},{n:"endDate",l:"Fin",t:"date"},{n:"description",l:"Description",t:"textarea",rows:3}],df:{name:"",status:"Brouillon",channel:"Réseaux sociaux",startDate:todayISO(),endDate:"",description:""},sk:["name","channel"]});

/* 45. marketing.manager */
RA("marketing.manager",function(){
  var c=S.campaigns.all();
  var byStatus={};CAMPAIGN_STATUSES.forEach(function(s){byStatus[s]=c.filter(function(x){return x.status===s;}).length;});
  return'<div class="banner banner--info" style="margin-bottom:14px">Gestionnaire des campagnes de sensibilisation ACCI — Pilier Sensibiliser.</div>'+
    '<div class="stat-row"><div class="stat-box"><div class="stat-box__val">'+c.length+'</div><div class="stat-box__label">Total campagnes ACCI</div></div>'+CAMPAIGN_STATUSES.map(function(s){return'<div class="stat-box"><div class="stat-box__val">'+byStatus[s]+'</div><div class="stat-box__label">'+s+'</div></div>';}).join("")+'</div>';
});

/* 46. marketing.templates */
RC("marketing.templates",S.emailTpl,{ic:"✉️",em:"Aucun modèle e-mail ACCI. Créez des modèles pour vos campagnes de sensibilisation.",cs:[{k:"name",l:"Nom",b:true},{k:"subject",l:"Objet",mx:40},{k:"createdAt",l:"Date",fn:fmtDate}],fs:[{n:"name",l:"Nom *",rq:true},{n:"subject",l:"Objet"},{n:"body",l:"Contenu",t:"textarea",rows:6}],df:{name:"",subject:"",body:""},sk:["name","subject"]});

/* 47. marketing.subscribers */
RC("marketing.subscribers",S.subscribers,{ic:"📧",em:"Aucun abonné aux communications ACCI. Développez votre audience pour la sensibilisation !",cs:[{k:"email",l:"E-mail",b:true},{k:"name",l:"Nom"},{k:"status",l:"Statut",bg:true},{k:"createdAt",l:"Date",fn:fmtDate}],fs:[{n:"email",l:"E-mail *",rq:true},{n:"name",l:"Nom"},{n:"status",l:"Statut",t:"select",o:["Actif","Désabonné"]}],df:{email:"",name:"",status:"Actif"},sk:["email","name"]});

/* 48. marketing.calendar */
RA("marketing.calendar",function(){return calendarView(S.campaigns.all().map(function(c){return{date:c.startDate,label:"📣 "+c.name};}));});

/* 49. marketing.social */
RC("marketing.social",S.socialPosts,{ic:"📱",em:"Aucun post ACCI sur les réseaux sociaux. Planifiez du contenu pour sensibiliser le public ivoirien !",cs:[{k:"platform",l:"Plateforme",bg:true},{k:"content",l:"Contenu",mx:50},{k:"scheduledDate",l:"Planifié",fn:fmtDate},{k:"status",l:"Statut",bg:true}],fs:[{n:"platform",l:"Plateforme",t:"select",o:["Facebook","Instagram","X (Twitter)","TikTok","YouTube","LinkedIn"]},{n:"content",l:"Contenu *",rq:true,t:"textarea",rows:3},{n:"scheduledDate",l:"Date planifiée",t:"date"},{n:"status",l:"Statut",t:"select",o:["Brouillon","Planifié","Publié"]}],df:{platform:"Facebook",content:"",scheduledDate:todayISO(),status:"Brouillon"},sk:["content","platform"]});

/* 50. marketing.analytics */
RA("marketing.analytics",function(){
  var c=S.campaigns.all(),subs=S.subscribers.all();
  return'<div class="banner banner--info" style="margin-bottom:14px">Analytique des campagnes de sensibilisation ACCI — mesurer l\'impact de nos actions.</div>'+
    '<div class="stat-row"><div class="stat-box"><div class="stat-box__val">'+c.length+'</div><div class="stat-box__label">Campagnes ACCI</div></div><div class="stat-box"><div class="stat-box__val">'+subs.filter(function(s){return s.status==="Actif";}).length+'</div><div class="stat-box__label">Abonnés actifs</div></div><div class="stat-box"><div class="stat-box__val">'+S.socialPosts.count()+'</div><div class="stat-box__label">Posts sociaux</div></div></div>'+
    '<section class="panel"><div class="panel__head"><h2 class="panel__title">Campagnes par canal</h2></div>'+chartBars(["E-mail","Réseaux sociaux","SMS","Web","Terrain","Autre"].map(function(ch){return{label:ch,val:c.filter(function(x){return x.channel===ch;}).length};}))+'</section>';
});

/* 51. marketing.landing */
RC("marketing.landing",S.landingPages,{ic:"🌐",em:"Aucune page de destination ACCI. Créez des pages pour vos campagnes de sensibilisation.",cs:[{k:"name",l:"Nom",b:true},{k:"url",l:"URL",mx:40},{k:"status",l:"Statut",bg:true},{k:"visits",l:"Visites"}],fs:[{n:"name",l:"Nom *",rq:true},{n:"url",l:"URL",ph:"https://..."},{n:"status",l:"Statut",t:"select",o:["Brouillon","Active","Archivée"]},{n:"visits",l:"Visites",t:"number"}],df:{name:"",url:"",status:"Brouillon",visits:0},sk:["name","url"]});

/* ---- PROJECTS (6 sections) ---- */
/* 52. projects.list */
RC("projects.list",S.projects,{ic:"📁",em:"Aucun projet ACCI. Lancez des initiatives pour un numérique responsable en Côte d'Ivoire !",cs:[{k:"name",l:"Projet",b:true},{k:"status",l:"Statut",bg:true},{k:"startDate",l:"Début",fn:fmtDate},{k:"endDate",l:"Fin",fn:fmtDate}],fs:[{n:"name",l:"Nom *",rq:true},{n:"description",l:"Description",t:"textarea",rows:3},{n:"status",l:"Statut",t:"select",o:PROJECT_STATUSES},{n:"startDate",l:"Début",t:"date"},{n:"endDate",l:"Fin",t:"date"}],df:{name:"",description:"",status:"Planifié",startDate:todayISO(),endDate:""},sk:["name","description"]});

/* 53. projects.tasks */
RC("projects.tasks",S.tasks,{ic:"✅",em:"Aucune tâche ACCI. Créez des tâches pour faire avancer les projets de l'association.",cs:[{k:"title",l:"Tâche",b:true},{k:"status",l:"Statut",bg:true},{k:"priority",l:"Priorité",bg:true},{k:"dueDate",l:"Échéance",fn:fmtDate}],fs:[{n:"title",l:"Titre *",rq:true},{n:"description",l:"Description",t:"textarea",rows:2},{n:"status",l:"Statut",t:"select",o:TASK_STATUSES},{n:"priority",l:"Priorité",t:"select",o:TASK_PRIORITIES},{n:"dueDate",l:"Échéance",t:"date"},{n:"assignee",l:"Assigné à"}],df:{title:"",description:"",status:"À faire",priority:"Moyenne",dueDate:"",assignee:""},sk:["title","description"]});

/* 54. projects.calendar */
RA("projects.calendar",function(){return calendarView(S.tasks.all().map(function(t){return{date:t.dueDate,label:"✅ "+t.title};}).concat(S.milestones.all().map(function(m){return{date:m.dueDate,label:"🏁 "+m.name};})));});

/* 55. projects.time */
RC("projects.time",S.timelogs,{ic:"⏱️",em:"Aucun temps enregistré. Suivez le temps consacré aux projets ACCI.",cs:[{k:"task",l:"Tâche",b:true},{k:"hours",l:"Heures"},{k:"date",l:"Date",fn:fmtDate},{k:"notes",l:"Notes",mx:40}],fs:[{n:"task",l:"Tâche *",rq:true},{n:"hours",l:"Heures",t:"number"},{n:"date",l:"Date",t:"date"},{n:"notes",l:"Notes",t:"textarea",rows:2}],df:{task:"",hours:0,date:todayISO(),notes:""},sk:["task","notes"]});

/* 56. projects.milestones */
RC("projects.milestones",S.milestones,{ic:"🏁",em:"Aucun jalon ACCI. Définissez les étapes clés de vos projets d'association.",cs:[{k:"name",l:"Jalon",b:true},{k:"status",l:"Statut",bg:true},{k:"dueDate",l:"Échéance",fn:fmtDate}],fs:[{n:"name",l:"Nom *",rq:true},{n:"status",l:"Statut",t:"select",o:["Planifié","En cours","Atteint","Annulé"]},{n:"dueDate",l:"Échéance",t:"date"},{n:"description",l:"Description",t:"textarea",rows:2}],df:{name:"",status:"Planifié",dueDate:"",description:""},sk:["name"]});

/* 57. projects.templates */
RC("projects.templates",S.projectTpl,{ic:"📋",em:"Aucun modèle de projet ACCI. Créez des modèles pour standardiser vos initiatives.",cs:[{k:"name",l:"Nom",b:true},{k:"description",l:"Description",mx:50}],fs:[{n:"name",l:"Nom *",rq:true},{n:"description",l:"Description",t:"textarea",rows:3}],df:{name:"",description:""},sk:["name"]});

/* ---- COMMUNICATION (6 sections) ---- */
/* 58. comms.email */
RC("comms.email",S.emails,{ic:"✉️",em:"Aucun e-mail ACCI envoyé. Communiquez avec vos membres et partenaires.",cs:[{k:"to",l:"Destinataire",b:true},{k:"subject",l:"Objet",mx:40},{k:"status",l:"Statut",bg:true},{k:"date",l:"Date",fn:fmtDate}],fs:[{n:"to",l:"Destinataire *",rq:true},{n:"subject",l:"Objet"},{n:"body",l:"Corps",t:"textarea",rows:4},{n:"status",l:"Statut",t:"select",o:["Brouillon","Envoyé"]},{n:"date",l:"Date",t:"date"}],df:{to:"",subject:"",body:"",status:"Brouillon",date:todayISO()},sk:["to","subject"]});

/* 59. comms.sms */
RC("comms.sms",S.sms,{ic:"💬",em:"Aucun SMS ACCI envoyé. Utilisez le SMS pour les rappels et alertes aux membres.",cs:[{k:"to",l:"Destinataire",b:true},{k:"message",l:"Message",mx:50},{k:"status",l:"Statut",bg:true},{k:"date",l:"Date",fn:fmtDate}],fs:[{n:"to",l:"Destinataire *",rq:true},{n:"message",l:"Message *",rq:true,t:"textarea",rows:2},{n:"status",l:"Statut",t:"select",o:["Brouillon","Envoyé"]},{n:"date",l:"Date",t:"date"}],df:{to:"",message:"",status:"Brouillon",date:todayISO()},sk:["to","message"]});

/* 60. comms.calls */
RC("comms.calls",S.calls,{ic:"📞",em:"Aucun appel ACCI enregistré. Suivez les échanges téléphoniques avec les membres.",cs:[{k:"contact",l:"Contact",b:true},{k:"direction",l:"Direction",bg:true},{k:"duration",l:"Durée (min)"},{k:"date",l:"Date",fn:fmtDate}],fs:[{n:"contact",l:"Contact *",rq:true},{n:"direction",l:"Direction",t:"select",o:["Entrant","Sortant"]},{n:"duration",l:"Durée (min)",t:"number"},{n:"date",l:"Date",t:"date"},{n:"notes",l:"Notes",t:"textarea",rows:2}],df:{contact:"",direction:"Sortant",duration:0,date:todayISO(),notes:""},sk:["contact"]});

/* 61. comms.meetings */
RC("comms.meetings",S.meetings,{ic:"📅",em:"Aucune réunion ACCI planifiée. Organisez des réunions d'équipe ou avec les membres.",cs:[{k:"title",l:"Titre",b:true},{k:"date",l:"Date",fn:fmtDate},{k:"time",l:"Heure"},{k:"participants",l:"Participants",mx:30}],fs:[{n:"title",l:"Titre *",rq:true},{n:"date",l:"Date",t:"date"},{n:"time",l:"Heure",ph:"14:00"},{n:"participants",l:"Participants"},{n:"location",l:"Lieu"},{n:"notes",l:"Notes",t:"textarea",rows:2}],df:{title:"",date:todayISO(),time:"",participants:"",location:"",notes:""},sk:["title","participants"]});

/* 62. comms.announcements */
RC("comms.announcements",S.announcements,{ic:"📢",em:"Aucune annonce ACCI. Publiez des annonces pour informer les membres et le public.",cs:[{k:"title",l:"Titre",b:true},{k:"priority",l:"Priorité",bg:true},{k:"createdAt",l:"Date",fn:fmtDate}],fs:[{n:"title",l:"Titre *",rq:true},{n:"content",l:"Contenu *",rq:true,t:"textarea",rows:4},{n:"priority",l:"Priorité",t:"select",o:["Basse","Moyenne","Haute"]}],df:{title:"",content:"",priority:"Moyenne"},sk:["title","content"]});

/* 63. comms.messaging */
RC("comms.messaging",S.messages,{ic:"💬",em:"Aucun message interne ACCI.",cs:[{k:"from",l:"De",b:true},{k:"to",l:"À"},{k:"content",l:"Message",mx:50},{k:"createdAt",l:"Date",fn:fmtDate}],fs:[{n:"from",l:"De *",rq:true},{n:"to",l:"À *",rq:true},{n:"content",l:"Message *",rq:true,t:"textarea",rows:3}],df:{from:"",to:"",content:""},sk:["from","to","content"]});

/* ---- TEAM (6 sections) ---- */
/* 64. team.directory */
RC("team.directory",S.teamMembers,{ic:"👤",em:"Aucun membre dans l'équipe ACCI. Ajoutez les agents et administrateurs de l'association.",cs:[{k:"name",l:"Nom",b:true},{k:"role",l:"Rôle"},{k:"department",l:"Département"},{k:"email",l:"E-mail"},{k:"status",l:"Statut",bg:true}],fs:[{n:"name",l:"Nom *",rq:true},{n:"role",l:"Rôle",t:"select",o:["Administrateur","Agent","Manager","Stagiaire"]},{n:"department",l:"Département",t:"select",o:["Direction","Support","Sensibilisation","Formation","Protection","Plaidoyer","Technique"]},{n:"email",l:"E-mail"},{n:"phone",l:"Téléphone"},{n:"status",l:"Statut",t:"select",o:["Actif","Inactif"]}],df:{name:"",role:"Agent",department:"Support",email:"",phone:"",status:"Actif"},sk:["name","email","role"]});

/* 65. team.performance */
RC("team.performance",S.performance,{ic:"⭐",em:"Aucune évaluation de performance ACCI. Évaluez les contributions de l'équipe aux 4 piliers.",cs:[{k:"memberName",l:"Membre équipe",b:true},{k:"period",l:"Période"},{k:"score",l:"Score"},{k:"createdAt",l:"Date",fn:fmtDate}],fs:[{n:"memberName",l:"Membre *",rq:true},{n:"period",l:"Période",ph:"Q2 2026"},{n:"score",l:"Score (1-10)",t:"number"},{n:"strengths",l:"Points forts",t:"textarea",rows:2},{n:"improvements",l:"Axes amélioration",t:"textarea",rows:2}],df:{memberName:"",period:"",score:0,strengths:"",improvements:""},sk:["memberName"]});

/* 66. team.attendance */
RC("team.attendance",S.attendance,{ic:"📋",em:"Aucun enregistrement de présence ACCI.",cs:[{k:"memberName",l:"Membre équipe",b:true},{k:"date",l:"Date",fn:fmtDate},{k:"status",l:"Statut",bg:true},{k:"hours",l:"Heures"}],fs:[{n:"memberName",l:"Membre *",rq:true},{n:"date",l:"Date",t:"date"},{n:"status",l:"Statut",t:"select",o:["Présent","Absent","Retard","Télétravail"]},{n:"hours",l:"Heures",t:"number"}],df:{memberName:"",date:todayISO(),status:"Présent",hours:8},sk:["memberName"]});

/* 67. team.leaves */
RC("team.leaves",S.leaves,{ic:"🏖️",em:"Aucune demande de congé dans l'équipe ACCI.",cs:[{k:"memberName",l:"Membre équipe",b:true},{k:"type",l:"Type"},{k:"startDate",l:"Début",fn:fmtDate},{k:"endDate",l:"Fin",fn:fmtDate},{k:"status",l:"Statut",bg:true}],fs:[{n:"memberName",l:"Membre *",rq:true},{n:"type",l:"Type",t:"select",o:LEAVE_TYPES},{n:"startDate",l:"Début",t:"date"},{n:"endDate",l:"Fin",t:"date"},{n:"status",l:"Statut",t:"select",o:LEAVE_STATUSES},{n:"reason",l:"Motif",t:"textarea",rows:2}],df:{memberName:"",type:"Congé payé",startDate:todayISO(),endDate:"",status:"En attente",reason:""},sk:["memberName"]});

/* 68. team.training */
RC("team.training",S.trainings,{ic:"🎓",em:"Aucune formation équipe ACCI planifiée. Renforcez les compétences de l'équipe — Pilier Former.",cs:[{k:"name",l:"Formation",b:true},{k:"provider",l:"Formateur"},{k:"date",l:"Date",fn:fmtDate},{k:"status",l:"Statut",bg:true}],fs:[{n:"name",l:"Nom *",rq:true},{n:"provider",l:"Formateur"},{n:"date",l:"Date",t:"date"},{n:"duration",l:"Durée"},{n:"status",l:"Statut",t:"select",o:["Planifié","En cours","Terminé"]},{n:"description",l:"Description",t:"textarea",rows:2}],df:{name:"",provider:"",date:todayISO(),duration:"",status:"Planifié",description:""},sk:["name"]});

/* 69. team.certifications */
RC("team.certifications",S.certifications,{ic:"🏅",em:"Aucune certification de l'équipe ACCI enregistrée.",cs:[{k:"name",l:"Certification",b:true},{k:"memberName",l:"Membre"},{k:"issueDate",l:"Obtenue le",fn:fmtDate},{k:"expiryDate",l:"Expire le",fn:fmtDate}],fs:[{n:"name",l:"Nom *",rq:true},{n:"memberName",l:"Membre"},{n:"issuer",l:"Organisme"},{n:"issueDate",l:"Date obtention",t:"date"},{n:"expiryDate",l:"Date expiration",t:"date"}],df:{name:"",memberName:"",issuer:"",issueDate:todayISO(),expiryDate:""},sk:["name","memberName"]});

/* ---- DOCUMENTS (5 sections) ---- */
/* 70. docs.library */
RC("docs.library",S.docLib,{ic:"📄",em:"Bibliothèque ACCI vide. Stockez ici les documents officiels, chartes et supports de formation.",cs:[{k:"name",l:"Nom",b:true},{k:"type",l:"Type"},{k:"size",l:"Taille"},{k:"createdAt",l:"Date",fn:fmtDate}],fs:[{n:"name",l:"Nom *",rq:true},{n:"type",l:"Type",t:"select",o:["PDF","Word","Excel","Image","Autre"]},{n:"size",l:"Taille",ph:"2.5 Mo"},{n:"description",l:"Description",t:"textarea",rows:2}],df:{name:"",type:"PDF",size:"",description:""},sk:["name","type"]});

/* 71. docs.templates */
RC("docs.templates",S.docTpl,{ic:"📋",em:"Aucun modèle de document ACCI. Créez des modèles de chartes, contrats et lettres.",cs:[{k:"name",l:"Nom",b:true},{k:"category",l:"Catégorie"},{k:"createdAt",l:"Date",fn:fmtDate}],fs:[{n:"name",l:"Nom *",rq:true},{n:"category",l:"Catégorie",t:"select",o:["Charte ACCI","Contrat","Lettre","Rapport","Autre"]},{n:"content",l:"Contenu",t:"textarea",rows:4}],df:{name:"",category:"Autre",content:""},sk:["name"]});

/* 72. docs.contracts */
RC("docs.contracts",S.contracts,{ic:"📃",em:"Aucun contrat ACCI enregistré. Gérez les contrats de partenariat et de service.",cs:[{k:"title",l:"Titre",b:true},{k:"customerId",l:"Membre/Partenaire",fn:function(v){var c=S.customers.get(v);return c?c.name:"\u2014";}},{k:"status",l:"Statut",bg:true},{k:"startDate",l:"Début",fn:fmtDate},{k:"endDate",l:"Fin",fn:fmtDate}],fs:[{n:"title",l:"Titre *",rq:true},{n:"customerId",l:"Membre/Partenaire",t:"customer"},{n:"status",l:"Statut",t:"select",o:CONTRACT_STATUSES},{n:"startDate",l:"Début",t:"date"},{n:"endDate",l:"Fin",t:"date"},{n:"value",l:"Valeur",t:"number"},{n:"notes",l:"Notes",t:"textarea",rows:2}],df:{title:"",customerId:"",status:"Brouillon",startDate:todayISO(),endDate:"",value:0,notes:""},sk:["title"]});

/* 73. docs.signatures */
RC("docs.signatures",S.signatures,{ic:"✍️",em:"Aucune signature en attente. Suivez les signatures de chartes et contrats ACCI.",cs:[{k:"document",l:"Document",b:true},{k:"signer",l:"Signataire"},{k:"status",l:"Statut",bg:true},{k:"date",l:"Date",fn:fmtDate}],fs:[{n:"document",l:"Document *",rq:true},{n:"signer",l:"Signataire *",rq:true},{n:"status",l:"Statut",t:"select",o:["En attente","Signé","Refusé"]},{n:"date",l:"Date",t:"date"}],df:{document:"",signer:"",status:"En attente",date:todayISO()},sk:["document","signer"]});

/* 74. docs.sharing */
RC("docs.sharing",S.shares,{ic:"🔗",em:"Aucun partage de document ACCI. Partagez des ressources avec les membres et partenaires.",cs:[{k:"name",l:"Fichier",b:true},{k:"sharedWith",l:"Partagé avec"},{k:"permission",l:"Permission"},{k:"createdAt",l:"Date",fn:fmtDate}],fs:[{n:"name",l:"Nom fichier *",rq:true},{n:"sharedWith",l:"Partagé avec"},{n:"permission",l:"Permission",t:"select",o:["Lecture","Écriture","Admin"]}],df:{name:"",sharedWith:"",permission:"Lecture"},sk:["name","sharedWith"]});

/* ---- REPORTS (8 sections) ---- */
/* 75. reports.predefined */
RA("reports.predefined",function(){
  var cards=[{id:"revenue",ic:"📈",t:"Revenu mensuel ACCI",d:"Cotisations et services encaissés par mois."},{id:"pipeline",ic:"💰",t:"Pipeline adhésions",d:"Valeur des adhésions par étape."},{id:"tickets",ic:"🎫",t:"Signalements & demandes",d:"Par statut et priorité — Protéger."},{id:"growth",ic:"👥",t:"Croissance membres",d:"Nouveaux membres ACCI par mois."},{id:"services",ic:"⚙️",t:"Revenu par service",d:"Former, Protéger, Plaider."},{id:"overdue",ic:"⚠️",t:"Cotisations en retard",d:"Factures impayées des membres."}];
  return'<div class="banner banner--info" style="margin-bottom:14px">Rapports prédéfinis ACCI — Piliers : Sensibiliser, Former, Protéger, Plaider.</div><div class="card-grid">'+cards.map(function(c){return'<div class="wcard" data-rpt="'+c.id+'"><div class="wcard__icon">'+c.ic+'</div><h3>'+c.t+'</h3><p>'+c.d+'</p></div>';}).join("")+'</div><div id="rpt-out"></div>';
},function(){$$("[data-rpt]").forEach(function(c){c.addEventListener("click",function(){showReport(c.getAttribute("data-rpt"));});});});

/* 76. reports.builder */
RA("reports.builder",function(){return'<section class="panel"><div class="panel__head"><h2 class="panel__title">🔨 Constructeur de rapports ACCI</h2></div><p class="muted">Sélectionnez une source de données et les métriques pour analyser l\'activité ACCI.</p><div class="fgrid">'+ffield("Source",'<select id="rb-src"><option>Membres</option><option>Demandes</option><option>Adhésions</option><option>Cotisations</option></select>')+ffield("Regrouper par",'<select id="rb-group"><option>Statut</option><option>Mois</option><option>Ville</option></select>')+'</div><div class="btnrow"><button class="abtn abtn--primary abtn--sm" id="rb-gen">Générer</button></div><div id="rb-out" style="margin-top:14px"></div></section>';},function(){
  var btn=$("#rb-gen");if(btn)btn.addEventListener("click",function(){
    var src=$("#rb-src").value,grp=$("#rb-group").value;
    var data=src==="Membres"?S.customers.all():src==="Demandes"?S.tickets.all():src==="Adhésions"?S.deals.all():S.invoices.all();
    var grouped={};data.forEach(function(x){var k=grp==="Statut"?(x.status||x.stage||"\u2014"):grp==="Mois"?(x.createdAt||"").slice(0,7):(x.city||"\u2014");grouped[k]=(grouped[k]||0)+1;});
    var out=$("#rb-out");out.innerHTML=chartBars(Object.keys(grouped).map(function(k){return{label:k,val:grouped[k]};}));
  });
});

/* 77. reports.sales */
RA("reports.sales",function(){var d=S.deals.all();return'<section class="panel"><div class="panel__head"><h2 class="panel__title">Analytique adhésions & partenariats ACCI</h2></div>'+chartBars(DEAL_STAGES.map(function(s){var sd=d.filter(function(x){return x.stage===s;});return{label:s,val:sd.reduce(function(a,x){return a+(x.value||0);},0),fmt:fmtMoney(sd.reduce(function(a,x){return a+(x.value||0);},0)),badge:true};}))+'</section>';});

/* 78. reports.customerAnalytics */
RA("reports.customerAnalytics",function(){var c=S.customers.all();var approved=c.filter(function(x){return x.approved;}).length;return'<div class="stat-row"><div class="stat-box"><div class="stat-box__val">'+c.length+'</div><div class="stat-box__label">Total membres ACCI</div></div><div class="stat-box"><div class="stat-box__val">'+c.filter(function(x){return x.status==="Actif";}).length+'</div><div class="stat-box__label">Actifs</div></div><div class="stat-box"><div class="stat-box__val">'+approved+'</div><div class="stat-box__label">Portails approuvés</div></div><div class="stat-box"><div class="stat-box__val">'+c.filter(function(x){return x.type==="Entreprise";}).length+'</div><div class="stat-box__label">Partenaires (Entreprises)</div></div></div><section class="panel"><div class="panel__head"><h2 class="panel__title">Par domaine de création</h2></div>'+chartBars(CATEGORIES.map(function(cat){return{label:cat,val:c.filter(function(x){return(x.tags||[]).indexOf(cat)!==-1;}).length};}))+'</section>';});

/* 79. reports.financial */
RA("reports.financial",function(){var inv=S.invoices.all();var paid=inv.filter(function(i){return i.status==="Payé";}).reduce(function(s,i){return s+(i.total||0);},0);var pend=inv.filter(function(i){return i.status==="Envoyé"||i.status==="En retard";}).reduce(function(s,i){return s+(i.total||0);},0);return'<div class="banner banner--info" style="margin-bottom:14px">Rapport financier ACCI — cotisations et services.</div><div class="stat-row"><div class="stat-box"><div class="stat-box__val">'+fmtMoney(paid)+'</div><div class="stat-box__label">Encaissé</div></div><div class="stat-box"><div class="stat-box__val">'+fmtMoney(pend)+'</div><div class="stat-box__label">En attente</div></div><div class="stat-box"><div class="stat-box__val">'+inv.length+'</div><div class="stat-box__label">Documents</div></div></div><section class="panel"><div class="panel__head"><h2 class="panel__title">Par statut</h2></div>'+chartBars(INVOICE_STATUSES.map(function(s){return{label:s,val:inv.filter(function(i){return i.status===s;}).length,badge:true};}))+'</section>';});

/* 80. reports.support */
RA("reports.support",function(){var t=S.tickets.all();return'<div class="banner banner--info" style="margin-bottom:14px">Rapport support ACCI — piliers Protéger & Plaider.</div><section class="panel"><div class="panel__head"><h2 class="panel__title">Demandes & signalements par statut</h2></div>'+chartBars(TICKET_STATUSES.map(function(s){return{label:s,val:t.filter(function(x){return x.status===s;}).length,badge:true};}))+'</section>';});

/* 81. reports.activityR */
RA("reports.activityR",function(){var a=S.audit.all();var byEntity={};a.forEach(function(x){byEntity[x.entity]=(byEntity[x.entity]||0)+1;});return'<section class="panel"><div class="panel__head"><h2 class="panel__title">Activité ACCI par entité</h2></div>'+chartBars(Object.keys(byEntity).map(function(k){return{label:k,val:byEntity[k]};}))+'</section>';});

/* 82. reports.export */
RA("reports.export",function(){
  return'<section class="panel"><div class="panel__head"><h2 class="panel__title">Centre d\'export ACCI</h2></div><p class="muted">Exportez toutes les données du CRM ACCI.</p><div class="btnrow"><button class="abtn abtn--primary abtn--sm xp" data-t="customers">Membres ('+S.customers.count()+')</button><button class="abtn abtn--ghost abtn--sm xp" data-t="tickets">Demandes ('+S.tickets.count()+')</button><button class="abtn abtn--ghost abtn--sm xp" data-t="deals">Adhésions ('+S.deals.count()+')</button><button class="abtn abtn--ghost abtn--sm xp" data-t="invoices">Cotisations ('+S.invoices.count()+')</button><button class="abtn abtn--ghost abtn--sm" id="xp-all">Tout (JSON)</button></div></section>';
},function(){$$(".xp").forEach(function(b){b.addEventListener("click",function(){var t=b.getAttribute("data-t");exportCSV(t);});});var a=$("#xp-all");if(a)a.addEventListener("click",exportFullJSON);});

/* ---- PRODUCTIVITY (6 sections) ---- */
/* 83. productivity.notes */
RC("productivity.notes",S.notes,{ic:"📝",em:"Aucune note ACCI. Prenez des notes sur les réunions, idées et actions de l'association.",cs:[{k:"title",l:"Titre",b:true},{k:"content",l:"Contenu",mx:60},{k:"createdAt",l:"Date",fn:fmtDate}],fs:[{n:"title",l:"Titre *",rq:true},{n:"content",l:"Contenu",t:"textarea",rows:6}],df:{title:"",content:""},sk:["title","content"]});

/* 84. productivity.reminders */
RC("productivity.reminders",S.reminders,{ic:"🔔",em:"Aucun rappel ACCI. Programmez des rappels pour les échéances et actions à mener.",cs:[{k:"title",l:"Rappel",b:true},{k:"dueDate",l:"Date",fn:fmtDate},{k:"priority",l:"Priorité",bg:true},{k:"done",l:"Fait",fn:function(v){return v?"✅":"\u2014";}}],fs:[{n:"title",l:"Titre *",rq:true},{n:"dueDate",l:"Date",t:"date"},{n:"priority",l:"Priorité",t:"select",o:["Basse","Moyenne","Haute"]},{n:"notes",l:"Notes",t:"textarea",rows:2}],df:{title:"",dueDate:todayISO(),priority:"Moyenne",notes:"",done:false},sk:["title"]});

/* 85. productivity.actions */
RA("productivity.actions",function(){
  var actions=[
    {ic:"👥",label:"Nouveau membre ACCI"},
    {ic:"🎫",label:"Nouveau signalement"},
    {ic:"💰",label:"Nouvelle adhésion"},
    {ic:"📄",label:"Nouvelle cotisation"},
    {ic:"📝",label:"Nouvelle note"},
    {ic:"📅",label:"Nouvelle réunion ACCI"}
  ];
  return'<div class="banner banner--info" style="margin-bottom:14px">Actions rapides ACCI — accédez directement aux formulaires de création.</div><div class="card-grid">'+actions.map(function(a,i){return'<div class="wcard qa" data-idx="'+i+'"><div class="wcard__icon">'+a.ic+'</div><h3>'+a.label+'</h3></div>';}).join("")+'</div>';
},function(){$$(".qa").forEach(function(c){c.addEventListener("click",function(){var actions=[function(){openCustomerEdit(null);},function(){openTicketEdit(null);},function(){state.sub.pipeline="kanban";go("pipeline");},function(){state.sub.invoices="list";go("invoices");},function(){state.sub.productivity="notes";go("productivity");},function(){state.sub.comms="meetings";go("comms");}];var i=parseInt(c.getAttribute("data-idx"),10);if(actions[i])actions[i]();});});});

/* 86. productivity.favorites */
RC("productivity.favorites",S.favorites,{ic:"⭐",em:"Aucun favori ACCI. Marquez vos membres, tickets ou pages fréquemment consultés.",cs:[{k:"label",l:"Nom",b:true},{k:"type",l:"Type"},{k:"createdAt",l:"Date",fn:fmtDate}],fs:[{n:"label",l:"Nom *",rq:true},{n:"type",l:"Type",t:"select",o:["Membre","Ticket","Adhésion","Cotisation","Page","Autre"]},{n:"reference",l:"Référence"}],df:{label:"",type:"Autre",reference:""},sk:["label"]});

/* 87. productivity.notifications */
RA("productivity.notifications",function(){
  var notifs=S.notifications.all().slice(0,20);
  if(!notifs.length)return'<div class="empty-state"><div class="empty-state__ic">🔔</div><h2>Aucune notification ACCI</h2><p class="muted">Les notifications liées aux activités de l\'association apparaîtront ici.</p></div>';
  return'<div class="timeline">'+notifs.map(function(n){return'<div class="timeline__item"><span class="timeline__icon">🔔</span><div class="timeline__body"><b>'+esc(n.title||"Notification")+'</b><p class="muted">'+esc(n.message||"")+'</p><div class="timeline__date">'+fmtDate(n.createdAt)+'</div></div></div>';}).join("")+'</div>';
});

/* 88. productivity.calendar */
RA("productivity.calendar",function(){return calendarView(S.reminders.all().map(function(r){return{date:r.dueDate,label:"🔔 "+r.title};}).concat(S.meetings.all().map(function(m){return{date:m.date,label:"📅 "+m.title};})).concat(S.tasks.all().filter(function(t){return t.dueDate;}).map(function(t){return{date:t.dueDate,label:"✅ "+t.title};})));});

/* ---- SUCCESS CLIENT (5 sections) ---- */
/* 89. success.onboarding */
RC("success.onboarding",S.onboarding,{ic:"🚀",em:"Aucun onboarding ACCI en cours. Accompagnez les nouveaux membres dans leur intégration à l'association.",cs:[{k:"customerId",l:"Membre",fn:function(v){var c=S.customers.get(v);return c?c.name:"\u2014";}},{k:"stage",l:"Étape",bg:true},{k:"progress",l:"Progression"},{k:"startDate",l:"Début",fn:fmtDate}],fs:[{n:"customerId",l:"Membre ACCI",t:"customer"},{n:"stage",l:"Étape",t:"select",o:["Inscription","Charte ACCI","Formation","Certification","Actif"]},{n:"progress",l:"Progression (%)",t:"number"},{n:"startDate",l:"Début",t:"date"},{n:"notes",l:"Notes",t:"textarea",rows:2}],df:{customerId:"",stage:"Inscription",progress:0,startDate:todayISO(),notes:""},sk:["customerId"]});

/* 90. success.health */
RC("success.health",S.healthScores,{ic:"💚",em:"Aucun score de santé membre ACCI. Évaluez l'engagement des membres envers les piliers de l'association.",cs:[{k:"customerId",l:"Membre",fn:function(v){var c=S.customers.get(v);return c?c.name:"\u2014";}},{k:"score",l:"Score",b:true},{k:"risk",l:"Risque",bg:true},{k:"lastCheck",l:"Dernier contrôle",fn:fmtDate}],fs:[{n:"customerId",l:"Membre ACCI",t:"customer"},{n:"score",l:"Score (1-100)",t:"number"},{n:"risk",l:"Risque",t:"select",o:["Faible","Moyen","Élevé","Critique"]},{n:"lastCheck",l:"Dernier contrôle",t:"date"},{n:"notes",l:"Notes",t:"textarea",rows:2}],df:{customerId:"",score:0,risk:"Faible",lastCheck:todayISO(),notes:""},sk:["customerId"]});

/* 91. success.renewals */
RC("success.renewals",S.renewals,{ic:"🔄",em:"Aucun renouvellement ACCI à suivre. Gérez les renouvellements d'adhésion et de contrats.",cs:[{k:"customerId",l:"Membre",fn:function(v){var c=S.customers.get(v);return c?c.name:"\u2014";}},{k:"type",l:"Type"},{k:"renewalDate",l:"Renouvellement",fn:fmtDate},{k:"status",l:"Statut",bg:true}],fs:[{n:"customerId",l:"Membre ACCI",t:"customer"},{n:"type",l:"Type",t:"select",o:["Adhésion ACCI","Contrat","Certification","Autre"]},{n:"renewalDate",l:"Date renouvellement",t:"date"},{n:"status",l:"Statut",t:"select",o:["Actif","À renouveler","Expiré","Annulé"]},{n:"value",l:"Valeur",t:"number"}],df:{customerId:"",type:"Adhésion ACCI",renewalDate:"",status:"Actif",value:0},sk:["customerId"]});

/* 92. success.churn */
RA("success.churn",function(){
  var c=S.customers.all();
  var inactive=c.filter(function(x){return x.status==="Inactif";});
  var total=c.length;var rate=total?Math.round(inactive.length/total*100):0;
  return'<div class="banner banner--info" style="margin-bottom:14px">Analyse du churn ACCI — identifiez les membres à risque de désengagement.</div>'+
    '<div class="stat-row"><div class="stat-box"><div class="stat-box__val" style="color:var(--danger)">'+rate+'%</div><div class="stat-box__label">Taux de churn ACCI</div><div class="progress-bar"><div class="progress-bar__fill" style="width:'+rate+'%;background:var(--danger)"></div></div></div><div class="stat-box"><div class="stat-box__val">'+inactive.length+'</div><div class="stat-box__label">Membres inactifs</div></div><div class="stat-box"><div class="stat-box__val">'+c.filter(function(x){return x.status==="Actif";}).length+'</div><div class="stat-box__label">Membres actifs</div></div></div>';
});

/* 93. success.goals */
RC("success.goals",S.custGoals,{ic:"🎯",em:"Aucun objectif membre ACCI défini. Fixez des objectifs d'accompagnement alignés avec Sensibiliser, Former, Protéger, Plaider.",cs:[{k:"customerId",l:"Membre",fn:function(v){var c=S.customers.get(v);return c?c.name:"\u2014";}},{k:"goal",l:"Objectif",b:true},{k:"status",l:"Statut",bg:true},{k:"dueDate",l:"Échéance",fn:fmtDate}],fs:[{n:"customerId",l:"Membre ACCI",t:"customer"},{n:"goal",l:"Objectif *",rq:true},{n:"status",l:"Statut",t:"select",o:["En cours","Atteint","Annulé"]},{n:"dueDate",l:"Échéance",t:"date"},{n:"notes",l:"Notes",t:"textarea",rows:2}],df:{customerId:"",goal:"",status:"En cours",dueDate:"",notes:""},sk:["goal"]});

/* ---- ADMINISTRATION (7 sections) ---- */
/* 94. admin.admins — ogou manages all admins */
RA("admin.admins",function(){
  var isSuper=isSuperAdmin();
  var admins=S.admins.all();
  if(!isSuper){
    /* Non-super admins see only their own profile */
    var me=currentAdmin();
    return'<section class="panel"><div class="panel__head"><h2 class="panel__title">Mon profil administrateur</h2></div>'+
      '<div class="drow"><span class="dk">Utilisateur</span><span class="dv"><b>'+esc(me.username)+'</b></span></div>'+
      '<div class="drow"><span class="dk">Nom</span><span class="dv">'+esc(me.name)+'</span></div>'+
      '<div class="drow"><span class="dk">Rôle</span><span class="dv">'+badge(me.role==="super_admin"?"Super Admin":"Admin")+'</span></div>'+
      (me.approvalCode?'<div class="drow"><span class="dk">Code d\'approbation</span><span class="dv"><code style="font-size:15px;letter-spacing:2px;font-weight:700;background:var(--green-l);padding:3px 10px;border-radius:6px">'+esc(me.approvalCode)+'</code></span></div>':'')+
      '<div class="drow"><span class="dk">Modules autorisés</span><span class="dv">'+(me.allowedModules&&me.allowedModules[0]==="*"?"Tous":esc((me.allowedModules||[]).join(", ")))+'</span></div>'+
      '</section><p class="muted">Seul l\'administrateur <b>ogou</b> peut modifier les comptes administrateurs.</p>';
  }
  /* Super admin — full admin management */
  var cards=admins.map(function(a){
    var isS=a.role==="super_admin";
    var modCount=a.allowedModules&&a.allowedModules[0]==="*"?"Tous ("+ALL_MODULES.length+")":((a.allowedModules||[]).length+" / "+ALL_MODULES.length);
    return'<div class="admin-card'+(isS?" admin-card--super":"")+'">'+
      avatar({name:a.name||a.username},40)+
      '<div class="admin-card__info"><h3>'+esc(a.name||a.username)+'</h3><p>@'+esc(a.username)+' · '+(isS?'<span style="color:var(--orange);font-weight:700">👑 Super Admin</span>':'Admin')+
      ' · Modules : '+modCount+'</p></div>'+
      (a.approvalCode?'<span class="admin-card__code">'+esc(a.approvalCode)+'</span>':'')+
      (!isS?'<button class="iact adm-edit" data-id="'+a.id+'" title="Modifier">✎</button><button class="iact iact--del adm-del" data-id="'+a.id+'" title="Supprimer">🗑</button>':'')+
    '</div>';
  }).join("");
  return'<div class="banner banner--info">👑 <b>ogou</b> — Contrôle total du CRM ACCI. Seul ogou peut créer, approuver et configurer les autres administrateurs.</div>'+
    '<div class="filterbar"><span class="filterbar__count">'+admins.length+' administrateur(s)</span><div class="filterbar__right"><button class="abtn abtn--primary abtn--sm" id="adm-add">+ Créer un admin</button></div></div>'+
    cards;
},function(){
  if(!isSuperAdmin())return;
  var addBtn=$("#adm-add");if(addBtn)addBtn.addEventListener("click",function(){openAdminForm(null);});
  $$(".adm-edit").forEach(function(b){b.addEventListener("click",function(){openAdminForm(b.getAttribute("data-id"));});});
  $$(".adm-del").forEach(function(b){b.addEventListener("click",function(){var id=b.getAttribute("data-id");confirmDel(function(){S.admins.remove(id);alog("admin",id,"suppression","");toast("Admin supprimé.");refresh();},"Supprimer cet administrateur ? Il ne pourra plus accéder au CRM.");});});
});

function openAdminForm(id){
  if(!isSuperAdmin())return;
  var a=id?S.admins.get(id):{id:"",username:"",name:"",passHash:"",role:"admin",approved:true,approvalCode:"",allowedModules:[],createdAt:""};
  if(!a)return;
  var isNew=!id;
  var modChecks=ALL_MODULES.map(function(m){
    var checked=a.allowedModules&&(a.allowedModules[0]==="*"||a.allowedModules.indexOf(m)!==-1);
    var modLabel=MODS[m]?MODS[m].title:(m==="inbox"?"Réception":m==="data"?"Import / Export":m);
    return'<label class="perm-item"><input type="checkbox" class="perm-cb" value="'+m+'"'+(checked?" checked":"")+'> '+esc(modLabel)+'</label>';
  }).join("");

  openModal(
    '<div class="modal__head"><h2>'+(isNew?"Créer un administrateur":"Modifier l\'administrateur")+'</h2><button class="modal__x" data-close>&times;</button></div>'+
    '<form id="adm-form" class="modal__body">'+
      '<div class="fgrid">'+
        ffield("Nom complet *",'<input name="name" required value="'+esc(a.name)+'">')+
        ffield("Nom d\'utilisateur *",'<input name="username" required value="'+esc(a.username)+'"'+(id?' readonly style="opacity:0.6"':'')+'>')+
        (isNew?ffield("Mot de passe *",'<input name="password" type="password" required placeholder="Min. 4 caractères">'):ffield("Nouveau mot de passe","<input name=\"password\" type=\"password\" placeholder=\"Laisser vide pour ne pas changer\">"))+
        ffield("Statut",'<select name="approved"><option value="true"'+(a.approved?" selected":"")+'>Approuvé</option><option value="false"'+(!a.approved?" selected":"")+'>Non approuvé</option></select>')+
      '</div>'+
      '<h3 style="margin-top:8px">Modules autorisés</h3>'+
      '<p class="muted" style="margin-bottom:6px">Sélectionnez les sections du CRM auxquelles cet admin aura accès.</p>'+
      '<label class="perm-item" style="background:var(--orange-l);font-weight:700"><input type="checkbox" id="perm-all"'+(a.allowedModules&&a.allowedModules[0]==="*"?" checked":"")+'> ✅ Tous les modules</label>'+
      '<div class="perm-grid" id="perm-grid">'+modChecks+'</div>'+
      '<p class="ferr" id="adm-err" hidden></p>'+
    '</form>'+
    '<div class="modal__foot"><span style="flex:1"></span><button class="abtn abtn--ghost" data-close>Annuler</button>'+
    '<button class="abtn abtn--primary" id="adm-save">'+(isNew?"Créer & Générer le code":"Enregistrer")+'</button></div>',true);

  /* Select all toggle */
  var allCb=$("#perm-all");
  allCb.addEventListener("change",function(){$$(".perm-cb").forEach(function(c){c.checked=allCb.checked;});});

  $("#adm-save").addEventListener("click",function(){
    var f=$("#adm-form");
    var name=f.name.value.trim();
    var username=f.username.value.trim().toLowerCase();
    var pw=f.password.value.trim();
    var approved=f.approved.value==="true";
    var err=$("#adm-err");

    if(!name||!username){err.textContent="Nom et utilisateur obligatoires.";err.hidden=false;return;}
    if(username===SUPER_USER){err.textContent="Le nom ogou est réservé.";err.hidden=false;return;}
    if(isNew&&!pw){err.textContent="Mot de passe obligatoire.";err.hidden=false;return;}
    if(pw&&pw.length<4){err.textContent="Mot de passe : minimum 4 caractères.";err.hidden=false;return;}
    /* Check username uniqueness */
    if(isNew&&S.admins.all().some(function(x){return x.username===username;})){err.textContent="Ce nom d'utilisateur existe déjà.";err.hidden=false;return;}

    /* Gather modules */
    var mods;
    if(allCb.checked){mods=["*"];}
    else{mods=[];$$(".perm-cb").forEach(function(c){if(c.checked)mods.push(c.value);});}
    if(!mods.length&&!allCb.checked){err.textContent="Sélectionnez au moins un module.";err.hidden=false;return;}

    /* Generate approval code for new admins */
    var code=a.approvalCode;
    if(isNew){
      code=genCode();
      while(S.admins.all().some(function(x){return x.approvalCode===code;})||S.customers.all().some(function(x){return x.approvalCode===code;})){code=genCode();}
    }

    var rec={
      id:a.id||uid(),
      username:username,
      name:name,
      passHash:pw?hash(pw):a.passHash,
      role:"admin",
      approved:approved,
      approvalCode:code,
      allowedModules:mods,
      createdAt:a.createdAt||new Date().toISOString()
    };

    if(id){S.admins.update(rec);alog("admin",rec.id,"modification",rec.name);toast("Admin mis à jour.");}
    else{S.admins.add(rec);alog("admin",rec.id,"création",rec.name);}
    closeModal();

    if(isNew){
      /* Show the generated code */
      openModal(
        '<div class="modal__head"><h2>✅ Administrateur créé</h2><button class="modal__x" data-close>&times;</button></div>'+
        '<div class="modal__body" style="text-align:center">'+
          '<p>Le compte <b>'+esc(username)+'</b> a été créé avec succès.</p>'+
          '<p style="margin-top:12px">Code d\'approbation à communiquer :</p>'+
          '<div class="approval-code">'+esc(code)+'</div>'+
          '<p class="muted" style="margin-top:8px">5 lettres + 3 chiffres — ce code est unique et identifie cet administrateur.</p>'+
          '<p style="margin-top:12px"><b>Identifiants de connexion :</b></p>'+
          '<p>Utilisateur : <code>'+esc(username)+'</code><br>Mot de passe : celui que vous avez défini</p>'+
        '</div>'+
        '<div class="modal__foot"><span style="flex:1"></span><button class="abtn abtn--primary" data-close>Compris</button></div>'
      );
    }
    refresh();
  });
}

/* 95. admin.audit */
RA("admin.audit",function(){
  var all=S.audit.all().slice(0,100);
  if(!all.length)return'<p class="muted">Aucune entrée dans le journal d\'audit ACCI.</p>';
  return'<div class="filterbar"><span class="filterbar__count">'+all.length+' entrée(s) — Journal d\'audit ACCI</span></div><div class="dtable"><table><thead><tr><th>Entité</th><th>Action</th><th>Détail</th><th>Date</th></tr></thead><tbody>'+all.map(function(a){return'<tr><td>'+badge(a.entity)+'</td><td>'+esc(a.action)+'</td><td>'+esc(a.detail)+'</td><td class="muted">'+fmtDate(a.createdAt)+'</td></tr>';}).join("")+'</tbody></table></div>';
});

/* 96. admin.logs */
RA("admin.logs",function(){return'<section class="panel"><div class="panel__head"><h2 class="panel__title">Logs système ACCI</h2></div><p class="muted">En mode localStorage, les logs système sont limités au journal d\'audit ACCI. Connectez une base de données pour des logs serveur complets.</p><div class="stat-row"><div class="stat-box"><div class="stat-box__val">'+S.audit.count()+'</div><div class="stat-box__label">Entrées d\'audit</div></div><div class="stat-box"><div class="stat-box__val">'+Object.keys(localStorage).length+'</div><div class="stat-box__label">Clés localStorage</div></div></div></section>';});

/* 97. admin.backup */
RA("admin.backup",function(){
  return'<div class="cols"><section class="panel"><div class="panel__head"><h2 class="panel__title">💾 Sauvegarder les données ACCI</h2></div><p class="muted">Téléchargez une sauvegarde complète de toutes les données du CRM ACCI.</p><div class="btnrow"><button class="abtn abtn--primary abtn--sm" id="bk-dl">⬇ Télécharger backup</button></div></section>'+
    '<section class="panel"><div class="panel__head"><h2 class="panel__title">⬆ Restaurer</h2></div><p class="muted">Restaurez les données ACCI depuis un fichier JSON.</p><div class="btnrow"><label class="abtn abtn--ghost abtn--sm">⬆ Choisir fichier<input type="file" id="bk-up" accept=".json" hidden></label></div><p class="ferr" id="bk-msg" hidden></p></section></div>'+
    '<section class="panel panel--danger"><div class="panel__head"><h2 class="panel__title">Zone sensible</h2></div><p class="muted">Réinitialiser efface toutes les données ACCI.</p><button class="abtn abtn--danger abtn--sm" id="bk-wipe">Tout réinitialiser</button></section>'+
    '<section class="panel"><div class="panel__head"><h2 class="panel__title">Configuration ACCI</h2></div><div class="fgrid">'+ffield("Devise",'<input id="cfg-cur" value="'+esc(localStorage.getItem("acci_currency")||"FCFA")+'">')+ffield("Taux TVA (%)",'<input id="cfg-tax" type="number" value="'+(localStorage.getItem("acci_tax")||"18")+'">')+'</div><div class="btnrow"><button class="abtn abtn--primary abtn--sm" id="cfg-save">Enregistrer</button></div><p class="ferr" id="cfg-msg" hidden></p></section>'+
    '<section class="panel"><div class="panel__head"><h2 class="panel__title">Code d\'accès admin ACCI</h2></div><div class="fgrid">'+ffield("Code actuel",'<input type="password" id="pw-cur">')+ffield("Nouveau code",'<input type="password" id="pw-new">')+'</div><div class="btnrow"><button class="abtn abtn--primary abtn--sm" id="pw-save">Modifier</button></div><p class="ferr" id="pw-msg" hidden></p></section>';
},function(){
  $("#bk-dl").addEventListener("click",exportFullJSON);
  var up=$("#bk-up");if(up)up.addEventListener("change",function(e){importFullJSON(e);});
  $("#bk-wipe").addEventListener("click",function(){confirmDel(function(){Object.keys(localStorage).filter(function(k){return k.startsWith("acci");}).forEach(function(k){localStorage.removeItem(k);});localStorage.removeItem("acci_crm_members");localStorage.removeItem("acci_crm_seeded");toast("Données ACCI réinitialisées.");refresh();});});
  var cs=$("#cfg-save");if(cs)cs.addEventListener("click",function(){localStorage.setItem("acci_currency",$("#cfg-cur").value.trim()||"FCFA");localStorage.setItem("acci_tax",$("#cfg-tax").value||"18");var m=$("#cfg-msg");m.className="ferr okmsg";m.textContent="✓ Configuration ACCI sauvegardée.";m.hidden=false;toast("Config mise à jour.");});
  var ps=$("#pw-save");if(ps)ps.addEventListener("click",function(){var m=$("#pw-msg");if(hash($("#pw-cur").value)!==localStorage.getItem(PASS_KEY)){m.className="ferr";m.textContent="Code incorrect.";m.hidden=false;return;}if($("#pw-new").value.trim().length<4){m.className="ferr";m.textContent="Au moins 4 caractères.";m.hidden=false;return;}localStorage.setItem(PASS_KEY,hash($("#pw-new").value.trim()));m.className="ferr okmsg";m.textContent="✓ Code admin ACCI modifié.";m.hidden=false;toast("Code modifié.");});
});

/* 98. admin.integrations */
RA("admin.integrations",function(){return'<section class="panel"><div class="panel__head"><h2 class="panel__title">🔌 Intégrations ACCI</h2></div><p class="muted">Connectez des services externes pour renforcer les actions de l\'ACCI — Sensibiliser, Former, Protéger, Plaider.</p><div class="card-grid"><div class="wcard"><div class="wcard__icon">📊</div><h3>Supabase</h3><p>Base de données cloud ACCI</p></div><div class="wcard"><div class="wcard__icon">📧</div><h3>Formspree</h3><p>Formulaires de signalement</p></div><div class="wcard"><div class="wcard__icon">💬</div><h3>Slack</h3><p>Notifications équipe ACCI</p></div><div class="wcard"><div class="wcard__icon">📱</div><h3>WhatsApp</h3><p>Communication membres</p></div></div></section>';});

/* 99. admin.fields */
RC("admin.fields",S.customFields,{ic:"🔧",em:"Aucun champ personnalisé ACCI. Ajoutez des champs spécifiques à votre association.",cs:[{k:"name",l:"Nom",b:true},{k:"entity",l:"Entité"},{k:"type",l:"Type"},{k:"required",l:"Requis",fn:function(v){return v?"Oui":"Non";}}],fs:[{n:"name",l:"Nom *",rq:true},{n:"entity",l:"Entité",t:"select",o:["Membre","Demande","Adhésion","Cotisation","Projet"]},{n:"type",l:"Type",t:"select",o:["Texte","Nombre","Date","Liste","Booléen"]},{n:"required",l:"Requis",t:"select",o:["Non","Oui"]}],df:{name:"",entity:"Membre",type:"Texte",required:"Non"},sk:["name"]});

/* 100. admin.automation */
RC("admin.automation",S.workflows,{ic:"⚡",em:"Aucune automatisation ACCI. Automatisez les actions répétitives : notifications d'adhésion, rappels de cotisation, etc.",cs:[{k:"name",l:"Nom",b:true},{k:"trigger",l:"Déclencheur"},{k:"action",l:"Action"},{k:"status",l:"Statut",bg:true}],fs:[{n:"name",l:"Nom *",rq:true},{n:"trigger",l:"Déclencheur",t:"select",o:["Nouveau membre","Signalement créé","Adhésion gagnée","Cotisation en retard","Approbation portail","Autre"]},{n:"action",l:"Action",t:"select",o:["Envoyer e-mail","Créer tâche","Notification","Changer statut","Générer code membre","Autre"]},{n:"status",l:"Statut",t:"select",o:["Actif","Inactif"]},{n:"description",l:"Description",t:"textarea",rows:2}],df:{name:"",trigger:"Nouveau membre",action:"Envoyer e-mail",status:"Actif",description:""},sk:["name"]});

/* =========================== COMPLEX MODULES ============================= */

/* --- Customers List (full featured) --- */
SEC["customers.list"]={
  r:function(){
    var q=norm(state.query);var list=S.customers.all().filter(function(x){
      if(state.cFSt&&x.status!==state.cFSt)return false;if(state.cFCat&&(x.tags||[]).indexOf(state.cFCat)===-1)return false;
      if(!q)return true;return norm(x.name+" "+x.company+" "+x.email+" "+x.city+" "+(x.tags||[]).join(" ")).indexOf(q)!==-1;
    }).sort(function(a,b){var k=state.cSort,va=a[k],vb=b[k];if(k==="createdAt"){va=new Date(va);vb=new Date(vb);}else{va=norm(va);vb=norm(vb);}return(va<vb?-1:va>vb?1:0)*state.cDir;});
    var selN=Object.keys(state.cSel).filter(function(k){return state.cSel[k];}).length;
    function srt(key,label){var ar=state.cSort===key?(state.cDir===1?" ▲":" ▼"):"";return'<th class="th-sort" data-sort="'+key+'">'+label+ar+'</th>';}
    var rows=list.length?list.map(function(x){return'<tr data-id="'+x.id+'" class="rowlink"><td><input type="checkbox" class="rc" data-id="'+x.id+'"'+(state.cSel[x.id]?" checked":"")+'></td><td class="cell-name">'+avatar(x)+'<span><b>'+esc(x.name)+'</b>'+(x.company?'<br><span class="muted">'+esc(x.company)+'</span>':'')+'</span></td><td>'+badge(x.type||"Individuel")+'</td><td>'+esc(x.email||"\u2014")+'</td><td>'+esc(x.city||"\u2014")+'</td><td>'+badge(x.status)+'</td><td>'+(x.approved?'<span style="color:var(--green)" title="'+esc(x.approvalCode||"")+'">🔑</span>':'<span class="muted">\u2014</span>')+'</td><td>'+(x.tags||[]).map(function(t){return'<span class="tagmini">'+esc(t)+'</span>';}).join(" ")+'</td><td class="rowact"><button class="iact ce" data-id="'+x.id+'">✎</button><button class="iact iact--del cd" data-id="'+x.id+'">🗑</button></td></tr>';}).join(""):'<tr><td colspan="9" class="empty">Aucun membre ACCI trouvé.</td></tr>';
    return'<div class="filterbar"><select id="f-st"><option value="">Tous statuts</option>'+optH(CUSTOMER_STATUSES,state.cFSt)+'</select><select id="f-cat"><option value="">Tous domaines</option>'+optH(CATEGORIES,state.cFCat)+'</select><span class="filterbar__count">'+list.length+' membre(s) ACCI</span><div class="filterbar__right">'+(selN?'<button class="abtn abtn--danger abtn--sm" id="b-del">Suppr. ('+selN+')</button>':'')+'<button class="abtn abtn--ghost abtn--sm" id="x-csv">⬇ CSV</button></div></div><div class="dtable"><table><thead><tr><th style="width:30px"><input type="checkbox" id="ca"></th>'+srt("name","Membre")+'<th>Type</th><th>E-mail</th><th>Ville</th>'+srt("status","Statut")+'<th>Portail</th><th>Domaines</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>';
  },
  b:function(){
    var fst=$("#f-st");if(fst)fst.addEventListener("change",function(){state.cFSt=fst.value;refresh();});
    var fcat=$("#f-cat");if(fcat)fcat.addEventListener("change",function(){state.cFCat=fcat.value;refresh();});
    $$(".th-sort").forEach(function(th){th.addEventListener("click",function(){var k=th.getAttribute("data-sort");if(state.cSort===k)state.cDir*=-1;else{state.cSort=k;state.cDir=1;}refresh();});});
    $$(".ce").forEach(function(b){b.addEventListener("click",function(e){e.stopPropagation();openCustomerEdit(b.getAttribute("data-id"));});});
    $$(".cd").forEach(function(b){b.addEventListener("click",function(e){e.stopPropagation();var id=b.getAttribute("data-id");confirmDel(function(){S.customers.remove(id);alog("client",id,"suppression","");toast("Supprimé.");refresh();});});});
    $$(".rowlink").forEach(function(r){r.addEventListener("click",function(e){if(e.target.tagName==="INPUT"||e.target.closest(".iact"))return;openCustomerDetail(r.getAttribute("data-id"));});});
    $$(".rc").forEach(function(c){c.addEventListener("change",function(){state.cSel[c.getAttribute("data-id")]=c.checked;refresh();});});
    var ca=$("#ca");if(ca)ca.addEventListener("change",function(){S.customers.all().forEach(function(x){state.cSel[x.id]=ca.checked;});refresh();});
    var bd=$("#b-del");if(bd)bd.addEventListener("click",function(){var ids=Object.keys(state.cSel).filter(function(k){return state.cSel[k];});confirmDel(function(){S.customers.save(S.customers.all().filter(function(x){return ids.indexOf(x.id)===-1;}));state.cSel={};toast(ids.length+" supprimé(s).");refresh();});});
    var xc=$("#x-csv");if(xc)xc.addEventListener("click",function(){exportCSV("customers");});
  },
  a:function(){openCustomerEdit(null);}
};

function openCustomerEdit(id){
  var x=id?S.customers.get(id):{id:"",type:"Individuel",name:"",company:"",email:"",phone:"",address:"",city:"",country:"Côte d'Ivoire",tags:[],status:"Lead",notes:"",charter:false,social:"",approved:false,approvalCode:"",approvedAt:"",createdAt:""};if(!x)return;
  openModal('<div class="modal__head"><h2>'+(id?"Modifier":"Nouveau membre ACCI")+'</h2><button class="modal__x" data-close>&times;</button></div><form id="cf" class="modal__body"><div class="fgrid">'+ffield("Nom *",'<input name="name" required value="'+esc(x.name)+'">')+ffield("Entreprise",'<input name="company" value="'+esc(x.company)+'">')+ffield("Type",'<select name="type">'+optH(CUSTOMER_TYPES,x.type||"Individuel")+'</select>')+ffield("E-mail",'<input name="email" type="email" value="'+esc(x.email)+'">')+ffield("Téléphone",'<input name="phone" value="'+esc(x.phone)+'">')+ffield("Ville",'<input name="city" value="'+esc(x.city)+'">')+ffield("Pays",'<input name="country" value="'+esc(x.country)+'">')+ffield("Statut",'<select name="status">'+optH(CUSTOMER_STATUSES,x.status)+'</select>')+ffield("Domaines (virgule)",'<input name="tags" value="'+esc((x.tags||[]).join(", "))+'">') +'</div><label class="fcheck"><input type="checkbox" name="charter"'+(x.charter?" checked":"")+'> Charte ACCI signée</label>'+ffield("Notes",'<textarea name="notes" rows="2">'+esc(x.notes)+'</textarea>')+'<p class="ferr" id="cf-e" hidden></p></form><div class="modal__foot"><span style="flex:1"></span><button class="abtn abtn--ghost" data-close>Annuler</button><button class="abtn abtn--primary" id="cf-s">'+(id?"Enregistrer":"Créer")+'</button></div>');
  $("#cf-s").addEventListener("click",function(){var f=$("#cf"),nm=f.name.value.trim();if(!nm){var e=$("#cf-e");e.textContent="Nom obligatoire.";e.hidden=false;return;}var r={id:x.id||uid(),type:f.type.value,name:nm,company:f.company.value.trim(),email:f.email.value.trim(),phone:f.phone.value.trim(),address:x.address||"",city:f.city.value.trim(),country:f.country.value.trim(),tags:f.tags.value.split(",").map(function(t){return t.trim();}).filter(Boolean),status:f.status.value,notes:f.notes.value.trim(),charter:f.charter.checked,social:x.social||"",approved:x.approved||false,approvalCode:x.approvalCode||"",approvedAt:x.approvedAt||"",createdAt:x.createdAt||new Date().toISOString(),updatedAt:todayISO()};if(id){S.customers.update(r);alog("client",r.id,"modification",r.name);toast("Mis à jour.");}else{S.customers.add(r);alog("client",r.id,"création",r.name);toast("Membre ACCI créé.");}closeModal();refresh();});
}

function openCustomerDetail(id){
  var x=S.customers.get(id);if(!x)return;var cts=S.contacts.where(function(c){return c.customerId===id;});var tks=S.tickets.where(function(t){return t.customerId===id;});var dls=S.deals.where(function(d){return d.customerId===id;});var invs=S.invoices.where(function(i){return i.customerId===id;});
  var info=[["Type",badge(x.type||"Individuel")],["E-mail",esc(x.email||"\u2014")],["Téléphone",esc(x.phone||"\u2014")],["Ville",esc(x.city||"\u2014")],["Statut",badge(x.status)],["Charte ACCI",x.charter?'<span style="color:var(--green)">✅ Signée</span>':'<span class="muted">Non signée</span>'],["Domaines",(x.tags||[]).map(function(t){return'<span class="tagmini">'+esc(t)+'</span>';}).join(" ")||"\u2014"],["Inscrit le",fmtDate(x.createdAt)]].map(function(r){return'<div class="drow"><span class="dk">'+r[0]+'</span><span class="dv">'+r[1]+'</span></div>';}).join("");

  /* Approval section */
  var approvalH='<div class="drow" style="margin-top:12px;padding:12px;background:var(--bg);border-radius:10px"><span class="dk">Portail membre</span><span class="dv">';
  if(x.approved){
    approvalH+='<span style="color:var(--green);font-weight:700">✅ Approuvé</span> — Code : <code style="background:var(--orange-l);padding:3px 8px;border-radius:6px;font-weight:700;font-size:15px;letter-spacing:1px">'+esc(x.approvalCode)+'</code><br><span class="muted">Approuvé le '+fmtDate(x.approvedAt)+'</span><br><button class="abtn abtn--danger abtn--sm" id="cd-revoke" style="margin-top:6px">🔒 Révoquer l\'accès</button>';
  }else{
    approvalH+='<span class="muted">Non approuvé</span><br><button class="abtn abtn--success abtn--sm" id="cd-approve" style="margin-top:6px">🔑 Approuver l\'accès membre</button>';
  }
  approvalH+='</span></div>';

  var timeline=[];tks.forEach(function(t){timeline.push({ic:"🎫",txt:'<b>Demande</b> '+esc(t.title)+' — '+badge(t.status),dt:t.createdAt});});dls.forEach(function(d){timeline.push({ic:"💰",txt:'<b>Adhésion</b> '+esc(d.title)+' — '+badge(d.stage)+' — '+fmtMoney(d.value),dt:d.createdAt});});invs.forEach(function(i){timeline.push({ic:"📄",txt:'<b>'+esc(i.type)+'</b> '+esc(i.number)+' — '+fmtMoney(i.total),dt:i.createdAt});});timeline.sort(function(a,b){return new Date(b.dt)-new Date(a.dt);});
  var tlH=timeline.length?'<h3 style="margin-top:12px">Historique ACCI</h3><div class="timeline">'+timeline.map(function(t){return'<div class="timeline__item"><span class="timeline__icon">'+t.ic+'</span><div class="timeline__body">'+t.txt+'<div class="timeline__date">'+fmtDate(t.dt)+'</div></div></div>';}).join("")+'</div>':'';
  openModal('<div class="modal__head"><div class="dhead">'+avatar(x,40)+'<div><h2>'+esc(x.name)+'</h2><span class="muted">'+esc(x.company||"Membre ACCI")+'</span></div></div><button class="modal__x" data-close>&times;</button></div><div class="modal__body">'+info+approvalH+(x.notes?'<div class="dnotes"><span class="dk">Notes</span><p>'+esc(x.notes)+'</p></div>':'')+tlH+'</div><div class="modal__foot"><span style="flex:1"></span><button class="abtn abtn--ghost" data-close>Fermer</button><button class="abtn abtn--primary" id="cd-edit">Modifier</button></div>',true);
  $("#cd-edit").addEventListener("click",function(){openCustomerEdit(x.id);});

  /* Approve button */
  var approveBtn=$("#cd-approve");
  if(approveBtn){
    approveBtn.addEventListener("click",function(){
      var code=genCode();
      /* Make sure code is unique */
      while(S.customers.all().some(function(c){return c.approvalCode===code;})){code=genCode();}
      x.approved=true;
      x.approvalCode=code;
      x.approvedAt=new Date().toISOString();
      x.updatedAt=todayISO();
      S.customers.update(x);
      alog("client",x.id,"approbation portail",x.name+" → "+code);
      toast("Accès portail approuvé : "+code);
      openCustomerDetail(id);
    });
  }

  /* Revoke button */
  var revokeBtn=$("#cd-revoke");
  if(revokeBtn){
    revokeBtn.addEventListener("click",function(){
      confirmDel(function(){
        x.approved=false;
        x.approvalCode="";
        x.approvedAt="";
        x.updatedAt=todayISO();
        S.customers.update(x);
        alog("client",x.id,"révocation portail",x.name);
        toast("Accès portail révoqué.");
        openCustomerDetail(id);
      },"Révoquer l'accès portail de "+x.name+" ? Le membre ne pourra plus se connecter.");
    });
  }
}

/* --- Contacts List --- */
SEC["contacts.list"]={
  r:function(){
    var q=norm(state.query);var list=S.contacts.all().filter(function(c){if(!q)return true;return norm(c.name+" "+c.email+" "+c.phone+" "+c.role).indexOf(q)!==-1;});
    if(!list.length)return emptyHTML("📇","Aucun contact ACCI enregistré.");
    var rows=list.map(function(c){var cu=S.customers.get(c.customerId);return'<tr><td><b>'+esc(c.name)+'</b></td><td>'+esc(c.role||"\u2014")+'</td><td>'+esc(c.email||"\u2014")+'</td><td>'+esc(c.phone||"\u2014")+'</td><td>'+(cu?esc(cu.name):"\u2014")+'</td><td class="rowact"><button class="iact ce" data-id="'+c.id+'">✎</button><button class="iact iact--del cd" data-id="'+c.id+'">🗑</button></td></tr>';}).join("");
    return'<div class="filterbar"><span class="filterbar__count">'+list.length+' contact(s) ACCI</span></div><div class="dtable"><table><thead><tr><th>Nom</th><th>Rôle</th><th>E-mail</th><th>Tél.</th><th>Membre/Partenaire</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>';
  },
  b:function(){
    $$(".crud-add,.empty-state .abtn").forEach(function(b){b.addEventListener("click",function(){openContactEdit(null);});});
    $$(".ce").forEach(function(b){b.addEventListener("click",function(e){e.stopPropagation();openContactEdit(b.getAttribute("data-id"));});});
    $$(".cd").forEach(function(b){b.addEventListener("click",function(e){e.stopPropagation();confirmDel(function(){S.contacts.remove(b.getAttribute("data-id"));toast("Supprimé.");refresh();});});});
  },
  a:function(){openContactEdit(null);}
};
function openContactEdit(id){
  var c=id?S.contacts.get(id):{id:"",customerId:"",name:"",role:"",email:"",phone:""};if(!c)return;
  openModal('<div class="modal__head"><h2>'+(id?"Modifier":"Nouveau contact ACCI")+'</h2><button class="modal__x" data-close>&times;</button></div><form id="ctf" class="modal__body"><div class="fgrid">'+ffield("Nom *",'<input name="name" required value="'+esc(c.name)+'">')+ffield("Rôle",'<input name="role" value="'+esc(c.role)+'">')+ffield("E-mail",'<input name="email" type="email" value="'+esc(c.email)+'">')+ffield("Téléphone",'<input name="phone" value="'+esc(c.phone)+'">')+'</div>'+ffield("Membre/Partenaire",'<select name="customerId">'+custOpt(c.customerId)+'</select>')+'<p class="ferr" id="ctf-e" hidden></p></form><div class="modal__foot"><span style="flex:1"></span><button class="abtn abtn--ghost" data-close>Annuler</button><button class="abtn abtn--primary" id="ctf-s">'+(id?"Enregistrer":"Créer")+'</button></div>');
  $("#ctf-s").addEventListener("click",function(){var f=$("#ctf"),nm=f.name.value.trim();if(!nm){var e=$("#ctf-e");e.textContent="Nom obligatoire.";e.hidden=false;return;}var r={id:c.id||uid(),customerId:f.customerId.value,name:nm,role:f.role.value.trim(),email:f.email.value.trim(),phone:f.phone.value.trim(),createdAt:c.createdAt||new Date().toISOString()};if(id){S.contacts.update(r);toast("Mis à jour.");}else{S.contacts.add(r);toast("Créé.");}closeModal();refresh();});
}

/* --- Tickets List --- */
SEC["tickets.list"]={
  r:function(){
    var q=norm(state.query);var list=S.tickets.all().filter(function(t){if(state.tFSt&&t.status!==state.tFSt)return false;if(state.tFPr&&t.priority!==state.tFPr)return false;if(!q)return true;var c=S.customers.get(t.customerId);return norm(t.title+" "+(c?c.name:"")).indexOf(q)!==-1;});
    var rows=list.length?list.map(function(t){var c=S.customers.get(t.customerId);return'<tr class="rowlink" data-id="'+t.id+'"><td><b>'+esc(t.title)+'</b></td><td>'+(c?esc(c.name):"\u2014")+'</td><td>'+badge(t.priority)+'</td><td>'+badge(t.status)+'</td><td class="muted">'+(t.dueDate?fmtDate(t.dueDate):"\u2014")+'</td><td class="rowact"><button class="iact ce" data-id="'+t.id+'">✎</button><button class="iact iact--del cd" data-id="'+t.id+'">🗑</button></td></tr>';}).join(""):'<tr><td colspan="6" class="empty">🎫 Aucune demande de service ACCI en cours.</td></tr>';
    return'<div class="filterbar"><select id="ft-st"><option value="">Tous statuts</option>'+optH(TICKET_STATUSES,state.tFSt)+'</select><select id="ft-pr"><option value="">Toutes priorités</option>'+optH(TICKET_PRIORITIES,state.tFPr)+'</select><span class="filterbar__count">'+list.length+' demande(s) ACCI</span></div><div class="dtable"><table><thead><tr><th>Titre</th><th>Membre</th><th>Priorité</th><th>Statut</th><th>Échéance</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>';
  },
  b:function(){
    var fs=$("#ft-st");if(fs)fs.addEventListener("change",function(){state.tFSt=fs.value;refresh();});
    var fp=$("#ft-pr");if(fp)fp.addEventListener("change",function(){state.tFPr=fp.value;refresh();});
    $$(".rowlink").forEach(function(r){r.addEventListener("click",function(e){if(e.target.closest(".iact"))return;openTicketDetail(r.getAttribute("data-id"));});});
    $$(".ce").forEach(function(b){b.addEventListener("click",function(e){e.stopPropagation();openTicketEdit(b.getAttribute("data-id"));});});
    $$(".cd").forEach(function(b){b.addEventListener("click",function(e){e.stopPropagation();confirmDel(function(){S.tickets.remove(b.getAttribute("data-id"));toast("Supprimé.");refresh();});});});
  },
  a:function(){openTicketEdit(null);}
};
function openTicketEdit(id){
  var t=id?S.tickets.get(id):{id:"",customerId:"",title:"",description:"",serviceId:"",priority:"Moyen",status:"Ouvert",comments:[],dueDate:"",createdAt:"",resolvedAt:""};if(!t)return;
  var svcs=S.services.where(function(s){return s.active;});var svcO='<option value="">\u2014</option>'+svcs.map(function(s){return'<option value="'+s.id+'"'+(s.id===t.serviceId?" selected":"")+'>'+esc(s.name)+(s.defaultPrice?' ('+fmtMoney(s.defaultPrice)+')':'')+'</option>';}).join("");
  openModal('<div class="modal__head"><h2>'+(id?"Modifier":"Nouvelle demande ACCI")+'</h2><button class="modal__x" data-close>&times;</button></div><form id="tf" class="modal__body"><div class="fgrid">'+ffield("Titre *",'<input name="title" required value="'+esc(t.title)+'">')+ffield("Membre",'<select name="customerId">'+custOpt(t.customerId)+'</select>')+ffield("Service ACCI",'<select name="serviceId">'+svcO+'</select>')+ffield("Priorité",'<select name="priority">'+optH(TICKET_PRIORITIES,t.priority)+'</select>')+ffield("Statut",'<select name="status">'+optH(TICKET_STATUSES,t.status)+'</select>')+ffield("Échéance",'<input name="dueDate" type="date" value="'+(t.dueDate||"")+'">')+'</div>'+ffield("Description",'<textarea name="description" rows="3">'+esc(t.description)+'</textarea>')+'<p class="ferr" id="tf-e" hidden></p></form><div class="modal__foot"><span style="flex:1"></span><button class="abtn abtn--ghost" data-close>Annuler</button><button class="abtn abtn--primary" id="tf-s">'+(id?"Enregistrer":"Créer")+'</button></div>');
  $("#tf-s").addEventListener("click",function(){var f=$("#tf"),tt=f.title.value.trim();if(!tt){var e=$("#tf-e");e.textContent="Titre obligatoire.";e.hidden=false;return;}var nr=(f.status.value==="Résolu"||f.status.value==="Fermé")&&!(t.status==="Résolu"||t.status==="Fermé");var r={id:t.id||uid(),customerId:f.customerId.value,title:tt,description:f.description.value.trim(),serviceId:f.serviceId.value,priority:f.priority.value,status:f.status.value,comments:t.comments||[],dueDate:f.dueDate.value,createdAt:t.createdAt||new Date().toISOString(),resolvedAt:nr?new Date().toISOString():t.resolvedAt};if(id){S.tickets.update(r);alog("ticket",r.id,"modification",r.title);toast("Mis à jour.");}else{S.tickets.add(r);alog("ticket",r.id,"création",r.title);toast("Demande ACCI créée.");}closeModal();refresh();});
}
function openTicketDetail(id){
  var t=S.tickets.get(id);if(!t)return;var c=S.customers.get(t.customerId);
  var info=[["Membre",c?esc(c.name):"\u2014"],["Priorité",badge(t.priority)],["Statut",badge(t.status)],["Échéance",fmtDate(t.dueDate)],["Créé le",fmtDate(t.createdAt)]].map(function(r){return'<div class="drow"><span class="dk">'+r[0]+'</span><span class="dv">'+r[1]+'</span></div>';}).join("");
  var cms=(t.comments||[]).map(function(c){return'<div class="comment"><div class="comment__head">'+fmtDate(c.date)+'</div><div class="comment__text">'+esc(c.text)+'</div></div>';}).join("");
  openModal('<div class="modal__head"><h2>'+esc(t.title)+'</h2><button class="modal__x" data-close>&times;</button></div><div class="modal__body">'+(t.description?'<p>'+esc(t.description)+'</p>':'')+info+'<h3 style="margin-top:10px">Commentaires</h3><div class="comments">'+(cms||'<p class="muted">Aucun commentaire.</p>')+'</div><div class="comment-form"><textarea id="nc" placeholder="Ajouter un commentaire ACCI\u2026"></textarea><button class="abtn abtn--primary abtn--sm" id="ac">Envoyer</button></div></div><div class="modal__foot"><span style="flex:1"></span><button class="abtn abtn--ghost" data-close>Fermer</button><button class="abtn abtn--primary" id="te">Modifier</button></div>',true);
  $("#ac").addEventListener("click",function(){var txt=$("#nc").value.trim();if(!txt)return;t.comments=t.comments||[];t.comments.push({text:txt,date:new Date().toISOString()});S.tickets.update(t);openTicketDetail(id);toast("Commentaire ajouté.");});
  $("#te").addEventListener("click",function(){openTicketEdit(t.id);});
}

/* --- Pipeline Kanban --- */
SEC["pipeline.kanban"]={
  r:function(){
    var deals=S.deals.all();var totalA=0,wt=0;deals.forEach(function(d){if(d.stage!=="Perdu")totalA+=d.value||0;if(d.stage!=="Perdu"&&d.stage!=="Gagné")wt+=(d.value||0)*(DEAL_PROBS[d.stage]||0)/100;});
    var cols=DEAL_STAGES.map(function(stage){
      var sd=deals.filter(function(d){return d.stage===stage;});var st=sd.reduce(function(s,d){return s+(d.value||0);},0);
      var cards=sd.map(function(d){var c=S.customers.get(d.customerId);return'<div class="kanban__card" draggable="true" data-id="'+d.id+'"><div class="kanban__card-title">'+esc(d.title)+'</div><div class="kanban__card-sub">'+(c?esc(c.name):"\u2014")+'</div><div class="kanban__card-value">'+fmtMoney(d.value)+'</div>'+(d.expectedCloseDate?'<div class="kanban__card-date">🗓 '+fmtDate(d.expectedCloseDate)+'</div>':'')+'</div>';}).join("");
      return'<div class="kanban__col" data-stage="'+esc(stage)+'"><div class="kanban__col-head"><h3>'+esc(stage)+' <span class="muted">('+sd.length+')</span></h3><span class="muted">'+fmtMoney(st)+'</span></div><div class="kanban__cards" data-stage="'+esc(stage)+'">'+cards+'</div><button class="kanban__add" data-add="'+esc(stage)+'">+ Ajouter</button></div>';
    }).join("");
    return'<div class="banner banner--info" style="margin-bottom:14px">Pipeline des adhésions et partenariats ACCI — glissez-déposez pour changer l\'étape.</div><div class="filterbar"><span class="filterbar__count">'+deals.length+' adhésion(s)/partenariat(s)</span><span class="muted">Pipeline: '+fmtMoney(totalA)+' · Pondéré: '+fmtMoney(Math.round(wt))+'</span></div><div class="kanban">'+cols+'</div>';
  },
  b:function(){
    var dragId=null;
    $$(".kanban__card").forEach(function(card){
      card.addEventListener("click",function(){openDealEdit(card.getAttribute("data-id"),null);});
      card.addEventListener("dragstart",function(e){dragId=card.getAttribute("data-id");card.classList.add("is-dragging");e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",dragId);});
      card.addEventListener("dragend",function(){card.classList.remove("is-dragging");$$(".kanban__cards").forEach(function(c){c.classList.remove("drag-over");});});
    });
    $$(".kanban__cards").forEach(function(col){
      col.addEventListener("dragover",function(e){e.preventDefault();e.dataTransfer.dropEffect="move";col.classList.add("drag-over");});
      col.addEventListener("dragleave",function(e){if(!col.contains(e.relatedTarget))col.classList.remove("drag-over");});
      col.addEventListener("drop",function(e){e.preventDefault();col.classList.remove("drag-over");var id=e.dataTransfer.getData("text/plain")||dragId;if(!id)return;var ns=col.getAttribute("data-stage"),d=S.deals.get(id);if(d&&d.stage!==ns){d.stage=ns;d.probability=DEAL_PROBS[ns]||0;d.updatedAt=todayISO();S.deals.update(d);alog("adhésion",d.id,"→ "+ns,d.title);refresh();toast("Déplacée → "+ns);}dragId=null;});
    });
    $$("[data-add]").forEach(function(b){b.addEventListener("click",function(){openDealEdit(null,b.getAttribute("data-add"));});});
  },
  a:function(){openDealEdit(null,"Nouveau");}
};
function openDealEdit(id,defStage){
  var d=id?S.deals.get(id):{id:"",customerId:"",title:"",value:0,stage:defStage||"Nouveau",probability:DEAL_PROBS[defStage||"Nouveau"]||10,expectedCloseDate:"",notes:"",createdAt:""};if(!d)return;
  openModal('<div class="modal__head"><h2>'+(id?"Modifier":"Nouvelle adhésion / partenariat ACCI")+'</h2><button class="modal__x" data-close>&times;</button></div><form id="df" class="modal__body"><div class="fgrid">'+ffield("Titre *",'<input name="title" required value="'+esc(d.title)+'">')+ffield("Membre/Prospect",'<select name="customerId">'+custOpt(d.customerId)+'</select>')+ffield("Valeur",'<input name="value" type="number" min="0" value="'+(d.value||0)+'">')+ffield("Étape",'<select name="stage" id="ds">'+optH(DEAL_STAGES,d.stage)+'</select>')+ffield("Probabilité (%)",'<input name="probability" type="number" id="dp" min="0" max="100" value="'+(d.probability||0)+'">')+ffield("Clôture prévue",'<input name="ecd" type="date" value="'+(d.expectedCloseDate||"")+'">')+'</div>'+ffield("Notes",'<textarea name="notes" rows="2">'+esc(d.notes)+'</textarea>')+'<p class="ferr" id="df-e" hidden></p></form><div class="modal__foot">'+(id?'<button class="abtn abtn--danger abtn--sm" id="df-del">Supprimer</button>':'')+'<span style="flex:1"></span><button class="abtn abtn--ghost" data-close>Annuler</button><button class="abtn abtn--primary" id="df-s">'+(id?"Enregistrer":"Créer")+'</button></div>');
  var ds=$("#ds"),dp=$("#dp");ds.addEventListener("change",function(){dp.value=DEAL_PROBS[ds.value]||0;});
  $("#df-s").addEventListener("click",function(){var f=$("#df"),tt=f.title.value.trim();if(!tt){var e=$("#df-e");e.textContent="Titre obligatoire.";e.hidden=false;return;}var r={id:d.id||uid(),customerId:f.customerId.value,title:tt,value:parseInt(f.value.value,10)||0,stage:f.stage.value,probability:parseInt(f.probability.value,10)||0,expectedCloseDate:f.ecd.value,notes:f.notes.value.trim(),createdAt:d.createdAt||new Date().toISOString(),updatedAt:todayISO()};if(id){S.deals.update(r);alog("adhésion",r.id,"modification",r.title);toast("Mis à jour.");}else{S.deals.add(r);alog("adhésion",r.id,"création",r.title);toast("Adhésion ACCI créée.");}closeModal();refresh();});
  var del=$("#df-del");if(del)del.addEventListener("click",function(){confirmDel(function(){S.deals.remove(d.id);toast("Supprimée.");closeModal();refresh();});});
}

/* --- Invoices List --- */
SEC["invoices.list"]={
  r:function(){
    var q=norm(state.query);var list=S.invoices.all().filter(function(i){if(state.iFTy&&i.type!==state.iFTy)return false;if(state.iFSt&&i.status!==state.iFSt)return false;if(!q)return true;var c=S.customers.get(i.customerId);return norm(i.number+" "+(c?c.name:"")).indexOf(q)!==-1;});
    var rows=list.length?list.map(function(i){var c=S.customers.get(i.customerId);return'<tr class="rowlink" data-id="'+i.id+'"><td><b>'+esc(i.number)+'</b></td><td>'+badge(i.type)+'</td><td>'+(c?esc(c.name):"\u2014")+'</td><td class="muted">'+fmtDate(i.issueDate)+'</td><td><b>'+fmtMoney(i.total)+'</b></td><td>'+badge(i.status)+'</td><td class="rowact">'+(i.type==="Devis"&&i.status!=="Annulé"?'<button class="iact conv" data-id="'+i.id+'" title="→ Facture">➡</button>':'')+'<button class="iact ce" data-id="'+i.id+'">✎</button><button class="iact iact--del cd" data-id="'+i.id+'">🗑</button></td></tr>';}).join(""):'<tr><td colspan="7" class="empty">📄 Aucune cotisation ou facture ACCI.</td></tr>';
    return'<div class="filterbar"><select id="fi-ty"><option value="">Tous types</option>'+optH(INVOICE_TYPES,state.iFTy)+'</select><select id="fi-st"><option value="">Tous statuts</option>'+optH(INVOICE_STATUSES,state.iFSt)+'</select><span class="filterbar__count">'+list.length+' doc. ACCI</span></div><div class="dtable"><table><thead><tr><th>N°</th><th>Type</th><th>Membre</th><th>Date</th><th>Total</th><th>Statut</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>';
  },
  b:function(){
    var ft=$("#fi-ty");if(ft)ft.addEventListener("change",function(){state.iFTy=ft.value;refresh();});
    var fs=$("#fi-st");if(fs)fs.addEventListener("change",function(){state.iFSt=fs.value;refresh();});
    $$(".rowlink").forEach(function(r){r.addEventListener("click",function(e){if(e.target.closest(".iact"))return;openInvoiceBuilder(r.getAttribute("data-id"));});});
    $$(".ce").forEach(function(b){b.addEventListener("click",function(e){e.stopPropagation();openInvoiceBuilder(b.getAttribute("data-id"));});});
    $$(".cd").forEach(function(b){b.addEventListener("click",function(e){e.stopPropagation();confirmDel(function(){S.invoices.remove(b.getAttribute("data-id"));toast("Supprimé.");refresh();});});});
    $$(".conv").forEach(function(b){b.addEventListener("click",function(e){e.stopPropagation();convertQuote(b.getAttribute("data-id"));});});
  },
  a:function(){openInvoiceBuilder(null);}
};
function openInvoiceBuilder(id){
  var taxRate=parseInt(localStorage.getItem("acci_tax")||"18",10);
  var inv=id?S.invoices.get(id):{id:"",customerId:"",number:nextInvNum(),type:"Facture",status:"Brouillon",issueDate:todayISO(),dueDate:"",items:[{description:"",serviceId:"",qty:1,unitPrice:0,lineTotal:0}],subtotal:0,taxRate:taxRate,tax:0,total:0,notes:"",createdAt:""};
  if(!inv)return;if(!inv.items||!inv.items.length)inv.items=[{description:"",serviceId:"",qty:1,unitPrice:0,lineTotal:0}];
  var svcs=S.services.where(function(s){return s.active;});var curItems=inv.items.map(function(it){return{description:it.description,serviceId:it.serviceId,qty:it.qty||1,unitPrice:it.unitPrice||0};});
  function lineH(){return curItems.map(function(it,i){var so='<option value="">\u2014</option>'+svcs.map(function(s){return'<option value="'+s.id+'"'+(s.id===it.serviceId?" selected":"")+'>'+esc(s.name)+'</option>';}).join("");return'<tr class="il" data-i="'+i+'"><td><select class="is">'+so+'</select></td><td><input class="id" value="'+esc(it.description)+'"></td><td><input class="iq" type="number" min="1" value="'+(it.qty||1)+'" style="width:55px"></td><td><input class="ip" type="number" min="0" value="'+(it.unitPrice||0)+'" style="width:90px"></td><td class="inv-line-total">'+fmtMoney(it.qty*it.unitPrice)+'</td><td><button class="iact iact--del ix" type="button">✕</button></td></tr>';}).join("");}
  function calc(){var s=curItems.reduce(function(a,it){return a+(it.qty||0)*(it.unitPrice||0);},0);var tx=Math.round(s*taxRate/100);return{sub:s,tax:tx,tot:s+tx};}
  var t=calc();
  openModal('<div class="modal__head"><h2>'+(id?"Modifier "+esc(inv.number):"Nouvelle cotisation / facture ACCI")+'</h2><button class="modal__x" data-close>&times;</button></div><form id="ivf" class="modal__body"><div class="fgrid">'+ffield("N°",'<input name="number" value="'+esc(inv.number)+'">')+ffield("Type",'<select name="type">'+optH(INVOICE_TYPES,inv.type)+'</select>')+ffield("Membre",'<select name="customerId">'+custOpt(inv.customerId)+'</select>')+ffield("Statut",'<select name="status">'+optH(INVOICE_STATUSES,inv.status)+'</select>')+ffield("Émission",'<input name="issueDate" type="date" value="'+inv.issueDate+'">')+ffield("Échéance",'<input name="dueDate" type="date" value="'+(inv.dueDate||"")+'">')+'</div><h3>Services ACCI</h3><div style="overflow-x:auto"><table class="inv-lines"><thead><tr><th>Service</th><th>Description</th><th>Qté</th><th>P.U.</th><th>Total</th><th></th></tr></thead><tbody id="iv-items">'+lineH()+'</tbody></table></div><button type="button" class="abtn abtn--ghost abtn--sm" id="iv-add">+ Ligne</button><div class="inv-totals"><div class="inv-total-row"><span>Sous-total</span><span id="iv-sub">'+fmtMoney(t.sub)+'</span></div><div class="inv-total-row"><span>TVA ('+taxRate+'%)</span><span id="iv-tax">'+fmtMoney(t.tax)+'</span></div><div class="inv-total-row inv-total-row--grand"><span>Total</span><span id="iv-tot">'+fmtMoney(t.tot)+'</span></div></div>'+ffield("Notes",'<textarea name="notes" rows="2">'+esc(inv.notes)+'</textarea>')+'<p class="ferr" id="ivf-e" hidden></p></form><div class="modal__foot"><span style="flex:1"></span><button class="abtn abtn--ghost" data-close>Annuler</button><button class="abtn abtn--primary" id="ivf-s">'+(id?"Enregistrer":"Créer")+'</button></div>',true);
  function recalc(){var c=calc();var es=$("#iv-sub");if(es)es.textContent=fmtMoney(c.sub);var et=$("#iv-tax");if(et)et.textContent=fmtMoney(c.tax);var eto=$("#iv-tot");if(eto)eto.textContent=fmtMoney(c.tot);$$(".il").forEach(function(r,i){if(curItems[i]){var lt=r.querySelector(".inv-line-total");if(lt)lt.textContent=fmtMoney(curItems[i].qty*curItems[i].unitPrice);}});}
  function bindLines(){$$(".il").forEach(function(row,i){
    var is=row.querySelector(".is"),id=row.querySelector(".id"),iq=row.querySelector(".iq"),ip=row.querySelector(".ip"),ix=row.querySelector(".ix");
    if(is)is.addEventListener("change",function(){curItems[i].serviceId=is.value;var sv=S.services.get(is.value);if(sv){id.value=sv.name;ip.value=sv.defaultPrice;curItems[i].description=sv.name;curItems[i].unitPrice=sv.defaultPrice;}recalc();});
    if(id)id.addEventListener("input",function(){curItems[i].description=id.value;});
    if(iq)iq.addEventListener("input",function(){curItems[i].qty=parseInt(iq.value,10)||0;recalc();});
    if(ip)ip.addEventListener("input",function(){curItems[i].unitPrice=parseInt(ip.value,10)||0;recalc();});
    if(ix)ix.addEventListener("click",function(){if(curItems.length<=1)return;curItems.splice(i,1);$("#iv-items").innerHTML=lineH();bindLines();recalc();});
  });}
  bindLines();
  $("#iv-add").addEventListener("click",function(){curItems.push({description:"",serviceId:"",qty:1,unitPrice:0});$("#iv-items").innerHTML=lineH();bindLines();});
  $("#ivf-s").addEventListener("click",function(){var f=$("#ivf"),c=calc();var r={id:inv.id||uid(),customerId:f.customerId.value,number:f.number.value.trim()||nextInvNum(),type:f.type.value,status:f.status.value,issueDate:f.issueDate.value,dueDate:f.dueDate.value,items:curItems.map(function(it){return{description:it.description,serviceId:it.serviceId,qty:it.qty,unitPrice:it.unitPrice,lineTotal:it.qty*it.unitPrice};}),subtotal:c.sub,taxRate:taxRate,tax:c.tax,total:c.tot,notes:f.notes.value.trim(),createdAt:inv.createdAt||new Date().toISOString()};if(id){S.invoices.update(r);alog("cotisation",r.id,"modification",r.number);toast("Mis à jour.");}else{S.invoices.add(r);alog("cotisation",r.id,"création",r.number);toast("Document ACCI créé.");}closeModal();refresh();});
}
function convertQuote(id){var q=S.invoices.get(id);if(!q)return;var inv=JSON.parse(JSON.stringify(q));inv.id=uid();inv.type="Facture";inv.number=nextInvNum();inv.status="Brouillon";inv.issueDate=todayISO();inv.createdAt=new Date().toISOString();q.status="Annulé";q.notes=(q.notes?q.notes+"\n":"")+"→ "+inv.number;S.invoices.update(q);S.invoices.add(inv);toast("Converti → "+inv.number);refresh();}
function nextInvNum(){var y=new Date().getFullYear(),mx=0;S.invoices.all().forEach(function(i){var m=(i.number||"").match(/(\d+)$/);if(m){var n=parseInt(m[1],10);if(n>mx)mx=n;}});return"F-"+y+"-"+String(mx+1).padStart(3,"0");}

/* =========================== STANDALONE VIEWS ============================= */
function renderInbox(){
  var inbox=S.inbox.all();
  if(!inbox.length){$("#view").innerHTML='<div class="empty-state"><div class="empty-state__ic">📥</div><h2>Aucune demande ACCI</h2><p class="muted">Les demandes du site web ACCI apparaissent ici pour être converties en membres.</p></div>';return;}
  var rows=inbox.map(function(it,i){return'<tr><td><b>'+esc(it.name||"\u2014")+'</b><br><span class="muted">'+esc(it.email||"")+'</span></td><td>'+esc(it.subject||it.phone||"\u2014")+'</td><td class="muted">'+esc((it.message||"").slice(0,60))+'</td><td class="muted">'+fmtDate(it.date)+'</td><td class="rowact"><button class="abtn abtn--primary abtn--sm ic" data-i="'+i+'">Convertir en membre</button><button class="iact iact--del id" data-i="'+i+'">🗑</button></td></tr>';}).join("");
  $("#view").innerHTML='<div class="filterbar"><span class="filterbar__count">'+inbox.length+' demande(s) ACCI</span><div class="filterbar__right"><button class="abtn abtn--ghost abtn--sm" id="ic-clr">Vider</button></div></div><div class="dtable"><table><thead><tr><th>De</th><th>Objet</th><th>Message</th><th>Date</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>';
  $$(".ic").forEach(function(b){b.addEventListener("click",function(){var ix=S.inbox.all(),it=ix[+b.getAttribute("data-i")];if(!it)return;S.customers.add({type:"Individuel",name:it.name||"",company:"",email:it.email||"",phone:it.phone||"",address:"",city:"",country:"Côte d'Ivoire",tags:[],status:"Lead",notes:(it.subject?"Objet: "+it.subject+"\n":"")+(it.message||""),charter:false,social:"",approved:false,approvalCode:"",approvedAt:""});ix.splice(+b.getAttribute("data-i"),1);S.inbox.save(ix);toast("Converti en membre ACCI.");refresh();});});
  $$(".id").forEach(function(b){b.addEventListener("click",function(){var ix=S.inbox.all();ix.splice(+b.getAttribute("data-i"),1);S.inbox.save(ix);refresh();});});
  var cl=$("#ic-clr");if(cl)cl.addEventListener("click",function(){S.inbox.save([]);toast("Vidée.");refresh();});
}

function renderData(){
  $("#view").innerHTML='<div class="cols"><section class="panel"><div class="panel__head"><h2 class="panel__title">Exporter les données ACCI</h2></div><p class="muted">Téléchargez les données du CRM ACCI.</p><div class="btnrow"><button class="abtn abtn--primary abtn--sm xp" data-t="customers">Membres</button><button class="abtn abtn--ghost abtn--sm xp" data-t="tickets">Demandes</button><button class="abtn abtn--ghost abtn--sm xp" data-t="deals">Adhésions</button><button class="abtn abtn--ghost abtn--sm xp" data-t="invoices">Cotisations</button><button class="abtn abtn--ghost abtn--sm" id="xp-j">Tout (JSON)</button></div></section><section class="panel"><div class="panel__head"><h2 class="panel__title">Importer</h2></div><p class="muted">Importez des membres ACCI depuis CSV/JSON.</p><div class="btnrow"><label class="abtn abtn--ghost abtn--sm">⬆ Fichier<input type="file" id="imp-f" accept=".csv,.json" hidden></label></div><p class="ferr" id="imp-m" hidden></p></section></div>';
  $$(".xp").forEach(function(b){b.addEventListener("click",function(){exportCSV(b.getAttribute("data-t"));});});
  $("#xp-j").addEventListener("click",exportFullJSON);
  var imp=$("#imp-f");if(imp)imp.addEventListener("change",function(e){importFile(e);});
}

/* =========================== HELPERS ===================================== */
function calendarView(events){
  var now=new Date(),y=now.getFullYear(),m=now.getMonth();
  var first=new Date(y,m,1),last=new Date(y,m+1,0);
  var startDay=first.getDay()||7;var days=last.getDate();
  var heads=["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map(function(d){return'<div class="cal-head">'+d+'</div>';}).join("");
  var cells="";for(var i=1;i<startDay;i++)cells+='<div class="cal-day cal-day--other"></div>';
  for(var d=1;d<=days;d++){
    var dt=y+"-"+String(m+1).padStart(2,"0")+"-"+String(d).padStart(2,"0");
    var isToday=dt===todayISO();
    var dayEvents=events.filter(function(e){return e.date===dt;});
    cells+='<div class="cal-day'+(isToday?" cal-day--today":"")+'"><div class="cal-day__num">'+d+'</div>'+dayEvents.map(function(e){return'<div class="cal-day__event">'+esc(e.label)+'</div>';}).join("")+'</div>';
  }
  return'<div class="cal-grid">'+heads+cells+'</div>';
}

function exportCSV(type){
  var data,fields;
  if(type==="customers"){data=S.customers.all();fields=["name","company","type","email","phone","city","country","status","approved","approvalCode"];}
  else if(type==="tickets"){data=S.tickets.all();fields=["title","priority","status","dueDate","createdAt"];}
  else if(type==="deals"){data=S.deals.all();fields=["title","value","stage","probability","expectedCloseDate"];}
  else if(type==="invoices"){data=S.invoices.all();fields=["number","type","status","issueDate","dueDate","total"];}
  else return;
  var head=fields.join(",");var lines=data.map(function(x){return fields.map(function(f){var v=x[f]==null?"":String(x[f]).replace(/"/g,'""');return/[",\n]/.test(v)?'"'+v+'"':v;}).join(",");});
  dl("acci-"+type+"-"+todayISO()+".csv","\uFEFF"+head+"\n"+lines.join("\n"),"text/csv");toast(data.length+" exporté(s).");
}
function exportFullJSON(){
  var data={};Object.keys(S).forEach(function(k){if(S[k].all)data[k]=S[k].all();});
  dl("acci-crm-backup-"+todayISO()+".json",JSON.stringify(data,null,2),"application/json");toast("Backup ACCI téléchargé.");
}
function importFile(e){
  var file=e.target.files[0];if(!file)return;var msg=$("#imp-m");if(msg)msg.hidden=true;
  var r=new FileReader();r.onload=function(){try{var added=0,txt=r.result;
    if(/\.json$/i.test(file.name)){var d=JSON.parse(txt);if(d.customers){Object.keys(d).forEach(function(k){if(S[k]&&S[k].save)S[k].save(d[k]);});added=d.customers.length;}else if(Array.isArray(d)){d.forEach(function(x){if(x.name||x.email){x.id=x.id||uid();x.approved=x.approved||false;x.approvalCode=x.approvalCode||"";x.approvedAt=x.approvedAt||"";S.customers.add(x);added++;}});}
    }else{var rows=parseCSV(txt);rows.forEach(function(x){if(!x.name&&!x.email)return;S.customers.add({type:x.type||"Individuel",name:x.name||"",company:x.company||"",email:x.email||"",phone:x.phone||"",address:"",city:x.city||"",country:x.country||"Côte d'Ivoire",tags:(x.tags||"").split(/[;,]/).map(function(t){return t.trim();}).filter(Boolean),status:CUSTOMER_STATUSES.indexOf(x.status)!==-1?x.status:"Lead",notes:x.notes||"",charter:false,social:"",approved:false,approvalCode:"",approvedAt:""});added++;});}
    if(msg){msg.className="ferr okmsg";msg.textContent="✓ "+added+" importé(s).";msg.hidden=false;}toast(added+" importé(s).");setTimeout(function(){go("customers");},500);
  }catch(err){if(msg){msg.className="ferr";msg.textContent="Fichier illisible.";msg.hidden=false;}}};
  r.readAsText(file,"utf-8");e.target.value="";
}
function importFullJSON(e){
  var file=e.target.files[0];if(!file)return;var msg=$("#bk-msg");
  var r=new FileReader();r.onload=function(){try{var d=JSON.parse(r.result);Object.keys(d).forEach(function(k){if(S[k]&&S[k].save)S[k].save(d[k]);});if(msg){msg.className="ferr okmsg";msg.textContent="✓ Données ACCI restaurées.";msg.hidden=false;}toast("Restauré.");refresh();}catch(err){if(msg){msg.className="ferr";msg.textContent="Erreur.";msg.hidden=false;}}};
  r.readAsText(file,"utf-8");e.target.value="";
}
function parseCSV(text){text=text.replace(/^\uFEFF/,"");var rows=[],row=[],val="",q=false;for(var i=0;i<text.length;i++){var c=text[i];if(q){if(c==='"'&&text[i+1]==='"'){val+='"';i++;}else if(c==='"')q=false;else val+=c;}else{if(c==='"')q=true;else if(c===","){row.push(val);val="";}else if(c==="\n"||c==="\r"){if(val!==""||row.length){row.push(val);rows.push(row);row=[];val="";}if(c==="\r"&&text[i+1]==="\n")i++;}else val+=c;}}if(val!==""||row.length){row.push(val);rows.push(row);}if(!rows.length)return[];var head=rows.shift().map(function(h){return h.trim().toLowerCase();});return rows.filter(function(r){return r.some(function(c){return c.trim();});}).map(function(r){var o={};head.forEach(function(h,i){o[h]=(r[i]||"").trim();});return o;});}
function showReport(type){
  var out=$("#rpt-out");if(!out)return;
  if(type==="revenue"){var inv=S.invoices.where(function(i){return i.status==="Payé";});var bm={};inv.forEach(function(i){var m=(i.issueDate||"").slice(0,7);bm[m]=(bm[m]||0)+(i.total||0);});var ms=Object.keys(bm).sort();out.innerHTML='<section class="panel"><h2 class="panel__title" style="margin-bottom:10px">Revenu mensuel ACCI</h2>'+(ms.length?chartBars(ms.map(function(m){return{label:m,val:bm[m],fmt:fmtMoney(bm[m])};})):'<p class="muted">Aucune donnée de cotisation ACCI.</p>')+'</section>';}
  else if(type==="pipeline"){out.innerHTML='<section class="panel"><h2 class="panel__title" style="margin-bottom:10px">Pipeline adhésions ACCI</h2>'+chartBars(DEAL_STAGES.map(function(s){var sd=S.deals.where(function(d){return d.stage===s;});return{label:s,val:sd.reduce(function(a,d){return a+(d.value||0);},0),fmt:fmtMoney(sd.reduce(function(a,d){return a+(d.value||0);},0)),badge:true};}))+'</section>';}
  else if(type==="tickets"){var t=S.tickets.all();out.innerHTML='<div class="cols"><section class="panel"><h2 class="panel__title" style="margin-bottom:10px">Demandes par statut</h2>'+chartBars(TICKET_STATUSES.map(function(s){return{label:s,val:t.filter(function(x){return x.status===s;}).length,badge:true};}))+'</section><section class="panel"><h2 class="panel__title" style="margin-bottom:10px">Par priorité</h2>'+chartBars(TICKET_PRIORITIES.map(function(p){return{label:p,val:t.filter(function(x){return x.priority===p;}).length,badge:true};}))+'</section></div>';}
  else if(type==="growth"){var c=S.customers.all();var bm={};c.forEach(function(x){var m=(x.createdAt||"").slice(0,7);bm[m]=(bm[m]||0)+1;});var ms=Object.keys(bm).sort();out.innerHTML='<section class="panel"><h2 class="panel__title" style="margin-bottom:10px">Croissance membres ACCI</h2>'+chartBars(ms.map(function(m){return{label:m,val:bm[m]};}))+'</section>';}
  else if(type==="services"){var inv=S.invoices.where(function(i){return i.status==="Payé";});var bs={};inv.forEach(function(i){(i.items||[]).forEach(function(it){var n=it.description||"Autre";bs[n]=(bs[n]||0)+(it.lineTotal||0);});});var ns=Object.keys(bs).sort(function(a,b){return bs[b]-bs[a];});out.innerHTML='<section class="panel"><h2 class="panel__title" style="margin-bottom:10px">Revenu par service ACCI</h2>'+(ns.length?chartBars(ns.map(function(n){return{label:n,val:bs[n],fmt:fmtMoney(bs[n])};})):'<p class="muted">Aucune donnée.</p>')+'</section>';}
  else if(type==="overdue"){var od=S.invoices.where(function(i){return i.status==="En retard";});out.innerHTML=od.length?'<section class="panel panel--danger"><h2 class="panel__title" style="margin-bottom:10px">Cotisations en retard ('+od.length+')</h2><div class="dtable"><table><thead><tr><th>N°</th><th>Membre</th><th>Échéance</th><th>Total</th></tr></thead><tbody>'+od.map(function(i){var c=S.customers.get(i.customerId);return'<tr><td>'+esc(i.number)+'</td><td>'+(c?esc(c.name):"\u2014")+'</td><td>'+fmtDate(i.dueDate)+'</td><td><b>'+fmtMoney(i.total)+'</b></td></tr>';}).join("")+'</tbody></table></div></section>':'<p class="muted">Aucune cotisation ACCI en retard.</p>';}
}

/* =========================== ROUTER ====================================== */
function go(view){
  state.view=view;
  /* Access control */
  if(!canAccess(view)){
    $("#view-title").textContent="Accès refusé";
    $("#view").innerHTML='<div class="empty-state"><div class="empty-state__ic">🔒</div><h2>Accès non autorisé</h2><p class="muted">Vous n\'avez pas accès à ce module. Contactez l\'administrateur <b>ogou</b> pour obtenir les permissions nécessaires.</p></div>';
    return;
  }
  $$("#snav .snav").forEach(function(b){b.classList.toggle("is-active",b.getAttribute("data-view")===view);});
  updateBadge();
  if(view==="inbox"){$("#view-title").textContent="Réception ACCI";renderInbox();return;}
  if(view==="data"){$("#view-title").textContent="Import / Export ACCI";renderData();return;}
  var mod=MODS[view];
  if(mod){
    $("#view-title").textContent=mod.title;
    var sub=state.sub[view]||mod.tabs[0].id;
    var tabsH=mod.tabs.map(function(t){return'<button class="tab'+(t.id===sub?" is-active":"")+'" data-tab="'+t.id+'">'+t.l+'</button>';}).join("");
    var subKey=view+"."+sub;var sec=SEC[subKey];
    var content=sec&&sec.r?sec.r():'<div class="empty-state"><div class="empty-state__ic">🚧</div><h2>Section ACCI en construction</h2><p class="muted">Cette fonctionnalité sera bientôt disponible pour renforcer les piliers de l\'ACCI.</p></div>';
    $("#view").innerHTML='<div class="tabs">'+tabsH+'</div>'+content;
    $$(".tab").forEach(function(t){t.addEventListener("click",function(){state.sub[view]=t.getAttribute("data-tab");go(view);});});
    if(sec&&sec.b)sec.b();
  }
}
function refresh(){go(state.view);}
function updateBadge(){var b=$("#inbox-count");if(b){var n=S.inbox.count();b.textContent=n;b.hidden=n===0;}}

/* =========================== BOOT ======================================== */
function boot(){
  /* Build sidebar dynamically based on admin permissions */
  buildSidebar();
  /* Bind sidebar nav */
  $$("#snav .snav").forEach(function(b){b.addEventListener("click",function(){go(b.getAttribute("data-view"));$(".sidebar").classList.remove("is-open");});});
  $("#logout").addEventListener("click",function(){sessionStorage.removeItem("acci_admin");location.reload();});
  $("#add-btn").addEventListener("click",function(){
    var mod=MODS[state.view];if(mod){var sub=state.sub[state.view]||mod.tabs[0].id;var sec=SEC[state.view+"."+sub];if(sec&&sec.a){sec.a();return;}}
    openCustomerEdit(null);
  });
  $("#search").addEventListener("input",function(){state.query=this.value;refresh();});
  $("#atop-burger").addEventListener("click",function(){$(".sidebar").classList.toggle("is-open");});
  document.addEventListener("keydown",function(e){if(e.key==="Escape")closeModal();});
  go("dashboard");
}

/* =========================== INIT ======================================== */
initAuth();
})();
