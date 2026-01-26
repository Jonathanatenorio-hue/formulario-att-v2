const GOOGLE_SCRIPT_URL='https://script.google.com/macros/s/AKfycby-HOsviZvkv83Lrsu6cFukqRK6uuft9nw438lxPv2WOX_prRx3CfosVF7-BxuwBJCQ9A/exec';
let candidateData={},selectedTime=null,selectedSucursal=null,selectedDireccion=null,totalScore=0,reclutadorInfo={nombre:'',email:'',whatsapp:'',whatsappNumero:''};
const mapsLinks={'Torre JV Juárez':'https://maps.google.com/?q=Av.+Juárez+2925,+La+Paz,+72160,+Puebla','Edificio Inbursa Antequera':'https://maps.app.goo.gl/fGn2Mz5hKdaKTkxL8'};

function checkIfRejected(){const rejected=localStorage.getItem('att_rejected');if(rejected==='true'){document.getElementById('intro').style.display='none';document.getElementById('rejected-screen').classList.add('active');document.querySelector('.rejected-screen h2').textContent='Ya completaste este formulario';document.querySelector('.rejected-screen p').textContent='Detectamos que ya enviaste tu información anteriormente.'}}
window.onload=function(){checkIfRejected()};

const questions={
    q1:[{text:'Tener un ingreso fijo aunque no haya comisiones',score:0,type:'reject'},{text:'Que sea un trabajo sencillo sin mucha presión',score:0,type:'reject'},{text:'Aprender y generar ingresos adicionales con comisiones',score:3,type:'good'},{text:'Ganar dinero a través de resultados y superar metas',score:5,type:'ideal'}],
    q2:[{text:'Me estresa y prefiero evitarlas',score:0,type:'reject'},{text:'Solo cumplo lo mínimo para no tener problemas',score:0,type:'reject'},{text:'Me adapto y hago mi esfuerzo',score:3,type:'good'},{text:'Me motiva competir conmigo mismo y con el equipo',score:5,type:'ideal'}],
    q3:[{text:'Termino la llamada de inmediato',score:0,type:'reject'},{text:'Insisto sin escuchar al cliente',score:1,type:'warning'},{text:'Intento explicar brevemente el beneficio',score:3,type:'good'},{text:'Investigo el motivo, manejo la objeción y vuelvo a intentar el cierre',score:5,type:'ideal'}],
    q4:[{text:'No me interesa, prefiero sueldo fijo',score:0,type:'reject'},{text:'Solo las veo como un extra ocasional',score:1,type:'warning'},{text:'Son importantes, pero no mi prioridad',score:3,type:'good'},{text:'Son una parte clave de mi ingreso',score:5,type:'ideal'}],
    q5:[{text:'Me desmotivo y bajo el ritmo',score:0,type:'reject'},{text:'Culpo a la base o al sistema',score:0,type:'reject'},{text:'Pido retroalimentación y sigo intentando',score:3,type:'good'},{text:'Ajusto mi estrategia, escucho mis llamadas y busco mejorar',score:5,type:'ideal'}],
    q6:[{text:'A veces llego tarde, depende del día',score:0,type:'reject'},{text:'Cumplo mientras no haya problemas personales',score:1,type:'warning'},{text:'Suelo ser puntual',score:3,type:'good'},{text:'Soy muy puntual y responsable con mis horarios',score:5,type:'ideal'}],
    q7:[{text:'Que no me presione',score:0,type:'reject'},{text:'Que me deje trabajar sin decirme nada',score:0,type:'reject'},{text:'Que me apoye cuando lo necesito',score:3,type:'good'},{text:'Que me exija, me rete y me ayude a mejorar resultados',score:5,type:'ideal'}],
    q8:[{text:'Me molesta y me pongo a la defensiva',score:0,type:'reject'},{text:'Si no me gusta no lo aplico',score:0,type:'reject'},{text:'La tomo en cuenta y trato de mejorar',score:3,type:'good'},{text:'La agradezco y la uso para crecer',score:5,type:'ideal'}],
    q9:[{text:'Solo mientras encuentro otra cosa',score:0,type:'reject'},{text:'Un par de meses',score:0,type:'reject'},{text:'Al menos 6 meses',score:3,type:'good'},{text:'Busco estabilidad y crecimiento a largo plazo',score:5,type:'ideal'}]
};

