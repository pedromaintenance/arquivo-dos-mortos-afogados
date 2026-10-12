(()=>{'use strict';
const ROOMS=window.ARCHIVE_ROOMS||{};
const K='carcaca_arquivo_v1',STORY_KEY='carcaca_arquivo_chronicle_v1';
const $=s=>document.querySelector(s),esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rnd=n=>Math.floor(Math.random()*n),roll=(n=20)=>1+rnd(n),clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),sct=()=>$('.viewport')?.scrollTo(0,0);
let game=null,tab='scene',dialog=null,combat=null,ability=null,chosen=0,logBuffer=[],offlineReady=false;
const HEROES=[
{id:'kera',name:'Kera Punho-de-Sal',role:'Vigia de Thargrid',symbol:'🛡️',max:84,ac:17,focus:6,spd:3,attack:7,skill:4,skills:['strike','rush','guard','quake']},
{id:'iria',name:'Íria dos Ossos',role:'Arcanista dos Yokai',symbol:'✦',max:59,ac:13,focus:12,spd:3,attack:6,skill:7,skills:['ray','bind','mist','tide']},
{id:'maira',name:'Maira das Margens',role:'Batedora da Foz',symbol:'🏹',max:67,ac:15,focus:9,spd:4,attack:7,skill:5,skills:['shot','pierce','herbs','echo']}
];
const SKILLS={
horn:{name:'Berrante Aquático',icon:'📯',desc:'1 vez por combate • maré 3×3',range:5,cost:0,kind:'tide',damage:19,arcane:true},
strike:{name:'Golpe de Escudo',icon:'⚔',desc:'Corpo a corpo • dano 11',range:1,cost:0,kind:'attack',damage:12},
rush:{name:'Quebra-Correntes',icon:'🔱',desc:'Até 2 casas • empurra',range:2,cost:2,kind:'attack',damage:13,knock:1},
guard:{name:'Defesa dos Refugiados',icon:'🛡',desc:'Protege os aliados por 1 rodada',range:0,cost:2,kind:'guard'},
quake:{name:'Âncora de Thargrid',icon:'💥',desc:'Área ao redor • abala inimigos',range:0,cost:3,kind:'quake'},
ray:{name:'Luz Reveladora',icon:'✧',desc:'Até 5 casas • atravessa ilusões',range:5,cost:0,kind:'attack',damage:10,arcane:true},
bind:{name:'Raízes do Nome',icon:'🌿',desc:'Até 4 casas • prende alvo',range:4,cost:3,kind:'attack',damage:7,root:2,arcane:true},
mist:{name:'Névoa Obscurecente',icon:'☁',desc:'Área 3×3 • bloqueia mira',range:4,cost:2,kind:'mist'},
tide:{name:'Maré de Golzdov',icon:'🌊',desc:'Área 3×3 • atinge vários',range:4,cost:4,kind:'tide',damage:13,arcane:true},
shot:{name:'Flecha de Sal',icon:'🏹',desc:'Até 5 casas • dano 10',range:5,cost:0,kind:'attack',damage:11},
pierce:{name:'Flecha de Ruptura',icon:'➶',desc:'Até 5 casas • ignora armadura',range:5,cost:3,kind:'attack',damage:16,pierce:5},
herbs:{name:'Ervas de Portomonte',icon:'🌱',desc:'Cura um aliado próximo',range:4,cost:3,kind:'heal',damage:20},
echo:{name:'Marca do Batedor',icon:'◎',desc:'Até 5 casas • alvo vulnerável',range:5,cost:2,kind:'attack',damage:8,mark:2}
};
const FOES={
lamp:{name:'Lampreia do Pavor',icon:'🩸',hp:31,ac:12,attack:4,dmg:8,range:1,spd:3,behavior:'rush'},
kappa:{name:'Kappa-Escriba',icon:'🐢',hp:34,ac:13,attack:5,dmg:9,range:3,spd:2,behavior:'ranged'},
echo:{name:'Eco Afogado',icon:'👻',hp:38,ac:12,attack:6,dmg:10,range:2,spd:2,behavior:'curse'},
shade:{name:'Sentinela de Laca',icon:'🎭',hp:53,ac:15,attack:6,dmg:11,range:1,spd:3,behavior:'rush'},
akaname:{name:'Akaname do Espelho Fundo',icon:'🪞',hp:138,ac:17,attack:8,dmg:15,range:3,spd:3,behavior:'mirror',boss:true},
morgat:{name:'Morgat Quebra-Âncoras',icon:'⚓',hp:170,ac:18,attack:9,dmg:17,range:1,spd:2,behavior:'smash',boss:true},
gharoz:{name:'Gharoz, Crocodilo Gordo',icon:'🐊',hp:210,ac:18,attack:9,dmg:19,range:2,spd:2,behavior:'horror',boss:true},
joro:{name:'Jorō, Tecelã dos Sonhos',icon:'🕷️',hp:235,ac:19,attack:10,dmg:18,range:4,spd:3,behavior:'dream',boss:true}
};
const ENCOUNTERS={5:['kappa','kappa'],7:['shade'],10:['echo','echo'],11:['kappa','shade'],12:['shade','echo'],15:['lamp','lamp'],18:['echo','lamp'],19:['echo','echo'],20:['shade','kappa'],21:['akaname'],24:['lamp','lamp','lamp'],25:['shade','echo'],26:['shade','lamp'],29:['lamp','kappa'],30:['shade','echo'],31:['lamp','lamp'],32:['kappa','kappa'],36:['lamp','lamp','echo'],38:['morgat'],40:['gharoz'],42:['kappa','echo']};
const SPECIAL={
28:{title:'O pacto já foi aceito',text:'No degrau inferior, a palavra ritual de consentimento ainda brilha. Seis anéis se formam na água. Esta não é a primeira entrada; o Arquivo lembra cada promessa.',options:[
{title:'Reafirmar que ninguém pertence à Corte',desc:'A liberdade dos vivos será o critério da expedição.',effect:{autonomy:2,insight:1},out:'A água deixa de resistir. Uma marca registra uma intenção própria.'},
{title:'Declarar que a missão serve ao Senhor do Rio',desc:'Prometer reconhecer a autoridade existente.',effect:{court:2,insight:1},out:'As marcas obedecem — mas a água permanece inquieta.'},
{title:'Recusar-se a prestar novo juramento',desc:'Nenhuma palavra será arrancada sem compreensão.',effect:{autonomy:1,truth:1},out:'O silêncio é admitido como forma de consentimento consciente.'}]},
32:{title:'A oficina do afogamento ritual',text:'As máquinas de inscrição gravavam nomes antes de sufocá-los. Nas paredes arranhadas pela passagem do tubarão, ainda existem placas de comando e instrumentos úteis.',options:[
{title:'Desmontar o mecanismo de servidão',desc:'Libertar inscrições e recuperar os nomes apagados.',effect:{autonomy:2,truth:1,supplies:1},out:'Você destrói o mecanismo sem apagar os registros. O Arquivo registra a escolha.'},
{title:'Estudar antes de tocar nas engrenagens',desc:'Preservar a prova histórica.',effect:{insight:2,truth:1},out:'Entre os instrumentos está a prova de que o afogamento foi uma decisão política.'}]},
35:{title:'O juramento sob as águas',text:'Uma procissão petrificada guarda o ante-templo. Cada figura traz uma palavra gravada: dever, posse, memória e recusa.',options:[
{title:'Ouvir as vozes dos antigos',desc:'Preservar o testemunho dos trabalhadores submersos.',effect:{truth:2,insight:1,autonomy:1},out:'Várias vozes afirmam que o trono pertencia à cidade, não à linhagem.'},
{title:'Registrar o juramento para negociar com Ulorian',desc:'O documento pode ser útil ao poder atual.',effect:{court:2,insight:2},out:'Você memoriza a fórmula, mas seu peso político permanece obscuro.'}]},
41:{title:'O trono que se recusa a nascer',text:'O altar projeta um trono de água. Ele promete autoridade instantânea e cobra uma declaração pública de submissão.',options:[
{title:'Recusar o trono vazio',desc:'Nenhum título vale mais que as pessoas à sua sombra.',effect:{autonomy:2,truth:1},out:'O trono dissolve-se. Um nome anônimo é libertado da pedra.'},
{title:'Aceitar que alguém deve mandar',desc:'Poder pode ser necessário, mesmo sem legitimidade.',effect:{court:2,stress:1},out:'Você recebe uma visão do rio governado por correntes.'},
{title:'Perguntar quem construiu as correntes',desc:'Investigar a origem material do governo.',effect:{insight:2,truth:2},out:'O altar mostra trabalhadores e barqueiros erguendo a cidade antes dos senhores.'}]},
39:{title:'O convite de Veren Marés-Rubras',text:'Um cortesão rubro oferece abrigo, descanso completo e orientação. Ele não mente sobre os perigos — apenas omite a dívida que deseja cobrar.',options:[
{title:'Recusar o pacto',desc:'O descanso oferecido custaria uma obrigação desconhecida.',effect:{autonomy:2,stress:-2},out:'Veren sorri, embora sua sombra se alongue com desagrado.'},
{title:'Aceitar ajuda sem entregar a Lança',desc:'Recuperar o fôlego em troca de uma promessa vaga.',effect:{demon:3,heal:40,supplies:2},out:'A recuperação vem rápido demais. Uma dívida vermelha foi inscrita em seu nome.'},
{title:'Enganar Veren e recolher sua confissão',desc:'Difícil, mas pode revelar sua missão real.',check:'guile',dc:16,effect:{truth:2,insight:2},fail:{stress:2,demon:1},out:'Entre duas frases cuidadosas, Veren admite querer levar a Lança para longe da foz.'}]},
21:{title:'O camareiro do Espelho Fundo',text:'Akaname lambe os espelhos do Claustro. Atrás dele estão reflexos de cada personagem; nenhum coincide exatamente com a pessoa que o criou.',options:[
{title:'Tratar o espelho como arquivo, não troféu',desc:'Reconhecer o ofício antigo dos escribas.',effect:{insight:2,truth:1,skip:'21'},out:'O Akaname inclina o rosto. Aceita sua passagem sem batalha.'},
{title:'Quebrar a etiqueta e desafiar o guardião',desc:'Uma luta difícil por um artefato do espelho.',battle:['akaname'],out:'O espelho revida com um riso de vidro partido.'}]},
22:{title:'A regência que desapareceu',text:'As correntes do trono vazio não prendem ninguém. Elas carregam os registros de uma cidade que era capaz de eleger e rejeitar seu regente.',options:[
{title:'Gravar o testemunho das pessoas comuns',desc:'A legitimidade será reconstruída por seus habitantes.',effect:{truth:2,autonomy:2},out:'Você ouve o nome de barqueiros, artesãos, pescadores e escribas.'},
{title:'Guardar apenas a fórmula de nomeação',desc:'Um instrumento de barganha com os senhores.',effect:{court:1,insight:2},out:'A fórmula é verdadeira, mas deixa de fora as vidas que a sustentaram.'}]},
23:{title:'Testemunhas que a Corte apagou',text:'Registradores sem rosto oferecem dar depoimento. Sua língua antiga nomeia o povo de Gualápoles como o verdadeiro sujeito de seus juramentos.',options:[
{title:'Preservar o depoimento integral',desc:'Carregar a verdade mesmo quando é perigosa.',effect:{truth:2,autonomy:1},out:'Um coro de nomes rompe o silêncio. Você registra o que o poder tentou apagar.'},
{title:'Selecionar apenas a prova útil',desc:'Informação seletiva aumenta o poder de negociação.',effect:{court:1,insight:1},out:'Uma testemunha se cala. Outra pergunta o preço das palavras não registradas.'}]},
25:{title:'O julgamento raso',text:'Um tribunal sem juízes pede uma definição de autoridade. O piso desce a cada resposta evasiva.',options:[
{title:'Autoridade exige consentimento permanente',desc:'Justifique o poder pela possibilidade de recusa.',effect:{autonomy:2,truth:1},out:'O tribunal inclina suas pedras em sinal de reconhecimento.'},
{title:'Autoridade é força capaz de assegurar a ordem',desc:'Uma resposta coerente, mas incompleta.',effect:{court:2,stress:1},out:'O tribunal permanece intacto, mas as correntes se apertam.'}]},
34:{title:'O scriptorium do sonho',text:'Escribas afogados escreveram aqui que sonhar era imaginar uma ordem ainda inexistente. O símbolo 夢 atravessa paredes de osso.',options:[
{title:'Recuperar o sonho coletivo',desc:'Compreender que o futuro não pertence a um senhor.',effect:{dream:1,insight:2,autonomy:1},out:'夢 ilumina seu caderno. O Sonho reconhece quem transforma memória em futuro.'},
{title:'Estudar o símbolo como instrumento de poder',desc:'Conhecimento valioso, mas sem compromisso político.',effect:{dream:1,insight:2},out:'Você aprende a forma e uma parte do poder do Sonho.'}]},
37:{title:'Peso e escolha',text:'Uma balança mede o peso de uma pessoa e o peso de seu título. O símbolo 根 aparece gravado na base.',options:[
{title:'Entregar seu título à balança',desc:'Escolher pertencer à terra antes de governá-la.',effect:{root:1,autonomy:2},out:'根 pulsa no osso. A Raiz aceita sua recusa da posse.'},
{title:'Entregar sua história à balança',desc:'Recordar que toda pessoa possui vínculos materiais.',effect:{root:1,truth:1,insight:1},out:'A balança transforma memória em raiz.'}]},
12:{title:'A janela entre mundos',text:'Uma janela mostra Shadowfade, onde as sombras parecem coroas. Uma inscrição de 光 permanece intacta atrás das ilusões.',options:[
{title:'Revelar a inscrição a todos',desc:'Tornar público aquilo que estava escondido.',effect:{light:1,truth:2},out:'光 se abre sobre a água. A Luz não é propriedade da Corte.'},
{title:'Guardar a inscrição em segredo',desc:'Conhecimento pode salvar sua própria companhia.',effect:{light:1,insight:1},out:'Você aprende a palavra, mas uma voz pergunta quem a ouvirá depois.'}]},
42:{title:'A teia que escuta',text:'Os fios de Jorō atravessam a água. Este não é seu covil: é uma rede de observação e lembrança.',options:[
{title:'Tocar os fios com respeito',desc:'Enviar uma impressão verdadeira à guardiã.',effect:{autonomy:1,trust:2},out:'A teia devolve uma sensação de curiosidade cuidadosa.'},
{title:'Cortar os fios',desc:'Abrir caminho à força, provocando a guardiã.',effect:{trust:-2,stress:1},out:'A água parece hesitar. Muito longe, algo se volta em sua direção.'}]},
43:{title:'O mirante da foz perdida',text:'Da varanda submersa é possível enxergar o reflexo da cidade que Gualápoles poderia ter sido. Não há um rei no reflexo: há uma multidão.',options:[
{title:'Lembrar os rostos dos habitantes',desc:'Guardar a visão como testemunho de futuro.',effect:{autonomy:1,truth:1,insight:1},out:'Uma voz sem corpo murmura que um povo não precisa ser herdado.'},
{title:'Marcar as rotas do antigo comércio',desc:'Transformar a memória do lugar em conhecimento.',effect:{insight:2,supplies:1},out:'O mapa do antigo rio surge por um instante.'}]}
};
Object.assign(SPECIAL,{
1:{title:'As três marcas da maré',text:'As placas ósseas giram. Três marcas suspensas precisam apontar para a gravidade verdadeira, não para a corrente aparente.',options:[
 {title:'Alinhar pelas bolhas que sobem',desc:'Reconhecer a direção real da gravidade.',check:'insight',dc:15,effect:{insight:2,truth:1},fail:{stress:1},out:'A corrente obedece e sulcos indicam as salas 2 e 14.'},
 {title:'Seguir o reflexo das paredes',desc:'Confiar na perspectiva ilusória da galeria.',effect:{stress:2},out:'Você retorna ao mesmo arco. A parede parece rir do engano.'}]},
2:{title:'Os nomes devolvidos pelo sal',text:'As tábuas contêm nomes de famílias vivas e títulos ribeirinhos, mas nenhum registro de uma linhagem shadow fey proprietária da foz.',options:[
 {title:'Usar sal para restaurar os nomes',desc:'Preservar registros de quem foi apagado.',effect:{truth:2,autonomy:1},out:'Três nomes reaparecem. Seu direito à travessia antecede a chegada da Corte.'},
 {title:'Copiar apenas a lista de tributos',desc:'Documentar recursos úteis à negociação.',effect:{court:1,insight:1},out:'Você registra números, mas os nomes tornam a desaparecer.'}]},
3:{title:'O mosaico de Gualápoles',text:'Porto, tribunal e foz aparecem no mesmo mosaico. O afundamento foi intencional: alguém escolheu negar um herdeiro sem legitimidade.',options:[
 {title:'Pressionar porto, tribunal e foz nessa ordem',desc:'Reconstruir a cidade por suas instituições materiais.',check:'insight',dc:15,effect:{truth:2,insight:2,root:1},fail:{stress:1},out:'Uma projeção mostra ruas antigas, trabalhadores e os pilares de Gualápoles.'},
 {title:'Pressionar a torre real primeiro',desc:'Procurar imediatamente o posto do regente.',effect:{court:1,insight:1},out:'O mosaico mostra um trono vazio e apaga as ruas.'}]},
9:{title:'O chamado que não atravessa',text:'Jorō está visível além do véu, mas nenhuma voz chega até ela. Há marcas rítmicas na parede.',options:[
 {title:'Responder às três batidas',desc:'Entender a existência de um protocolo de contato.',effect:{insight:2,trust:1},out:'Três batidas respondem. A guardiã percebe sua intenção, mas não pode conversar sem o Berrante.'},
 {title:'Exigir que a aranha entregue a Lança',desc:'Tentar romper o silêncio pela força da voz.',effect:{trust:-1,stress:1},out:'A água engole a ordem. O véu permanece intocado.'}]},
16:{title:'O nome que se perde',text:'Cada palavra perde uma sílaba. Um nome escrito sobre a parede sobrevive onde um título pronunciado desaparece.',options:[
 {title:'Escrever o nome de um cidadão anônimo',desc:'Preservar uma identidade sem título nobre.',effect:{autonomy:1,truth:2},out:'O nome resiste à água. Pela primeira vez, a sala permanece em silêncio.'},
 {title:'Escrever o título de um lorde',desc:'Testar o alcance da autoridade aristocrática.',effect:{court:1,insight:1},out:'As letras do título escorrem. A pedra preserva apenas o nome da pessoa.'}]},
17:{title:'Uma segunda testemunha de Jorō',text:'Outro ponto de observação revela a mesma barreira, mas por ângulo distinto. Gestos cruzam a água quando palavras não podem passar.',options:[
 {title:'Mostrar as mãos vazias',desc:'Indicar que a expedição veio ouvir e compreender.',effect:{trust:2,autonomy:1},out:'Jorō toca a água com uma perna de laca. O gesto é reconhecido.'},
 {title:'Apontar uma arma para o pedestal',desc:'Intimidar a guardiã.',effect:{trust:-2,stress:1},out:'A teia inteira vibra em advertência.'}]},
18:{title:'A piscina de futuros possíveis',text:'A superfície devolve não aquilo que aconteceu, mas aquilo que poderia ter acontecido. Ela oferece memória, futuro ou desejo.',options:[
 {title:'Pedir o passado',desc:'Descobrir por que o Arquivo foi afundado.',effect:{truth:2,insight:1},out:'Você vê o antigo guardião afundar a cidade para negar a posse ilegítima.'},
 {title:'Pedir o futuro',desc:'Imaginar outra forma de vida às margens da foz.',effect:{dream:1,autonomy:1},out:'Você vê um porto sem coleiras e um trono sem ocupante.'},
 {title:'Pedir seu próprio desejo',desc:'Descobrir a ambição íntima que move o grupo.',effect:{stress:1,insight:1},out:'O espelho mostra a vitória, mas não aqueles que pagariam por ela.'}]},
27:{title:'O depósito dos sonhos penhorados',text:'Ferramentas, brinquedos, cartas e roupas foram guardados como se a cidade fosse feita de lembranças, e não de títulos.',options:[
 {title:'Proteger os objetos pessoais',desc:'Tratar os sonhos antigos como pertencimento, não mercadoria.',effect:{dream:1,autonomy:2},out:'Um anel de água mostra quem desejava voltar a trabalhar e viver aqui.'},
 {title:'Vender os objetos mais preciosos',desc:'Financiar o restante da expedição.',effect:{coins:130,court:1},out:'Seu bolso pesa mais. Uma voz entre as caixas pede seu nome.'}]},
33:{title:'Juramentos quebrados',text:'O Arquivo distingue promessas abandonadas por medo daquelas rompidas para negar um poder ilegítimo.',options:[
 {title:'Romper o juramento de servidão',desc:'Uma promessa injusta não produz direito legítimo.',effect:{autonomy:2,truth:1},out:'O metal se aquece e uma corrente se desfaz.'},
 {title:'Restaurar toda promessa, mesmo injusta',desc:'Defender a estabilidade da palavra a qualquer preço.',effect:{court:2,stress:1},out:'As correntes se reorganizam. A dor do juramento permanece.'}]}
});
const COMPANION_LINES={
28:['Kera','Se esta escadaria já nos reconhece, então precisamos ter cuidado com tudo que afirmarmos aqui.'],
32:['Íria','Esses tanques não foram construídos para matar rapidamente. Foram construídos para transformar nomes em propriedade.'],
35:['Maira','Há uma diferença entre guardar uma cidade e possuí-la. Os barqueiros daqui sabiam disso.'],
40:['Kera','Um crocodilo do tamanho de uma fortaleza — e ele já preparou este lago. Vamos usar as colunas a nosso favor.'],
41:['Íria','A ausência do regente também é uma informação. Alguém escolheu manter este posto vazio.'],
13:['Maira','Aquela aranha não está guardando ouro. Está esperando saber quem somos quando ninguém nos der uma ordem.'],
21:['Íria','Um escriba pode tornar-se monstruoso sem esquecer a dignidade do próprio trabalho.'],
23:['Maira','Não podemos reduzir essas pessoas a provas que sejam úteis para a nossa causa.'],
34:['Íria','夢: o sonho não nos absolve do que fazemos para realizá-lo.'],
39:['Kera','Ele oferece exatamente o que precisamos. É por isso que me preocupa.'],
12:['Íria','光 é luz. Aqui também significa tornar visível aquilo que foi escondido. Uma coisa não deve falsificar a outra.'],
42:['Maira','A teia está nos observando há mais tempo do que sabemos. Ela não precisa nos matar para nos julgar.']
};

let notices=[],currentSeed=0;
function fresh(diff='normal',lead='iria'){
 const h=HEROES.map(u=>({id:u.id,hp:u.max,max:u.max,focus:u.focus,maxFocus:u.focus,shield:0,level:1}));
 return {version:1,started:Date.now(),diff,lead,loc:28,visited:[28],seen:{},searched:{},interacted:{},doors:{},wins:{},roster:h,coins:90,supplies:5,air:7,maxAir:7,seals:0,fragment:0,sealIds:[],fragmentIds:[],items:['Lanterna de Sal','Pergaminho dos Anéis'],keys:0,insight:0,truth:0,autonomy:0,court:0,demon:0,trust:0,stress:0,tide:0,dream:0,root:0,light:0,horn:false,spear:false,end:null,steps:0,battles:0,defeats:0,level:1,xp:0,notes:[],journal:['Entrada: seis anéis de água reconhecem o consentimento já pronunciado. A rota do tubarão gigante permanece destruída.'],visitedCount:1};
}
function save(){if(!game)return;try{localStorage.setItem(K,JSON.stringify(game))}catch(e){} }
function load(){try{const g=JSON.parse(localStorage.getItem(K));return g?.version===1&&g.roster?.length===3?g:null}catch(e){return null}}
function chronicle(){try{return JSON.parse(localStorage.getItem(STORY_KEY))||[]}catch(e){return []}}
function recordEnd(){try{let a=chronicle();a.unshift({end:game.end,date:new Date().toLocaleDateString('pt-BR'),rooms:game.visited.length,level:game.level});localStorage.setItem(STORY_KEY,JSON.stringify(a.slice(0,16)))}catch(e){}}
function announce(msg){notices.unshift(String(msg));notices=notices.slice(0,8);if(game){game.journal.unshift(String(msg));game.journal=game.journal.slice(0,120)}save()}
function show(head,body,buttons=[{title:'Continuar',act:'close'}]){dialog={head,body,buttons};drawModal()}
function closeDialog(){dialog=null;drawModal()}
function hpRatio(h){return Math.ceil(100*h.hp/h.max)}
function room(){return ROOMS[game.loc]}
function person(id){return HEROES.find(x=>x.id===id)}
function posHero(id){return game.roster.find(x=>x.id===id)}
function affinity(){const scores=[['Autonomia',game.autonomy],['Corte',game.court],['Abismo',game.demon]];return scores.sort((a,b)=>b[1]-a[1])[0][0]}
function rollCheck(type,dc){const mod=type==='guile'?Math.floor(game.insight/5)+3:type==='insight'?Math.floor(game.insight/4)+4:type==='force'?game.level+4:Math.floor(game.truth/5)+4;let die=roll();if(type==='insight'&&game.seals>=3)mod+=2;
 let success=die===20||die!==1&&die+mod>=dc;
 if(!success&&type==='insight'&&game.seals>=6&&!game.seen['sealReroll_'+game.loc]){
  game.seen['sealReroll_'+game.loc]=true;die=roll();success=die===20||die!==1&&die+mod>=dc;announce('Seis Selos da Foz resistem à ilusão: o Arquivo concede uma segunda leitura.');
 }
 return {die,mod,total:die+mod,pass:success}}
function apply(e){if(!e)return;for(const [k,v] of Object.entries(e)){
 if(k==='heal'){game.roster.forEach(h=>h.hp=Math.min(h.max,h.hp+v));continue}
 if(k==='skip'){game.wins[v]=true;continue}
 if(k==='battle')continue;
 if(typeof game[k]==='number')game[k]=Math.max(k==='stress'?0:0,game[k]+v)
 } save()}
function safe(){return [28,33,42,9].includes(game.loc)}
function roomMonsters(id=game.loc){return ENCOUNTERS[id]||null}
function initiativeRoom(){const id=game.loc;if(game.end||game.wins[id]||game.interacted[id])return;if(id===40&&!game.horn){show('A água negra se move','Gharoz ocupa este lago. O Berrante Aquático está preso às suas escamas. Você pode enfrentá-lo agora ou recuar pelas passagens abertas.',[{title:'Confrontar Gharoz e tomar o Berrante',act:'boss',arg:'gharoz'},{title:'Recuar e preparar a companhia',act:'close'}]);return}if(id===38&&!game.wins[id]){show('A quebra das âncoras','Morgat bloqueia uma antiga passagem e martela os pilares. Uma derrota aqui espalharia o horror do Abismo.',[{title:'Enfrentar Morgat',act:'boss',arg:'morgat'},{title:'Evitar o confronto',act:'close'}]);return}}
function begin(diff,lead){game=fresh(diff,lead);tab='scene';ability=null;combat=null;notices=[];save();render();show('O convite da água','Vocês regressam ao Arquivo pela entrada demolida por um tubarão gigante. Há um pacto já aceito, uma Lança além das barreiras e uma guardiã que não se deixa reduzir a inimiga. A missão começa no Limiar do Consentimento.',[{title:'Entrar no Arquivo',act:'close'}])}
function travel(to,door){if(combat||dialog)return;if(!ROOMS[to])return;
 const key=doorKey(game.loc,to,door?.id);let d=door||room().doors.find(x=>x.to===to)||null;
 if(d&&!game.doors[key]&&!d.broken){if(d.secret&&!game.seen['secret_'+key]){show('Passagem oculta','A moldura esconde uma rota que o Arquivo não revelou. Investigue a sala ou teste sua intuição.',[{title:'Examinar a passagem',act:'doorcheck',arg:key},{title:'Voltar',act:'close'}]);return}if(d.dc){show('Porta ritual — '+d.id,`<span class="sub">${esc(d.attrs)}</span><p>Um teste de destreza/arcana pode destrancar a passagem. Você também pode arrombá-la, fazendo ruído e atraindo a maré.</p>`,[{title:'Destrancar',act:'dooropen',arg:key},{title:'Arrombar (custa fôlego)',act:'doorbreak',arg:key},{title:'Cancelar',act:'close'}]);return}}
 finishTravel(to,d)}
function doorKey(a,b,id){return [Math.min(a,b),Math.max(a,b),id||'n'].join('_')}
function decodeDoor(k){for(const d of room().doors){if(doorKey(game.loc,d.to,d.id)===k)return d}return null}
function finishTravel(to,d){const previous=game.loc;closeDialog();game.loc=to;game.steps++;game.tide=clamp(game.tide+1,0,30);
 if(ROOMS[to].fields['Estado hídrico']?.startsWith('Completamente')){game.air=Math.max(0,game.air-1);if(game.items.some(i=>i.includes('Astrolábio da Maré Oblíqua'))&&game.steps%3===0)game.air=Math.min(game.maxAir,game.air+1);if(game.air===0){const mage=posHero('iria');if(mage.focus>=2){mage.focus-=2;game.air=3;announce('Íria sustenta uma bolha ritual de ar e gasta 2 pontos de Foco.')}else{game.roster.forEach(h=>h.hp=Math.max(1,h.hp-8));game.stress++;game.air=3;announce('A companhia quase se afoga. Recupera fôlego por uma passagem estreita e perde vigor.')}}}else game.air=Math.min(game.maxAir,game.air+2);
 if(d?.trap&&!game.doors['trap_'+doorKey(previous,to,d.id)]&&Math.random()<.22){game.doors['trap_'+doorKey(previous,to,d.id)]=true;game.stress++;for(const h of game.roster)h.hp=Math.max(1,h.hp-3);announce('Uma armadilha residual causa dano leve e agrava o medo da companhia.')}
 const freshVisit=!game.visited.includes(to);if(freshVisit){game.visited.push(to);game.insight++;announce('Descoberta: '+ROOMS[to].name)}
 if(freshVisit&&ENCOUNTERS[to]&&!['morgat','gharoz','akaname'].includes(ENCOUNTERS[to][0])&&Math.random()<.23){startBattle(ENCOUNTERS[to],'Emboscada em '+ROOMS[to].name);return}
 if(game.tide%7===0){game.stress=clamp(game.stress+1,0,30);announce('A maré sobe; os ecos do Arquivo ficam mais insistentes.')}
 save();tab='scene';render();initiativeRoom()}
function chooseSpecial(idx){const sp=SPECIAL[game.loc];if(!sp||game.interacted[game.loc])return;const c=sp.options[idx];if(!c)return;closeDialog();
 let msg=c.out;if(c.check){const r=rollCheck(c.check,c.dc);if(!r.pass){apply(c.fail);msg=`Teste ${r.die}+${r.mod}=${r.total} (CD ${c.dc}): falha. ${c.title} não produz o resultado esperado.`}else apply(c.effect)}else apply(c.effect);
 game.interacted[game.loc]=true;announce(msg);
 if(c.battle){save();render();startBattle(c.battle,'Desafio do Espelho')}else {save();render();show('O Arquivo responde',msg)} }
function interact(){if(!game||combat)return;const id=game.loc;
 if(id===13){finalJudgment();return}
 if(id===40){if(game.horn){show('O lago silenciou','O Berrante Aquático pertence à companhia. Gharoz já não governa esta sala.');return}if(!game.wins[40]){show('Gharoz espera sob a superfície','O crocodilo guarda o Berrante. Não há caminho honesto para obtê-lo sem vencer ou negociar com seu guardião.',[{title:'Enfrentar Gharoz',act:'boss',arg:'gharoz'},{title:'Preparar-se',act:'close'}]);return}}
 if(id===38&&!game.wins[38]){startBattle(['morgat'],'A Ruptura de Morgat');return}
 const sp=SPECIAL[id];if(sp){if(game.interacted[id]){show('Memória de '+ROOMS[id].name,'O Arquivo já registrou sua decisão nesta sala. Sua consequência não pode ser simplesmente apagada.');return}
 show(sp.title,`<p>${esc(sp.text)}</p><div class="smallprint">Escolhas persistentes: o Arquivo se lembrará.</div>`,sp.options.map((v,i)=>({title:v.title,sub:v.desc,act:'special',arg:i})).concat([{title:'Ainda não decidir',act:'close'}]));return}
 const r=room(),f=r.fields; if(!game.interacted[id]){
 let rc=rollCheck('insight',15+Math.floor(id/14));if(rc.pass){game.insight+=2;game.truth++;announce(`Você compreende o mecanismo: ${f['Interações relevantes']||f['Pista concreta (sem teste)']}`)}else{game.stress++;announce('O mecanismo se fecha antes de revelar seu segredo. A água registra a tentativa.')}
 game.interacted[id]=true;save();render();show('Interagir com o Arquivo',rc.pass?`Teste ${rc.total}: ${esc(f['Interações relevantes']||'Você descobre uma relação antiga.')}`:`Teste ${rc.total}: o mecanismo resiste. ${esc(f['Pressão / Encontro']||'Uma sombra passa pela água.')}`)
 }else show('Marcas do ritual','Esta sala já respondeu às suas perguntas. Os símbolos permanecem, mas não são infinitos.')}
function observe(){const id=game.loc,r=room();if(!game.seen['observe_'+id]){game.seen['observe_'+id]=true;game.insight++;save();announce('Observação: '+(r.fields['Pista concreta (sem teste)']||'O lugar guarda um testemunho antigo.'))}render();show('Uma verdade visível',esc(r.fields['Pista concreta (sem teste)']||'O tempo marcou a sala.'))}
function revealDoor(){const candidates=room().doors.filter(d=>d.secret&&!game.seen['secret_'+doorKey(game.loc,d.to,d.id)]);if(candidates.length){for(const d of candidates){if(Math.random()<.62){game.seen['secret_'+doorKey(game.loc,d.to,d.id)]=true;announce('Passagem secreta revelada: '+d.id+' para sala '+d.to)}}save()}}
function search(){const id=game.loc,r=room();if(id===13&&!game.spear){show('Pedestal inacessível','Jorō e a barreira mantêm a Lança e o Selo XII fora de alcance. É preciso conquistar seu reconhecimento ou derrotá-la.');return}if(game.searched[id]){show('Já vasculhada','Este ambiente não guarda outro tesouro que você possa recolher.');return}
 game.searched[id]=true;game.tide++;const check=rollCheck('insight',11+Math.floor(id/12));const risk=game.stress>6?3:0;
 const trap=r.fields['Armadilha de ilusão']||''; if(check.pass){
 const item=r.fields['Tesouro / recompensa']||'Um relicário antigo';const collect=r.fields['Colecionável']||'';
 if(item&&game.items.length<150&&id!==13)game.items.push(item.split(/[.;]/)[0].slice(0,92));
 const sm=/Selo da Foz\s+([IVX]+)/i.exec(collect);if(sm&&id!==13&&id!==34&&id!==37&&!game.sealIds.includes(sm[1])){game.sealIds.push(sm[1]);game.seals=game.sealIds.length}
 const fm=/Fragmento do Juramento\s+([IVX]+)/i.exec(collect);if(fm&&!game.fragmentIds.includes(fm[1])){game.fragmentIds.push(fm[1]);game.fragment=game.fragmentIds.length}
 const coin=/\b(\d+)\s+Moedas dos Mortos Afogados/i.exec(collect);if(coin)game.coins+=Number(coin[1])*8;
 game.coins+=20+rnd(30);game.supplies+=Math.random()<.3?1:0;revealDoor();announce('Tesouro recuperado em '+r.name+'. '+collect);
 show('Achado preservado',`<p>Teste ${check.die}+${check.mod}=${check.total} contra a dificuldade: sucesso.</p><p><span class="goldtext">${esc(item)}</span></p><p>${esc(collect)}</p>`)
 }else{
 game.stress+=1+risk;game.roster[rnd(3)].hp=Math.max(1,game.roster[rnd(3)].hp-5);revealDoor();announce('Busca malograda: a ilusão deixa marcas.' );show('A armadilha do Arquivo',`<p>Teste ${check.die}+${check.mod}=${check.total}: a busca falhou.</p><p>${esc(trap||'A sala desvia a atenção e fere um membro da companhia.')}</p>`)
 }
 save();render()}
function rest(){if(!safe()&&game.supplies<=0){show('Sem provisões','Longe de abrigo, a companhia precisa ter provisões para descansar.');return}let fee=safe()?0:1;if(fee)game.supplies--;game.tide+=2;game.stress=clamp(game.stress-2,0,30);game.air=game.maxAir;game.roster.forEach(h=>{h.hp=Math.min(h.max,h.hp+Math.round(h.max*.40));h.focus=Math.min(h.maxFocus,h.focus+5)});announce('A companhia descansou; os olhos do Arquivo permaneceram abertos.');save();render();show('Breve descanso','A companhia recupera vigor, mas o tempo corre. A água tornou-se menos tranquila.')}
function startBattle(types,source='Ameaça do Arquivo'){
 if(!game||game.end)return;
 const remaining=game.roster.some(h=>h.hp>0);if(!remaining){loseBattle();return}
 const tiles=Array.from({length:49},(_,i)=>({type:(i%7===3&&i!==24?'water':(i+game.loc*3)%17===0?'rock':(i+game.loc*7)%11===0?'mist':'floor'),mist:0}));
 const allies=game.roster.map((h,i)=>({id:h.id,name:person(h.id).name,x:i===0?1:i===1?0:1,y:i===0?3:i===1?4:5,hp:h.hp,max:h.max,ac:person(h.id).ac+game.level-1,focus:h.focus,maxFocus:h.maxFocus,shield:0,root:0,mark:0,stun:0,done:false,moved:false,kind:'ally',alive:true}));
 let n=0;const enemies=types.map((k,i)=>{const f=FOES[k]||FOES.lamp,power=(game.diff==='difícil'?1.25:game.diff==='fácil'?.78:1),scale=f.boss?1:1+Math.max(0,game.level-1)*.12;return {id:'e'+n++,type:k,name:f.name,x:i===0?5:Math.max(3,6-i),y:Math.max(0,Math.min(6,2+i)),hp:Math.round(f.hp*power*scale),max:Math.round(f.hp*power*scale),ac:f.ac+Math.round(game.level*.3),attack:f.attack,dmg:f.dmg,range:f.range,spd:f.spd,behavior:f.behavior,boss:!!f.boss,kind:'enemy',root:0,mark:0,stun:0,shield:0}});
 for(const u of [...allies,...enemies]){const t=tiles[u.y*7+u.x];if(t.type==='rock')t.type='floor'}
 if(game.items.some(i=>i.includes('Selo do Trono Vazio'))&&game.autonomy>game.court)allies.forEach(u=>u.shield=7);
 combat={tiles,allies,enemies,round:1,hornUsed:false,source,logs:['O combate começa. Escolha um herói, mova-o e selecione uma habilidade.'],sel:'kera',skill:null,startedAt:game.loc};tab='battle';dialog=null;ability=null;save();render();}
function bTile(x,y){return combat.tiles[y*7+x]}
function dist(a,b){return Math.abs(a.x-b.x)+Math.abs(a.y-b.y)}
function living(){return [...combat.allies,...combat.enemies].filter(x=>x.hp>0)}
function at(x,y){return living().find(u=>u.x===x&&u.y===y)}
function inBounds(x,y){return x>=0&&x<7&&y>=0&&y<7}
function pathlen(start,dest,canFloat=false){if(!inBounds(dest.x,dest.y)||at(dest.x,dest.y)||bTile(dest.x,dest.y).type==='rock'&&!canFloat)return Infinity;
 let queue=[[start.x,start.y,0]],seen=new Set([start.x+','+start.y]);for(let i=0;i<queue.length;i++){let [x,y,d]=queue[i];if(x===dest.x&&y===dest.y)return d;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(!inBounds(nx,ny)||seen.has(k)||bTile(nx,ny).type==='rock'&&!canFloat||at(nx,ny)&&!(nx===dest.x&&ny===dest.y))continue;seen.add(k);queue.push([nx,ny,d+1])}}return Infinity}
