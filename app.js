const express = require("express")
const app = express()
const handlebars = require("express-handlebars").engine
const bodyParser = require("body-parser")

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app')
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore')

const serviceAccount = require("./serviceAccountKey.json")

initializeApp({
    credential: cert(serviceAccount)
})

const db = getFirestore()

app.engine('handlebars', handlebars({ 
    helpers: {
        eq: function (v1, v2) {
          return v1 === v2
        }
    },  
    defaultLayout: 'main' 
}))
app.set("view engine", "handlebars")

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get("/", function(req, res) {
    res.render("primeira_pagina")
})

app.post("/cadastrar", function(req, res) {
    var result = db.collection("clientes").add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function() {
        res.redirect('/consultar')
        console.log("Dados cadastrados com sucesso!")
    })
})

app.get("/consultar", function (req, res) {
    var posts = []
    db.collection('clientes').get().then(
        function(snapshot) {
            snapshot.forEach(function(doc) {
                const data = doc.data()
                data.id = doc.id
                posts.push(data)
            })
            console.log(posts)
            res.render('consulta', {posts: posts})
        }
    )
})

app.get("/editar/:id", function(req, res){
    var posts = []
    const id = req.params.id
    const clientes = db.collection('clientes').doc(id).get().then(
        function(doc){
            const data = doc.data()
            data.id = doc.id
            posts.push(data)
            console.log({posts: posts})
            res.render('editar', {posts: posts})
        }
    )    
})

app.post("/atualizar/:id", function(req, res){
    const id = req.params.id
    db.collection('clientes').doc(id).update({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function(){
        res.redirect('/consultar')
        console.log("Dados atualizados com sucesso!")
    })
})

app.get("/excluir/:id", function(req, res) {
    const id = req.params.id
    db.collection('clientes').doc(id).delete().then(function() {
        res.redirect("/consultar")
        console.log("Dados excluídos com sucesso!")
    })
})

app.listen(8081, function() {
    console.log("Servidor ativo!")
})