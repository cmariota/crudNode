//importar las variables que vamos a necesitar
var express = require("express"),
    bodyParser = require('body-parser'),
    port = process.env.port || 19000,
    app = express();


// conection Redis

var { createClient } = require('then-redis')
const client = createClient({
    port: 6379,
    host: "localhost",
    password: "carla.lamejor",
});
// client.select(1)
client.on('error', (err) => {
    console.error("Ha ocurrido un error", err)
})
client.on('ready', () => {
    console.info(`[  DB  ]  *** Conected :)`)
})




app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//funcion para responder 
function responderStatus(req,res){
    res.json({"status":"Ok"});
}
//listar una persona 
async function Listperson(req,res){
    const {firstname,lastname,id} = req.body;

    let datos = {
        firstname,lastname
    }
    var resultado = await client.keys(`person_*`)
    console.log(resultado);

    if (resultado.length > 0) {
        var persona = await  client.get(resultado)
        
        var personajson = JSON.parse(persona)
        if(!datos.firstname || !datos.lastname) {
            respuesta = {
            error: true,
            codigo: 502,
            mensaje: 'No hay datos para mostrar'
            };
        } else {
            respuesta = {
                error: true,
                codigo: 200,
                mensaje: 'lista de personas'
                };
        await  client.get(resultado[0],JSON.stringify({...personajson,firstname,lastname}))
            res.send(personajson);
            
        };


    }else{
        return res.send(personajson);
    }
    console.log(resultado);
    
    
}
// Realizamos la funcion para crear una persona
function AddPerson(req,res){

    const {id,firstname,lastname} = req.body;

    let datos = {
        id,firstname,lastname
    }

    respuesta={
        error: false,
        codigo:200,
        mensaje: 'buenos dias '
    };
    if (datos.firstname ==='' || datos.lastname === '' || datos.id === ''){
        respuesta= {
            error: true, 
            codigo:501,
            mensaje:'Se requiere que llene todos los campos'
        };
    }else {
        respuesta = {
            error:false,
            codigo:200,
            mensaje: 'El usuario ha sido creado correctamente',
            respuesta: datos
        };
        client.set(`person_${id}_${firstname}_${lastname}`,JSON.stringify(datos))
        res.send(respuesta)
    
    }

}
// Realizamos la funcion para corregir el dato de una persona 
async function EditPerson(req,res){
    const {firstname,lastname,id} = req.body;

    let datos = {
        firstname,lastname
    }
    var resultado = await client.keys(`person_${id}*`)

    if (resultado.length > 0) {
        var persona = await  client.get(resultado[0])
        var personajson = JSON.parse(persona)
        if(!datos.firstname || !datos.lastname) {
            respuesta = {
            error: true,
            codigo: 502,
            mensaje: 'El campo  id, nombre  y  apellido son requeridos'
            };
        } else {
            respuesta = {
                error: true,
                codigo: 200,
                mensaje: 'Datos cambiados'
                };
        await  client.set(resultado[0],JSON.stringify({...personajson,firstname,lastname}))
            res.send(respuesta);
            
        };


    }else{
        return res.send("loco, esta vacio!! ");
    }
    console.log(resultado);
    
    
    

}
// eliminar una persona 
async function DeletePerson(req,res){

    const {firstname,lastname,id} = req.body;

    let datos = {
        firstname,lastname
    }
    var resultado = await client.keys(`person_${id}*`)

    if (resultado.length > 0) {
        var persona = await  client.get(resultado[0])
        var personajson = JSON.parse(persona)
        if(datos.firstname === '' || datos.lastname === '' || datos.id === '') {
            respuesta = {
                error: true,
                codigo: 501,
                mensaje: 'El usuario no ha sido creado'
            };
        }else {
            respuesta = {
                error: false,
                codigo: 200,
                mensaje: 'Usuario eliminado'

            };
            await client.del(resultado)
        
            datos = { 
                nombre: '', 
                apellido: '' 
            };
        }
        return res.send(respuesta)
    }else {
        return res.send(datos);
    }
    
}


app.get('/',responderStatus);
app.get('/list',Listperson);
app.post('/add',AddPerson);
app.put('/detail',EditPerson);
app.del('/delete',DeletePerson)



    app.use(function(req, res, next) {
        respuesta = {
        error: true, 
        codigo: 404, 
        mensaje: 'URL no encontrada'
        };
        res.status(404).send(respuesta);
    });


app.listen(port,function(){
    console.log("server running at port "+port);
});