function shuffleArray(array){const shuffled=[...array];for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]]}return shuffled}
function renderQuestion(questionKey,containerId){const container=document.getElementById(containerId);const options=shuffleArray(questions[questionKey]);const letras=['A)','B)','C)','D)'];container.innerHTML='';options.forEach((option,index)=>{const div=document.createElement('div');div.className='option';div.textContent=letras[index]+' '+option.text;div.dataset.score=option.score;div.dataset.type=option.type;div.dataset.text=option.text;div.onclick=function(){document.querySelectorAll(`#${containerId} .option`).forEach(opt=>{opt.classList.remove('selected')});this.classList.add('selected')};container.appendChild(div)})}
function selectSucursal(sucursal,direccion){document.querySelectorAll('#options-sucursal .option').forEach(opt=>{opt.classList.remove('selected')});event.target.closest('.option').classList.add('selected');selectedSucursal=sucursal;selectedDireccion=direccion}
function abrirMaps(){if(selectedSucursal&&mapsLinks[selectedSucursal]){window.open(mapsLinks[selectedSucursal],'_blank')}else{alert('Por favor selecciona primero una sucursal.')}}
function startForm(){document.getElementById('intro').style.display='none';document.getElementById('step0').classList.add('active')}

function validateStep(step){
    if(step===0){if(!selectedSucursal)return{valid:false,message:'Por favor selecciona una sucursal.'};candidateData.sucursal=selectedSucursal;candidateData.direccionSucursal=selectedDireccion;return{valid:true}}
    if(step===1){const nombre=document.getElementById('nombre').value.trim();const telefono=document.getElementById('telefono').value.trim();const edad=document.getElementById('edad').value;const ubicacion=document.getElementById('ubicacion').value;const colonia=document.getElementById('colonia').value.trim();if(!nombre||!telefono||!edad||!ubicacion||!colonia)return{valid:false,message:'Por favor completa todos los campos obligatorios.'};if(telefono.length<10)return{valid:false,message:'El teléfono debe tener al menos 10 dígitos.'};return{valid:true}}
    if(step===2){const tiempo=document.getElementById('tiempo-traslado').value;if(!tiempo)return{valid:false,message:'Por favor selecciona el tiempo de traslado.'};return{valid:true}}
    if(step===3){const ingreso=document.getElementById('ingreso-esperado').value;if(!ingreso)return{valid:false,message:'Por favor selecciona tu expectativa de ingreso.'};return{valid:true}}
    if(step>=4&&step<=12){const questionKey=`q${step-3}`;const containerId=`options-${questionKey}`;const selectedOption=document.querySelector(`#${containerId} .option.selected`);if(!selectedOption)return{valid:false,message:'Por favor selecciona una opción.'};if(selectedOption.dataset.type==='reject')return{valid:true,reject:true};return{valid:true}}
    return{valid:true}
}

function saveStepData(step){
    if(step===1){candidateData.nombre=document.getElementById('nombre').value;candidateData.telefono=document.getElementById('telefono').value;candidateData.edad=document.getElementById('edad').value;candidateData.ubicacion=document.getElementById('ubicacion').value;candidateData.colonia=document.getElementById('colonia').value}
    else if(step===2){candidateData.tiempoTraslado=document.getElementById('tiempo-traslado').value}
    else if(step===3){candidateData.ingresoEsperado=document.getElementById('ingreso-esperado').value}
    else if(step>=4&&step<=12){const questionKey=`q${step-3}`;const containerId=`options-${questionKey}`;const selectedOption=document.querySelector(`#${containerId} .option.selected`);if(selectedOption){const score=parseInt(selectedOption.dataset.score);const text=selectedOption.dataset.text;candidateData[`pregunta${step-3}`]=text;candidateData[`puntaje${step-3}`]=score;totalScore+=score}}
}

// GUARDAR RECHAZO EN ESTADÍSTICAS
async function guardarRechazoEstadisticas(motivo) {
    const data = {
        tipo: 'rechazo_pf',
        sucursal: candidateData.sucursal || selectedSucursal || 'No especificada',
        puntaje: totalScore,
        motivo: motivo
    };
    try {
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        console.log('Rechazo guardado en estadísticas');
    } catch (error) {
        console.error('Error guardando rechazo:', error);
    }
}