function chosenHero(){return combat?.allies.find(x=>x.id===combat.sel)}
function logBattle(s){combat.logs.unshift(s);combat.logs=combat.logs.slice(0,60)}
function hit(u,amt,why){const shield= Math.min(amt,u.shield||0);u.shield-=shield;u.hp=Math.max(0,u.hp-Math.max(0,amt-shield));logBattle((why||u.name)+` (${Math.max(0,amt-shield)} dano)`);if(u.hp===0)logBattle(u.name+' caiu!')}
function bSelect(id){if(!combat)return;const h=combat.allies.find(u=>u.id===id);if(h?.hp>0){combat.sel=id;combat.skill=null;render()}}
function skillPick(key){const h=chosenHero();if(!h||h.hp<=0||h.done)return;const skill=SKILLS[key];if((!person(h.id).skills.includes(key)&&!(key==='horn'&&game.horn&&h.id==='iria'))||key==='horn'&&combat.hornUsed||h.focus<skill.cost)return;combat.skill=key;
 if(['guard','quake'].includes(skill.kind)){cast(h,skill,h);return}
 render();}
function bTap(x,y){if(!combat)return;const h=chosenHero(),unit=at(x,y);if(!h||h.hp<=0)return;if(unit?.kind==='ally'&&!(combat.skill&&SKILLS[combat.skill].kind==='heal')){bSelect(unit.id);return}
 if(combat.skill){const sk=SKILLS[combat.skill];let target=unit||{x,y};if(!h.done&&h.focus>=sk.cost&&dist(h,target)<=sk.range){if(['attack','heal'].includes(sk.kind)&&(!unit||sk.kind==='heal'&&unit.kind!=='ally'||sk.kind==='attack'&&unit.kind!=='enemy')){logBattle('Escolha um alvo válido.');render();return}if(!hasSight(h,target)&&sk.kind!=='mist'&&sk.kind!=='tide'){logBattle('A névoa bloqueia a visão.');render();return}cast(h,sk,target);return}logBattle('O alvo está longe demais ou o herói já agiu.');render();return}
 if(unit?.kind==='enemy'){logBattle('Selecione uma habilidade para atacar.');render();return}
 if(!h.moved&&h.root<=0&&inBounds(x,y)&&pathlen(h,{x,y})<=person(h.id).spd){h.x=x;h.y=y;h.moved=true;logBattle(h.name+' se moveu.');render();return}logBattle('Escolha uma casa alcançável ou use uma habilidade.');render()}
function hasSight(a,b){let steps=Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));for(let i=1;i<steps;i++){let x=Math.round(a.x+(b.x-a.x)*i/steps),y=Math.round(a.y+(b.y-a.y)*i/steps),t=bTile(x,y);if(t?.type==='rock'||t?.mist>0||t?.type==='mist')return false}return true}
function cast(h,sk,target){h.focus-=sk.cost;h.done=true;if(sk===SKILLS.horn)combat.hornUsed=true;combat.skill=null;const dice=roll(),bonus=person(h.id).attack+game.level-1;
 const spell=!!sk.arcane;
 if(sk.kind==='attack'){const enemy=target,damage=sk.damage+(game.level-1)*2+rnd(6);const def=enemy.ac-(sk.pierce||0)-(enemy.mark?3:0);if(dice===20||dice!==1&&dice+bonus>=def){hit(enemy,Math.round(damage*(dice===20?1.55:1)),h.name+' usa '+sk.name);if(sk.root)enemy.root=sk.root;if(sk.knock&&game.items.includes('Âncora Partida de Morgat'))enemy.stun=1;if(sk.knock){let dx=Math.sign(enemy.x-h.x),dy=Math.sign(enemy.y-h.y);if(inBounds(enemy.x+dx,enemy.y+dy)&&!at(enemy.x+dx,enemy.y+dy)&&bTile(enemy.x+dx,enemy.y+dy).type!=='rock'){enemy.x+=dx;enemy.y+=dy}}if(sk.mark)enemy.mark=sk.mark}else logBattle(h.name+' falhou '+sk.name+` (${dice}+${bonus} < ${def}).`)
 }else if(sk.kind==='heal'){target.hp=Math.min(target.max,target.hp+sk.damage+game.level*3);logBattle(h.name+' curou '+target.name)}
 else if(sk.kind==='guard'){combat.allies.filter(a=>a.hp>0).forEach(a=>a.shield=Math.min(30+game.level*3,a.shield+11+game.level*3));logBattle('Um juramento protege toda a companhia.')}
 else if(sk.kind==='quake'){let count=0;combat.enemies.filter(e=>e.hp>0&&dist(h,e)<=2).forEach(e=>{hit(e,12+game.level*2,'Âncora de Thargrid');e.stun=1;count++});if(!count)logBattle('A onda sísmica não atingiu ninguém.')}
 else if(sk.kind==='mist'){let count=0;for(let y=0;y<7;y++)for(let x=0;x<7;x++)if(Math.abs(target.x-x)<=1&&Math.abs(target.y-y)<=1){bTile(x,y).mist=2;count++}logBattle('Uma névoa envolve '+count+' casas.')}
 else if(sk.kind==='tide'){const hits=combat.enemies.filter(e=>e.hp>0&&Math.abs(e.x-target.x)<=1&&Math.abs(e.y-target.y)<=1);hits.forEach(e=>hit(e,sk.damage+game.level*2+rnd(5),'Maré Invocada'));for(let y=0;y<7;y++)for(let x=0;x<7;x++)if(Math.abs(x-target.x)<=1&&Math.abs(y-target.y)<=1)bTile(x,y).type='water';logBattle('A água altera o campo de batalha.')}
 afterAction()}