function nextStep(currentStep){
    const validation=validateStep(currentStep);
    if(!validation.valid){alert(validation.message);return}
    if(validation.reject){
        saveStepData(currentStep);
        guardarRechazoEstadisticas('Respuesta incompatible en pregunta ' + (currentStep - 3));
        localStorage.setItem('att_rejected','true');
        document.getElementById(`step${currentStep}`).classList.remove('active');
        document.getElementById('rejected-screen').classList.add('active');
        return
    }
    saveStepData(currentStep);
    if(currentStep===1){document.getElementById('centro-nombre').textContent=selectedSucursal;document.getElementById('centro-direccion').textContent=selectedDireccion;}
    if(currentStep===3)renderQuestion('q1','options-q1');
    else if(currentStep===4)renderQuestion('q2','options-q2');
    else if(currentStep===5)renderQuestion('q3','options-q3');
    else if(currentStep===6)renderQuestion('q4','options-q4');
    else if(currentStep===7)renderQuestion('q5','options-q5');
    else if(currentStep===8)renderQuestion('q6','options-q6');
    else if(currentStep===9)renderQuestion('q7','options-q7');
    else if(currentStep===10)renderQuestion('q8','options-q8');
    else if(currentStep===11)renderQuestion('q9','options-q9');
    document.getElementById(`step${currentStep}`).classList.remove('active');
    document.getElementById(`step${currentStep+1}`).classList.add('active')
}

function submitForm(){
    const validation=validateStep(12);
    if(!validation.valid){alert(validation.message);return}
    saveStepData(12);
    if(validation.reject){
        guardarRechazoEstadisticas('Respuesta incompatible en pregunta 9');
        localStorage.setItem('att_rejected','true');
        document.getElementById('step12').classList.remove('active');
        document.getElementById('rejected-screen').classList.add('active');
        return
    }
    if(totalScore < 28) {
        guardarRechazoEstadisticas('Puntaje insuficiente: ' + totalScore + '/45');
        localStorage.setItem('att_rejected','true');
        document.getElementById('step12').classList.remove('active');
        document.getElementById('rejected-screen').classList.add('active');
        return
    }
    let clasificacion='';
    if(totalScore>=41)clasificacion='🌟 SOBRESALIENTE';
    else if(totalScore>=35)clasificacion='⭐ EXCELENTE';
    else if(totalScore>=28)clasificacion='✅ MUY BUENO';
    else clasificacion='⚠️ ACEPTABLE';
    candidateData.puntajeTotal=totalScore;
    candidateData.clasificacion=clasificacion;
    document.getElementById('step12').classList.remove('active');
    document.getElementById('approved-screen').classList.add('active');
    document.getElementById('score-number').textContent=`${totalScore}/45`;
    document.getElementById('score-label').textContent=clasificacion;
    setupDatePicker()
}

function setupDatePicker(){
    const dateInput=document.getElementById('fecha-cita');
    const today=new Date();
    dateInput.min=today.toISOString().split('T')[0];
    const maxDate=new Date();maxDate.setDate(maxDate.getDate()+30);
    dateInput.max=maxDate.toISOString().split('T')[0];
    
    // Asignar reclutadora
    if(candidateData.sucursal==='Torre JV Juárez'){
        reclutadorInfo.nombre='Karla Flores';
        reclutadorInfo.email='k.flores@solucell.com.mx';
        reclutadorInfo.whatsapp='221 349 1520';
        reclutadorInfo.whatsappNumero='2213491520';
        candidateData.reclutadora = 'Karla Flores';
    } else {
        let inbursaCounter = parseInt(localStorage.getItem('inbursaCounter') || '0');
        if(inbursaCounter % 2 === 0) {
            reclutadorInfo.nombre='Yessica Huerta';
            reclutadorInfo.email='reclutamientocc2@solucell.com.mx';
            candidateData.reclutadora = 'Yessica Huerta';
        } else {
            reclutadorInfo.nombre='Jezabel Monterrosas';
            reclutadorInfo.email='reclutamientocc1@solucell.com.mx';
            candidateData.reclutadora = 'Jezabel Monterrosas';
        }
        reclutadorInfo.whatsapp='221 155 7027';
        reclutadorInfo.whatsappNumero='2211557027';
        localStorage.setItem('inbursaCounter', (inbursaCounter + 1).toString());
    }
    document.getElementById('reclutador-nombre').textContent=reclutadorInfo.nombre;
    document.getElementById('reclutador-sucursal').textContent=candidateData.sucursal;
    document.getElementById('reclutador-email').textContent=reclutadorInfo.email;
    document.getElementById('reclutador-email').href='mailto:'+reclutadorInfo.email;
    document.getElementById('reclutador-whatsapp').textContent=reclutadorInfo.whatsapp
}