function afterAction(){if(!combat)return;const alive=combat.enemies.filter(e=>e.hp>0);if(!alive.length){winBattle();return}
 const next=combat.allies.find(h=>h.hp>0&&!h.done);if(next)combat.sel=next.id;render()}
function endRound(){if(!combat)return;
 for(const enemy of combat.enemies.filter(e=>e.hp>0)){
  if(!combat.allies.some(a=>a.hp>0))break;
  if(enemy.stun>0){enemy.stun--;logBattle(enemy.name+' perde a ação: está atordoado.');continue}
  let candidates=combat.allies.filter(a=>a.hp>0).sort((a,b)=>dist(enemy,a)-dist(enemy,b));let target=candidates[0];if(!target)break;
  if(dist(enemy,target)>enemy.range&&!enemy.root){
   let poss=[];for(let y=0;y<7;y++)for(let x=0;x<7;x++){
    if((x===enemy.x&&y===enemy.y)||at(x,y)||bTile(x,y).type==='rock')continue;
    let len=pathlen(enemy,{x,y});if(len<=enemy.spd)poss.push({x,y,d:Math.abs(x-target.x)+Math.abs(y-target.y),len})
   }
   poss.sort((a,b)=>a.d-b.d||a.len-b.len);
   if(poss.length&&poss[0].d<dist(enemy,target)){enemy.x=poss[0].x;enemy.y=poss[0].y}
  }
  if(enemy.root>0)enemy.root--;
  candidates=combat.allies.filter(a=>a.hp>0).sort((a,b)=>dist(enemy,a)-dist(enemy,b));target=candidates[0];if(!target)continue;
  // A lógica dos chefes converte movimentos canônicos em efeitos digitais uma vez por turno.
  if(enemy.boss&&combat.round%3===0){
   if(enemy.behavior==='horror'){
    const caught=candidates.filter(u=>dist(u,target)<=1).slice(0,2);
    caught.forEach(u=>{hit(u,11+rnd(5),'Gharoz: Mordida do Sonho Podre');u.root=2;u.focus=Math.max(0,u.focus-1)});
    logBattle('A água negra revela a rota real de Gharoz. Evite ficar agrupado.');continue;
   }
   if(enemy.behavior==='smash'){
    candidates.slice(0,2).forEach(u=>{hit(u,10+rnd(4),'Morgat: Corrente do Pânico');u.shield=Math.max(0,u.shield-4)});
    logBattle('O impacto das âncoras dispersa a formação.');continue;
   }
   if(enemy.behavior==='mirror'){
    enemy.shield=Math.min(26,enemy.shield+16);candidates[0].mark=2;
    logBattle('Akaname: Imagem Rasgada! Um reflexo protege o verdadeiro corpo.');continue;
   }
   if(enemy.behavior==='dream'){
    candidates.forEach(u=>{hit(u,9+rnd(5),'Jorō: Maré Onírica');u.focus=Math.max(0,u.focus-1)});
    candidates[0].root=2;logBattle('A realidade dobra-se entre os fios de Jorō.');continue;
   }
  }
  if(dist(enemy,target)<=enemy.range&&(enemy.range<=1||hasSight(enemy,target))){
   const attack=roll(),bonus=enemy.attack+(game.diff==='difícil'?1:game.diff==='fácil'?-1:0),ac=target.ac;
   if(attack===20||attack!==1&&attack+bonus>=ac){
    const dmg=Math.round((enemy.dmg+rnd(5))*(game.diff==='difícil'?1.13:game.diff==='fácil'?.79:1));
    hit(target,dmg,enemy.name+` (${attack}+${bonus} vs Defesa ${ac})`);
    if(enemy.behavior==='curse'&&combat.round%2===0)target.focus=Math.max(0,target.focus-1);
    if(enemy.behavior==='ranged'&&combat.round%3===0)bTile(target.x,target.y).mist=2;
    if(enemy.behavior==='rush'&&enemy.type==='lamp')target.focus=Math.max(0,target.focus-1);
   }else logBattle(enemy.name+` falhou (${attack}+${bonus} vs Defesa ${ac}).`)
  }else logBattle(enemy.name+' avança pelas ruínas.')
 }
 for(const t of combat.tiles)if(t.mist>0)t.mist--;
 if(!combat.allies.some(a=>a.hp>0)){loseBattle();return}
 for(const h of combat.allies){h.done=false;h.moved=false;if(h.root)h.root--;if(h.mark)h.mark--}
 for(const e of combat.enemies)if(e.mark)e.mark--;
 combat.round++;combat.sel=combat.allies.find(a=>a.hp>0)?.id||'kera';logBattle('A rodada '+combat.round+' começa.');render()
}
function winBattle(){const id=combat.startedAt,boss=combat.enemies.find(e=>e.boss)?.type,exp=30+combat.enemies.length*20+(boss?90:0);
 for(const u of combat.allies){const h=posHero(u.id);h.hp=Math.max(1,u.hp);h.focus=u.focus;h.hp=Math.min(h.max,h.hp+8)}
 game.wins[id]=true;game.battles++;game.xp+=exp;game.coins+=20+(boss?75:15);game.insight+=boss?2:1;
 if(boss==='gharoz'){game.horn=true;game.items.push('Berrante Aquático de Gharoz');announce('Gharoz foi derrotado. O Berrante Aquático está com a companhia. Seu som pode alcançar Jorō.')}
 if(boss==='akaname'){game.items.push('Lâmina do Espelho Fundo');game.truth++}
 if(boss==='morgat'){game.items.push('Âncora Partida de Morgat');game.autonomy++}
 if(boss==='joro'){
  game.spear=true;if(!game.items.includes('Lança da Perdição'))game.items.push('Lança da Perdição');
  combat=null;tab='scene';save();render();
  show('Jorō abandona a barreira',`<p>Ao aceitar o confronto, a própria guardiã atravessou e rompeu sua barreira. Agora vencida, ela não pode impedir que levem a Lança.</p><p>A vitória das armas não respondeu à pergunta da foz: <b>para quem o poder será usado?</b></p>`,[
  {title:'Tomar a Lança sem reconhecer senhor algum',act:'ending',arg:'ruptura'},
  {title:'Entregar a Lança a Ulorian',act:'ending',arg:'coroa'},
  {title:'Entregar a Lança a Veren',act:'ending',arg:'abismo'}]);return
 }

 while(game.xp>=game.level*110){game.xp-=game.level*110;game.level++;game.roster.forEach(h=>{h.max+=9;h.hp=Math.min(h.max,h.hp+22);h.maxFocus++;h.focus=Math.min(h.maxFocus,h.focus+3)})}
 announce('Vitória na sala '+id+': '+exp+' experiência. A companhia alcança nível '+game.level+'.');combat=null;tab='scene';save();render();show('A água volta a respirar',`A companhia sobreviveu a ${esc(ROOMS[id].name)}. Recompensa: ${exp} EXP, tesouros e repouso breve. ${boss==='gharoz'?'O Berrante Aquático foi recuperado.':''}`)}
function loseBattle(){game.defeats++;game.coins=Math.max(0,game.coins-40);game.supplies=Math.max(1,game.supplies-1);game.stress+=2;game.tide+=3;game.air=game.maxAir;game.roster.forEach(h=>{h.hp=Math.max(1,Math.round(h.max*.55));h.focus=Math.max(3,Math.round(h.maxFocus*.5))});game.loc=28;combat=null;tab='scene';announce('A companhia foi resgatada pelo fluxo e voltou ao Limiar. Os mortos cobraram seu preço.');save();render();show('A água não recebeu seus nomes','Todos caíram, mas o pacto de entrada impediu que o Arquivo os esquecesse. Vocês despertam no Limiar, perdendo suprimentos e moedas. A derrota permanece no registro.')}
function maybeBattle(){const ids=roomMonsters();if(!ids){show('A sala está quieta','Nenhuma presença hostil se revela agora. A verdadeira ameaça talvez esteja nos seus registros.');return}if(game.wins[game.loc]){show('Ameaça vencida','Seus antigos inimigos já foram derrotados ou dispensados.');return}startBattle(ids,'Confronto em '+room().name)}
function finalJudgment(){if(game.end)return;
 if(game.wins[13]&&game.spear){show('A Lança tomada por violência','A barreira foi rompida por Jorō antes do duelo. Resta escolher o destino de uma vitória sem seu reconhecimento.',[{title:'Manter a Lança fora dos senhores',act:'ending',arg:'ruptura'},{title:'Entregar a Ulorian',act:'ending',arg:'coroa'},{title:'Entregar a Veren',act:'ending',arg:'abismo'}]);return}
 if(!game.horn){show('A barreira da Lança','Jorō está além de uma barreira que só ela pode romper. Sem o Berrante Aquático de Gharoz não é possível convocar sua atenção com clareza. A barreira repele a violência e o silêncio da água engole toda tentativa de negociação.',[{title:'Voltar à exploração',act:'close'}]);return}
 const roots=game.dream+game.root+game.light,proof=game.fragment>=3||game.seals>=5||game.truth>=7;
 const assessment=(proof?'Você traz registros suficientes para contestar a versão da Corte. ':'Faltam testemunhos e documentos — Jorō percebe essa ausência. ')+(roots>=2?'Sonho, Raiz e Luz começaram a reaparecer em sua jornada. ':'Você ainda compreende pouco da tríade antiga. ');
 const options=[{title:'Restituir a Lança à memória coletiva',desc:'Defender um futuro da foz sem senhores.',act:'ending',arg:'liberta'}, {title:'Entregar a Lança ao Senhor do Rio',desc:'Estabilizar o poder de Ulorian por meio da autoridade ritual.',act:'ending',arg:'coroa'},{title:'Aceitar a oferta de Veren e entregar a Lança',desc:'Uma saída rápida, agora cobrada pelo Abismo.',act:'ending',arg:'abismo'},{title:'Exigir um duelo com Jorō',desc:'Apenas ela pode romper a barreira. Ela aceita lutar — e a vitória terá um preço.',act:'boss',arg:'joro'},{title:'Sair e investigar mais',act:'close'}];
 show('Jorō — Julgamento do Sonho',`<p>O Berrante chama. A aranha de laca ergue-se atrás da barreira, os olhos refletindo cidades que ainda não nasceram.</p><p class="quote">“Um trono se ocupa. Uma terra se pertence. Dize-me: a quem serviria a tua vitória?”</p><p>${assessment}</p>`,options)}