function sendCVWhatsApp(){
    const fechaObj = new Date(candidateData.citaFecha + 'T12:00:00');
    const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const fechaFormateada = fechaObj.toLocaleDateString('es-MX', opcionesFecha);
    const mensaje=`Hola ${reclutadorInfo.nombre.split(' ')[0]}, soy ${candidateData.nombre}.\n\nAcabo de completar el pre-filtro para el puesto de Agente Telefónico AT&T.\n\n📋 *Datos de mi cita:*\n📅 Fecha: ${fechaFormateada}\n🕐 Hora: ${candidateData.citaHora}\n🏢 Sucursal: ${candidateData.sucursal}\n\nAdjunto mi CV para su revisión.\n\n¡Saludos!`;
    const whatsappURL=`https://wa.me/52${reclutadorInfo.whatsappNumero}?text=${encodeURIComponent(mensaje)}`;
    window.open(whatsappURL,'_blank')
}

function selectTime(time){document.querySelectorAll('.time-slot').forEach(slot=>{slot.classList.remove('selected')});event.target.classList.add('selected');selectedTime=time}

function confirmAppointment(){
    const fecha=document.getElementById('fecha-cita').value;
    if(!fecha){alert('Por favor selecciona una fecha.');return}
    if(!selectedTime){alert('Por favor selecciona un horario.');return}
    candidateData.citaFecha=fecha;
    candidateData.citaHora=selectedTime;
    const btn=event.target;
    btn.disabled=true;
    btn.textContent='Procesando...';
    sendToGoogleSheets(candidateData).then(()=>{
        document.querySelector('.calendar-section').style.display='none';
        const fechaObj = new Date(fecha + 'T12:00:00');
        const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const fechaFormateada = fechaObj.toLocaleDateString('es-MX', opcionesFecha);
        document.getElementById('seccion-post-cita').style.display='block';
        document.getElementById('cita-confirmada-fecha').textContent=fechaFormateada;
        document.getElementById('cita-confirmada-hora').textContent=selectedTime;
        document.getElementById('email-link-final').textContent=reclutadorInfo.email;
        document.getElementById('email-link-final').href='mailto:'+reclutadorInfo.email;
        document.getElementById('seccion-post-cita').scrollIntoView({ behavior: 'smooth' });
    }).catch(error=>{
        console.error('Error:',error);
        alert('⚠️ Hubo un problema. Intenta de nuevo.');
        btn.disabled=false;
        btn.textContent='Confirmar Cita →'
    })
}

async function sendToGoogleSheets(data){
    const formData={
        tipo: 'pre_filtro',
        timestamp:new Date().toLocaleString('es-MX'),
        nombre:data.nombre,
        telefono:data.telefono,
        edad:data.edad,
        ubicacion:data.ubicacion,
        colonia:data.colonia,
        sucursal:data.sucursal,
        reclutadora:data.reclutadora,
        tiempoTraslado:data.tiempoTraslado,
        ingresoEsperado:data.ingresoEsperado,
        pregunta1:data.pregunta1,puntaje1:data.puntaje1,
        pregunta2:data.pregunta2,puntaje2:data.puntaje2,
        pregunta3:data.pregunta3,puntaje3:data.puntaje3,
        pregunta4:data.pregunta4,puntaje4:data.puntaje4,
        pregunta5:data.pregunta5,puntaje5:data.puntaje5,
        pregunta6:data.pregunta6,puntaje6:data.puntaje6,
        pregunta7:data.pregunta7,puntaje7:data.puntaje7,
        pregunta8:data.pregunta8,puntaje8:data.puntaje8,
        pregunta9:data.pregunta9,puntaje9:data.puntaje9,
        puntajeTotal:data.puntajeTotal,
        clasificacion:data.clasificacion,
        citaFecha:data.citaFecha,
        citaHora:data.citaHora,
        estado:'Nuevo'
    };
    const response=await fetch(GOOGLE_SCRIPT_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify(formData)});
    return response
}