function finish(kind){closeDialog();if(kind==='liberta'&&!(game.horn&&!game.wins[13]&&(game.truth>=5||game.fragment>=3)&&game.autonomy>=2)){show('Julgamento incompleto','Jorō pede mais que uma boa intenção: testemunhos reais da história da foz e sinais de autonomia. Retorne ao Arquivo, encontre fragmentos e escute os mortos.');return}
 if((kind==='coroa'||kind==='abismo')&&!game.wins[13]){
  show('Jorō recusa a herança',`<p>“Não guardo a Lança para entregá-la a Ulorian, tampouco para oferecer a água aos demônios.”</p><p>A guardiã só abrirá a barreira por uma escolha legítima ou para aceitar um duelo contra aqueles que exigem possuí-la.</p>`,[{title:'Exigir um duelo contra Jorō',act:'boss',arg:'joro'},{title:'Continuar investigando',act:'close'}]);return
 }

 game.spear=true;game.end=kind;if(!game.items.includes('Lança da Perdição'))game.items.push('Lança da Perdição');if(!game.sealIds.includes('XII')){game.sealIds.push('XII');game.seals=game.sealIds.length;}const titles={liberta:'O Nome Devolvido',coroa:'A Coroa de Água',abismo:'O Abismo Assina',ruptura:'A Lança Arrancada'};
 announce('FIM: '+titles[kind]);save();recordEnd();tab='ending';combat=null;render()}
function roomArt(n){let seed=n*1123,rand=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};let circles='',bones='',strands='',w=400,h=195;
 for(let i=0;i<36;i++){let x=rand()*w,y=rand()*h,r=rand()*3+1;circles+=`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="none" stroke="#8cbec7" stroke-opacity="${(.08+rand()*.28).toFixed(2)}" />`}
 for(let i=0;i<7;i++){let x=10+i*68+rand()*13; bones+=`<rect x="${x.toFixed(0)}" y="${(30+rand()*20).toFixed(0)}" width="${(16+rand()*14).toFixed(0)}" height="180" fill="#071923" opacity=".75" rx="5"/><path d="M${x-8} 52 h45 l-8 14 h-27 z" fill="#637778" opacity=".35"/>`}
 for(let i=0;i<8;i++){let x=rand()*w;strands+=`<path d="M${x} 0 Q${x+rand()*30-15} 80 ${x+rand()*60-30} 195" stroke="${n===13?'#d6b0bd':'#6cc3c5'}" stroke-width=".65" opacity=".35" fill="none"/>`}
 const sigil=n===13?'夢':n===40?'死':n===41?'根':n===12?'光':n===28?'本':'◈';return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Ruínas submersas do Arquivo, arte procedural"><defs><radialGradient id="glow"><stop stop-color="#417d85" stop-opacity=".6"/><stop offset="1" stop-color="#04111e" stop-opacity=".05"/></radialGradient><linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#092a38"/><stop offset="1" stop-color="#041421"/></linearGradient></defs><rect width="400" height="195" fill="url(#floor)"/><ellipse cx="220" cy="90" rx="190" ry="100" fill="url(#glow)"/>${strands}<g>${bones}</g><path d="M0 144 Q100 129 190 147 T400 135 V195 H0" fill="#215363" opacity=".6"/><path d="M0 150 Q100 135 190 154 T400 142" stroke="#7ac4ca" stroke-opacity=".32" fill="none" stroke-width="2"/>${circles}<text x="205" y="116" fill="#dfc892" fill-opacity=".35" font-size="76" font-family="serif" text-anchor="middle">${sigil}</text></svg>`}
function topbar(){return `<header class="top"><div class="brand">Arquivo dos Mortos Afogados<small>CRÔNICAS DA CARCAÇA</small></div><div class="row"><span class="pill">${offlineReady?'✓ OFFLINE · ':''}${game?'Sala '+game.loc+' · NV '+game.level:'RPG OFFLINE'}</span></div></header>`}
function status(){if(!game)return'';return `<div class="stats"><span class="stat">🪙 <strong>${game.coins}</strong></span><span class="stat">🍞 <strong>${game.supplies}</strong></span><span class="stat">💨 <strong>${game.air}/${game.maxAir}</strong></span><span class="stat">◈ Selos <strong>${game.seals}/12</strong></span><span class="stat">✒ Fragmentos <strong>${game.fragment}/6</strong></span><span class="stat">🌊 Maré <strong>${game.tide}</strong></span><span class="stat">🕯 Tensão <strong>${game.stress}</strong></span></div>`}
function nav(){return `<nav class="nav"><button class="${tab==='scene'?'active':''}" data-action="tab" data-arg="scene"><b>♜</b>CENA</button><button class="${tab==='map'?'active':''}" data-action="tab" data-arg="map"><b>🗺</b>MAPA</button><button class="${tab==='crew'?'active':''}" data-action="tab" data-arg="crew"><b>⚔</b>GRUPO</button><button class="${tab==='journal'?'active':''}" data-action="tab" data-arg="journal"><b>📖</b>CRÔNICAS</button><button class="${tab==='pack'?'active':''}" data-action="tab" data-arg="pack"><b>◈</b>BOLSA</button></nav>`}
function render(){const el=$('#app');if(!el)return;
 let body;if(!game){body=home()}else if(tab==='scene')body=renderScene();else if(tab==='battle'&&combat)body=renderBattle();else if(tab==='map')body=renderMap();else if(tab==='crew')body=renderCrew();else if(tab==='journal')body=renderJournal();else if(tab==='pack')body=renderPack();else if(tab==='ending')body=renderEnding();else body=renderScene();
 el.innerHTML=topbar()+status()+`<main class="viewport" id="scrollarea"><div class="content">${body}</div></main>`+(game&&tab!=='battle'&&tab!=='ending'?nav():'')+'<div id="dialogMount"></div>';
 drawModal();if(tab==='map')requestAnimationFrame(()=>{const w=$('.mapwrap');if(w&&!w.dataset.scrolled){const [x,y]=room().xy;w.scrollLeft=clamp(x-w.clientWidth/2,0,817-w.clientWidth);w.scrollTop=clamp(y-185,0,721-w.clientHeight);w.dataset.scrolled='yes'}})}
function home(){const has=!!load();const records=chronicle();return `<div class="cover"><div class="eyebrow">RPG DE EXPLORAÇÃO · SHADAR-RIVERIE</div><h1>O Arquivo dos<br>Mortos Afogados</h1><p>Debaixo das correntes de Gualápoles, os nomes que foram apagados ainda exigem testemunhas.</p></div><div class="card gold"><div class="eyebrow">A descida começa na sala 28</div><h3>Quem possui o direito de nomear?</h3><p>43 câmaras conectadas, escolhas sem retorno, combate tático, tesouros, intrigas e uma Lança que não pode ser simplesmente tomada.</p></div><div class="btns">${has?'<button class="btn primary wide" data-action="continue">Continuar expedição</button>':''}<button class="btn ${has?'ghost':'primary'} wide" data-action="new">${has?'Nova expedição':'Iniciar expedição'}</button><button class="btn ghost" data-action="rules">Como jogar</button><button class="btn ghost" data-action="history">Crônicas concluídas</button></div><p class="smallprint spaced" id="offline">${offlineReady?'✓ Pronto para abrir pelo ícone sem internet.':'Conecte-se uma vez e espere o cache offline terminar antes de instalar. Salve a página na tela inicial. Progresso local e exportável.'}</p>`}
function renderScene(){const r=room(),f=r.fields;const discovered=game.searched[game.loc],enc=roomMonsters();let doors=r.doors.filter(d=>d.to!==game.loc).map(d=>{const key=doorKey(game.loc,d.to,d.id);const visible=!d.secret||game.seen['secret_'+key]||game.visited.includes(d.to);if(!visible)return'';const broken=d.broken,locked=d.dc>0&&!game.doors[key],dest=ROOMS[d.to];return `<div class="door"><div><strong>↗ ${esc(dest?.name||'Sala '+d.to)}</strong><div class="mini">${esc(d.face)} · ${broken?'🚪 Rota destruída':locked?'🔒 Fechadura CD '+d.dc:d.secret?'✧ Passagem revelada':'Passagem aberta'}</div></div><button data-action="travel" data-arg="${d.to}|${esc(d.id)}">Seguir →</button></div>`}).join('');
 const spec=SPECIAL[game.loc],trophy=game.loc===40&&!game.horn;const canCombat=enc&&!game.wins[game.loc]&&!((game.loc===21||game.loc===40||game.loc===38)&&game.interacted[game.loc]);const result=`<div class="row"><div><div class="eyebrow">SALA ${game.loc} · ${esc(f['Função']||'Câmara ritual')}</div><h2>${esc(r.name)}</h2></div><span class="tag ${f['Estado hídrico']?.startsWith('Completamente')?'warn':''}">${f['Estado hídrico']?.startsWith('Completamente')?'SUBMERSA':'AR / ÁGUA'}</span></div>
 <div class="hero">${roomArt(game.loc)}<div class="hero-title">${esc(r.name)}<small>UM REGISTRO QUE O RIO NÃO ESQUECEU</small></div></div>
 <div class="card"><p class="roomtext">${esc(f['Descrição'])}</p>${COMPANION_LINES[game.loc]?`<div class="event"><strong>${COMPANION_LINES[game.loc][0]}:</strong> “${esc(COMPANION_LINES[game.loc][1])}”</div>`:''}<div class="quote">${esc(f['Pressão / Encontro']||'A água se move sem corrente.')}</div></div>
 ${game.loc===13?`<div class="card gold"><b>A guardiã da Lança</b><p class="sub">${game.horn?'O Berrante Aquático foi recuperado. A guardiã poderá ouvi-lo.':'Uma barreira separa a companhia de Jorō. O Berrante Aquático ainda está com Gharoz.'}</p></div>`:''}
 ${game.loc===40?`<div class="card danger"><b>Gharoz ocupa a câmara</b><p class="sub">${game.horn?'O Berrante está em suas mãos.':'O Crocodilo Gordo do Sonho Podre não está ferido. Sua água foi preparada para o confronto.'}</p></div>`:''}
 <div class="btns"><button class="btn" data-action="observe">👁 Observar pistas</button><button class="btn" data-action="search" ${discovered?'disabled':''}>◈ Vasculhar tesouros</button><button class="btn primary" data-action="interact">✦ ${spec?'Decisão ritual':'Interagir'}</button><button class="btn" data-action="rest">☾ Descansar</button>${canCombat?`<button class="btn red wide" data-action="encounter">⚔ ${[38,40].includes(game.loc)?'Enfrentar guardião':'Enfrentar ameaças'}</button>`:''}</div>
 <h3 class="section">Passagens do Arquivo</h3><p class="sub">As salas revisitadas permanecem acessíveis. Portas secretas podem ser encontradas ao investigar e vasculhar.</p>${doors||'<div class="card"><p class="sub">Há uma passagem oculta nesta sala. Investigue ou procure outras rotas.</p><button class="btn small" data-action="sense">Examinar paredes</button></div>'}
 <div class="card"><div class="eyebrow">Memória deste lugar</div><p class="sub">${game.seen['observe_'+game.loc]?esc(f['Pista concreta (sem teste)']||'A sala foi observada.'):'Observe para revelar a pista documental existente na sala.'}</p><p class="smallprint spaced">${game.searched[game.loc]?'✓ Tesouro vasculhado':'◇ Tesouro ainda não examinado'} · ${game.interacted[game.loc]?'✓ Ritual interpretado':'◇ Mecanismo não interpretado'} · ${game.wins[game.loc]?'✓ Inimigos superados':''}</p></div>
 ${notices.length?`<div class="log">${notices.slice(0,4).map(x=>`<div>◈ ${esc(x)}</div>`).join('')}</div>`:''}`;return result}
function renderMap(){const r=room(),unique=new Set([...game.visited,...r.doors.map(x=>x.to)]);
 let pins=Object.values(ROOMS).filter(x=>unique.has(x.id)).map(x=>`<button title="${esc(x.name)}" aria-label="Sala ${x.id}, ${esc(x.name)}" data-action="roominfo" data-arg="${x.id}" class="map-pin ${game.loc===x.id?'current':game.visited.includes(x.id)?'seen':'neighbor'}" style="left:${x.xy[0]}px;top:${x.xy[1]}px">${x.id}</button>`).join('');
 return `<div class="eyebrow">Cartografia do afogamento</div><h2>O mapa que não mente</h2><p class="sub">Mapa original dos jogadores; as numerações aparecem conforme você explora. Toque nos pontos para examinar uma sala. Arraste para percorrer a planta.</p><div class="map-controls"><button data-action="center">⌖ Centralizar em mim</button><span class="tag">${game.visited.length}/43 descobertas</span></div><div class="mapwrap"><div class="mapinner"><img src="./assets/map.webp" alt="Mapa da masmorra: 43 câmaras de pedra em passagens sinuosas, visto de cima">${pins}</div></div><p class="map-caption">🟡 Posição atual · 🟢 Visitada · ◯ Conexão próxima. A planta não revela portas secretas automaticamente.</p><div class="card gold"><strong>Rota da primeira entrada</strong><p>28 → 32 → 35 → 41 → 40. Os corredores foram destruídos por um tubarão gigante e continuam abertos.</p></div>`}
function renderCrew(){return `<div class="eyebrow">Companhia dos vivos</div><h2>Quem atravessa a foz</h2><p class="sub">A companhia atua em conjunto. Cada herói realiza uma movimentação e uma ação por rodada de combate.</p><div class="roster section">${game.roster.map(h=>{let p=person(h.id);return `<div class="hero-row"><div class="portrait">${p.symbol}</div><div class="info"><strong>${esc(p.name)}</strong><div class="sub">${esc(p.role)} · ${h.id===game.lead?'LIDERANÇA · ':''}Defesa ${p.ac+game.level-1}</div><div class="meter"><div><div class="sub">PV ${h.hp}/${h.max}</div><div class="progress red"><i style="width:${hpRatio(h)}%"></i></div></div><div><div class="sub">Foco ${h.focus}/${h.maxFocus}</div><div class="progress"><i style="width:${100*h.focus/h.maxFocus}%"></i></div></div></div></div></div><div class="card">${p.skills.map(k=>`<div class="listline"><b class="goldtext">${SKILLS[k].icon} ${SKILLS[k].name}</b> — ${SKILLS[k].desc}<div class="mini">Foco ${SKILLS[k].cost}</div></div>`).join('')}</div>`}).join('')}</div><div class="card gold"><h3>Nível da companhia: ${game.level}</h3><p>EXP para o próximo nível: ${game.xp}/${game.level*110}. Cada nível melhora o vigor, a defesa e a potência de todas as habilidades.</p><p class="sub">Combates vencidos: ${game.battles} · Derrotas: ${game.defeats}</p></div>`}
function renderJournal(){return `<div class="eyebrow">O direito de nomear</div><h2>Crônicas do Arquivo</h2><p class="sub">As decisões permanecem, mas seu sentido pode mudar à medida que novas testemunhas forem encontradas.</p><div class="card gold"><h3>Os três pilares</h3><div class="row spaced"><span class="tag ${game.dream?'gold':''}">夢 Sonho ${game.dream?'✓':'?'}</span><span class="tag ${game.root?'gold':''}">根 Raiz ${game.root?'✓':'?'}</span><span class="tag ${game.light?'gold':''}">光 Luz ${game.light?'✓':'?'}</span></div><p class="sub spaced">A restauração simbólica depende do que as pessoas fazem com essas palavras — não apenas de coletá-las.</p></div><div class="card"><h3>Conflitos materiais</h3><div class="listline">Autonomia dos povos: <b class="good">${game.autonomy}</b></div><div class="listline">Interesse da Corte: <b class="goldtext">${game.court}</b></div><div class="listline">Influência demoníaca: <b class="bad">${game.demon}</b></div><div class="listline">Testemunhos reconhecidos: <b>${game.truth}</b></div><div class="listline">Confiança de Jorō: <b>${game.trust}</b></div><div class="listline">Conhecimento do Arquivo: <b>${game.insight}</b></div></div><h3 class="section">O que foi escrito</h3><div class="card">${game.journal.slice(0,60).map((j,i)=>`<div class="listline"><span class="mini">${i+1}.</span> ${esc(j)}</div>`).join('')}</div>`}
function renderPack(){const items=game.items.slice().reverse();return `<div class="eyebrow">Relíquias recuperadas</div><h2>Bolsa da companhia</h2><div class="card gold"><div class="row"><span>Selos da Foz <b>${game.seals}/12</b></span><span>Fragmentos do Juramento <b>${game.fragment}/6</b></span></div><div class="row spaced"><span>🪙 ${game.coins} moedas</span><span>🍞 ${game.supplies} provisões</span></div><div class="row spaced"><span class="tag ${game.horn?'gold':'warn'}">Berrante ${game.horn?'obtido':'não obtido'}</span><span class="tag ${game.spear?'gold':'warn'}">Lança ${game.spear?'obtida':'selada'}</span></div></div><p class="smallprint spaced">3 Selos: +2 em testes de investigação; 6 Selos: uma segunda chance por sala contra ilusões. O Berrante pode criar uma Maré durante o combate, uma vez por confronto.</p><h3 class="section">Artefatos e documentos</h3><div class="inventory-grid">${items.map(x=>`<div class="item"><strong>◈ ${esc(x)}</strong></div>`).join('')}</div><h3 class="section">Partida e instalação</h3><div class="btns"><button class="btn ghost" data-action="export">⇩ Exportar save</button><button class="btn ghost" data-action="import">⇧ Importar save</button><button class="btn ghost" data-action="rules">? Manual</button><button class="btn red" data-action="new">Nova expedição</button></div><p class="smallprint spaced">Os dados ficam apenas no aparelho. Exportar um save protege seu progresso ao limpar os dados do navegador ou trocar de celular.</p>`}
function renderBattle(){const c=combat,h=chosenHero();if(!c)return'';const skill=c.skill?SKILLS[c.skill]:null;
 let chips=c.allies.map(a=>`<button class="unit-chip ${a.id===c.sel?'sel':''}" data-action="select" data-arg="${a.id}" ${a.hp<=0?'disabled':''}>${person(a.id).symbol} ${esc(a.name.split(' ')[0])} ${a.hp}/${a.max} ${a.done?'✓':''}</button>`).join('');
 let board='';for(let y=0;y<7;y++)for(let x=0;x<7;x++){let t=bTile(x,y),u=at(x,y),available=h&&!h.moved&&!h.root&&!skill&&!u&&pathlen(h,{x,y})<=person(h.id).spd,aim=!!(skill&&h&&dist(h,{x,y})<=skill.range);
 let klass='tile '+t.type+(available?' moveable':'')+(aim?' targetable':'');board+=`<button class="${klass}" data-action="tile" data-arg="${x},${y}" aria-label="Quadrado ${x+1},${y+1}, ${u?u.name:'vazio'}"><span class="terrain">${t.mist?'☁':t.type==='rock'?'▦':t.type==='water'?'≈':t.type==='mist'?'░':''}</span>${u?`<span class="unit ${u.kind==='enemy'?'enemy':''} ${u.boss?'boss':''}">${u.kind==='ally'?person(u.id).symbol:FOES[u.type].icon}</span><span class="hp"><i style="width:${Math.round(u.hp/u.max*100)}%"></i></span>`:''}</button>`}
 const sp=person(h?.id||'kera');return `<div class="row"><div><div class="eyebrow">${esc(c.source)}</div><h2>Confronto submerso</h2></div><span class="pill">Rodada ${c.round}</span></div><div class="battlebar section">${chips}</div><div class="board">${board}</div><div class="mini spaced">${h?'Em foco: '+esc(h.name)+' · '+(h.done?'ação usada':h.moved?'movimento usado':'pode mover')+' · Foco '+h.focus+'/'+h.maxFocus:'Sem sobreviventes'}</div><div class="battle-actions">${([...(sp?.skills||[]),...(game.horn&&h?.id==='iria'?['horn']:[])]).map(k=>{const sk=SKILLS[k];return `<button class="skill ${c.skill===k?'active':''}" data-action="skill" data-arg="${k}" ${h?.done||h?.focus<sk.cost||k==='horn'&&c.hornUsed?'disabled':''}><strong>${sk.icon} ${sk.name}</strong><small>${sk.desc} · ${sk.cost} foco</small></button>`}).join('')}</div><div class="battlefooter"><button data-action="endround">Encerrar rodada ▶</button><button data-action="battlehelp">Ajuda ?</button></div><div class="combat-log">${c.logs.slice(0,8).map(s=>`<div>• ${esc(s)}</div>`).join('')}</div><p class="smallprint spaced">Toque em um herói para selecioná-lo; toque numa casa pontilhada para mover; escolha uma habilidade e toque no alvo marcado. Cada inimigo ataca no máximo uma vez por rodada.</p>`}
function renderEnding(){let titles={liberta:'O Nome Devolvido',coroa:'A Coroa de Água',abismo:'O Abismo Assina',ruptura:'A Lança Arrancada'},desc={liberta:'Jorō quebra a barreira por vontade própria. A Lança não será a propriedade de uma casa: será entregue à memória de Gualápoles e à possibilidade de reconstruir um governo dos vivos. A tríade de Sonho, Raiz e Luz permanece inacabada — porque pertence ao futuro.',coroa:'Ulorian recebe um título que já desejava. O rio parece mais seguro, os tributos voltam a correr e o velho posto ganha linguagem ritual. A foz conserva paz aparente, mas os habitantes continuam submetidos à decisão de um senhor.',abismo:'Veren aceita o objeto com uma reverência impecável. A Lança desaparece rumo às profundezas, enquanto a Corte e a resistência descobrem tarde demais o preço do atalho. O Abismo não precisou conquistar: bastou oferecer ajuda.',ruptura:'A guardiã cai, e com ela a barreira ritual. A Lança pode ser arrancada, mas o Arquivo não a reconhece como restituição legítima. Uma arma foi conquistada; uma possibilidade de mundo pode ter sido perdida.'};return `<div class="cover"><div class="eyebrow">FIM · UMA CRÔNICA DA CARCAÇA</div><h1>${titles[game.end]||'O Arquivo Silencia'}</h1><p>A água continuará a contar outra versão.</p></div><div class="card gold"><p class="roomtext">${desc[game.end]||''}</p></div><div class="card"><h3>Registro da expedição</h3><div class="listline">Salas exploradas: ${game.visited.length}/43</div><div class="listline">Selos recuperados: ${game.seals}/12</div><div class="listline">Fragmentos do Juramento: ${game.fragment}/6</div><div class="listline">Nível da companhia: ${game.level}</div><div class="listline">Vitórias: ${game.battles} · Derrotas: ${game.defeats}</div><div class="listline">A quem a jornada serviu: <b>${affinity()}</b></div></div><div class="btns"><button class="btn primary wide" data-action="new">Iniciar outra expedição</button><button class="btn ghost" data-action="export">Exportar crônica</button><button class="btn ghost" data-action="tab" data-arg="journal">Rever decisões</button></div>`}
function drawModal(){let mount=$('#dialogMount');if(!mount)return;
 if(!dialog){mount.innerHTML='';return}
 mount.innerHTML=`<div class="modal-back"><div class="modal"><div class="eyebrow">AS ÁGUAS RESPONDEM</div><h2>${esc(dialog.head)}</h2><div class="roomtext">${dialog.body}</div><div class="spaced">${dialog.buttons.map((b,i)=>`<button class="choice" data-action="${esc(b.act)}" data-arg="${esc(b.arg??'')}"><strong>${esc(b.title)}</strong>${b.sub?`<small>${esc(b.sub)}</small>`:''}</button>`).join('')}</div></div></div>`}
function newDialog(){let old=!!load();show('Criar companhia',`<p>Escolha quem liderará a expedição. Os três heróis lutarão juntos; a liderança oferece recursos iniciais diferentes.</p><div class="difficulty"><button data-action="difficulty" data-arg="fácil" class="${currentDiff==='fácil'?'sel':''}">Aventureiro</button><button data-action="difficulty" data-arg="normal" class="${currentDiff==='normal'?'sel':''}">Veterano</button><button data-action="difficulty" data-arg="difícil" class="${currentDiff==='difícil'?'sel':''}">Sobrevivente</button></div><div class="roster spaced">${HEROES.map(p=>`<button class="choice ${currentLead===p.id?'on':''}" data-action="leader" data-arg="${p.id}"><strong>${p.symbol} ${p.name}</strong><small>${p.role} — ${p.id==='kera'?'+10 PV iniciais':p.id==='iria'?'+4 pontos de Foco iniciais':'+2 provisões'}</small></button>`).join('')}</div>${old?'<p class="bad">Iniciar nova campanha substituirá seu save atual. Exporte antes se quiser preservá-lo.</p>':''}`,[{title:'Começar expedição',act:'start'},{title:'Cancelar',act:'close'}])}
let currentDiff='normal',currentLead='iria';
function exportSave(){const data=JSON.stringify({kind:'carcaca-archive-save',saved:new Date().toISOString(),game},null,2);let a=document.createElement('a'),blob=new Blob([data],{type:'application/json'});a.href=URL.createObjectURL(blob);a.download='Arquivo_Mortos_Afogados_save.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);show('Save exportado','O arquivo JSON contém sua expedição. Guarde-o fora do navegador para preservar o progresso.')}
function importSave(){show('Importar expedição','Selecione um save do Arquivo. Este procedimento substitui o progresso atual.',[{title:'Selecionar arquivo',act:'filepick'},{title:'Cancelar',act:'close'}])}
function openFile(){let input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.onchange=async()=>{let f=input.files?.[0];if(!f)return;try{let g=JSON.parse(await f.text());g=g.game||g;if(g.version!==1||!g.roster||!ROOMS[g.loc])throw Error('Save incompatível');game=g;combat=null;tab=game.end?'ending':'scene';save();render();show('Expedição restaurada','O Arquivo reconheceu os nomes e as decisões salvas.') }catch(e){show('Falha ao importar',esc(String(e.message)))}};input.click()}
function roomInfo(id){const r=ROOMS[id];if(!r)return;const known=game.visited.includes(id);let neighbors=room().doors.some(d=>d.to===id);show('Sala '+id+' — '+(known?r.name:'Passagem à frente'),`<p>${known?esc(r.fields['Função']||''):'Esta parte da planta ainda não foi explorada.'}</p><p>${known?esc(r.fields['Pista concreta (sem teste)']||''):''}</p>`,neighbors?[{title:'Retornar à cena e atravessar a passagem',act:'tab',arg:'scene'},{title:'Fechar',act:'close'}]:[{title:'Fechar',act:'close'}])}
function sense(){let k=room().doors.filter(d=>d.secret&&!game.seen['secret_'+doorKey(game.loc,d.to,d.id)]);const rolll=rollCheck('insight',16);if(rolll.pass){for(const d of k)game.seen['secret_'+doorKey(game.loc,d.to,d.id)]=true;announce('Você reconheceu as margens de passagens escondidas.');save();render();show('Paredes legíveis','Você descobriu as rotas secretas da sala — onde existirem.')}else{game.tide++;game.stress++;save();render();show('Paredes fechadas',`Teste ${rolll.total} contra CD 16. A pedra não revela seus segredos desta vez.`)}}
function rules(){show('Como sobreviver ao Arquivo',`<p><b>Exploração:</b> toque em Observar, Vasculhar e Interagir. Destrancar portas exige testes; passagens secretas surgem com atenção. A busca e as decisões são registradas para sempre.</p><p><b>Fôlego:</b> salas inteiramente submersas consomem ar. A arcanista pode criar uma bolha emergencial gastando Foco; caso não consiga, a companhia sofre dano. Descansar restaura Fôlego.</p><p><b>Combate:</b> a companhia tem três heróis. Cada um pode mover-se uma vez e usar uma habilidade por rodada. Depois, os inimigos agem. D20 + bônus contra Defesa decide acertos.</p><p><b>Foco:</b> magias e técnicas avançadas consomem foco. Descansar recupera vida e recursos, mas aumenta a Maré.</p><p><b>Missão:</b> Gharoz conserva o Berrante Aquático. Jorō guarda a Lança. Fragmentos do Juramento, Selos da Foz, Sonho, Raiz e Luz ajudam a desvendar a legitimidade do trono.</p><p><b>Derrota:</b> a companhia é devolvida à entrada, com perdas, mas sem apagar os acontecimentos.</p><p><b>Offline:</b> o app armazena os arquivos no aparelho após a instalação. Exporte o save antes de limpar os dados do navegador.</p>`)}
function handleAction(a,arg){
 if(a==='close'){closeDialog();return}if(a==='continue'){game=load();tab=game?.end?'ending':'scene';notices=[];combat=null;render();return}
 if(a==='new'){newDialog();return}if(a==='difficulty'){currentDiff=arg;newDialog();return}if(a==='leader'){currentLead=arg;newDialog();return}
 if(a==='start'){begin(currentDiff,currentLead);if(currentLead==='kera'){game.roster[0].max+=10;game.roster[0].hp+=10}else if(currentLead==='iria'){game.roster[1].maxFocus+=4;game.roster[1].focus+=4}else game.supplies+=2;save();render();return}
 if(a==='history'){const r=chronicle();show('Crônicas do Rio',r.length?r.map(x=>`<div class="listline">${esc(x.end)} — ${esc(x.date)} · ${x.rooms} salas · nível ${x.level}</div>`).join(''):'Nenhuma expedição concluída ainda.');return}
 if(a==='rules'){rules();return}if(a==='export'){exportSave();return}if(a==='import'){importSave();return}if(a==='filepick'){openFile();return}
 if(!game)return;if(a==='tab'){tab=arg;closeDialog();render();sct();return}
 if(a==='observe'){observe();return}if(a==='search'){search();return}if(a==='interact'){interact();return}if(a==='rest'){rest();return}
 if(a==='sense'){sense();return}if(a==='special'){chooseSpecial(Number(arg));return}if(a==='roominfo'){roomInfo(Number(arg));return}
 if(a==='center'){const w=$('.mapwrap'),[x,y]=room().xy;if(w){w.scrollLeft=x-w.clientWidth/2;w.scrollTop=y-w.clientHeight/2}return}
 if(a==='travel'){let [to,pid]=arg.split('|');let d=room().doors.find(x=>x.to===Number(to)&&x.id===pid);travel(Number(to),d);return}
 if(a==='doorcheck'){const d=decodeDoor(arg);if(!d)return;const r=rollCheck('insight',17);if(r.pass){game.seen['secret_'+arg]=true;announce('Uma porta escondida se revela.');save();closeDialog();render();show('Fenda sob a pedra','A passagem secreta tornou-se visível.')}else{game.stress++;game.tide++;save();show('Parede enganosa','Sua investigação não foi suficiente. A água turva a percepção.') }return}
 if(a==='dooropen'){const d=decodeDoor(arg);if(!d)return;const check=rollCheck('insight',d.dc);if(check.pass){game.doors[arg]=true;announce('A fechadura '+d.id+' cedeu ao trabalho paciente.');save();travel(d.to,d)}else{game.tide++;game.stress++;save();show('Fechadura resistente',`Teste ${check.die}+${check.mod}=${check.total}, dificuldade ${d.dc}. A fechadura não cedeu; você pode tentar novamente ou arrombar.`,[{title:'Tentar destrancar novamente',act:'dooropen',arg},{title:'Arrombar a porta',act:'doorbreak',arg},{title:'Recuar',act:'close'}])}return}
 if(a==='doorbreak'){const d=decodeDoor(arg);if(!d)return;game.doors[arg]=true;game.tide+=2;game.stress++;game.roster.forEach(h=>h.hp=Math.max(1,h.hp-2));announce('A porta '+d.id+' foi arrombada. O estrondo corre pelo Arquivo.');save();travel(d.to,d);return}
 if(a==='encounter'){maybeBattle();return}if(a==='boss'){closeDialog();startBattle([arg],FOES[arg]?.name||'Guardiã');return}
 if(a==='select'){bSelect(arg);return}if(a==='skill'){skillPick(arg);return}if(a==='tile'){let [x,y]=arg.split(',').map(Number);bTap(x,y);return}if(a==='endround'){endRound();return}
 if(a==='battlehelp'){show('Combate tático','Você controla três heróis. Cada um pode mover-se uma vez (casas pontilhadas) e executar uma ação (habilidade selecionada). Clique no inimigo para alvejar. Terreno rochoso bloqueia; névoa impede ataques à distância; água pode ser conjurada. Use a seleção de heróis para agir na ordem desejada.');return}
 if(a==='ending'){finish(arg);return}
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action,arg=b.dataset.arg||'';handleAction(a,arg)});
function init(){game=load();if(game?.end)tab='ending';render();if('serviceWorker'in navigator&&'caches'in window){navigator.serviceWorker.ready.then(async()=>{try{const c=await caches.open('carcaca-arquivo-v1.0.2'),a=await c.keys();if(a.length>=9){offlineReady=true;const hint=$('#offline');if(hint)hint.textContent='✓ Pronto para abrir pelo ícone sem internet.';const tag=$('.pill');if(tag)tag.textContent='✓ OFFLINE · '+(game?'Sala '+game.loc+' · NV '+game.level:'RPG OFFLINE')}}catch(e){}}).catch(()=>{})}}init();
// Minimal QA hooks: only in local browser consoles, never networked.
if(!location.hostname||location.hostname==='localhost'||location.hostname==='127.0.0.1')window.__archiveQA={get:()=>({game,combat,tab,dialog}),room:n=>{if(!game)game=fresh();game.loc=n;render()},start:(diff='normal')=>begin(diff,'iria'),fight:types=>startBattle(types,'Teste'),finish,render};
})();
