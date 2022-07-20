const express = require("express");
require('dotenv/config')
const bodyParser = require('body-parser');
const mysql = require("mysql");
const Product = require('./models/product');
const bcrypt = require("bcryptjs");
const cors = require('cors');
const multer = require('multer');

let numAuthVente = 0;


const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype]
        let uploadError = new Error('type de fichier invalide !')

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, './uploads')
    },
    filename: function (req, file, cb) {

        const filename = file.originalname.split(" ").join("-");
        //modification fichier unique geré....
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, filename + '-' + Date.now() + '.' + extension)
    }
})

const uploadOption = multer({ storage: storage });

//****************************** MIDLEWARE **********************************************

const api = process.env.API_URL;

const app = express()

app.use(bodyParser.json());
app.use(cors());
app.options('*', cors());
app.use('/uploads', express.static(__dirname + '/uploads'));





// connection base de donnes 

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "ahlelo_db"

})

con.connect(function (err) {
    if (err) throw err;
    console.log("connect to the data base !")
    // con.query("SELECT * FROM test", function(err, res) {
    //     if(err) throw err;
    //     console.log(res);
    // })
})


// requettes pour verification Systeme

app.get(api + '/sys/infos', (req, res) => {

    res.status(200).json({ success: true, message: "serveur en ligne !" });
})



//*************************************************************************************** */

// requettes pour client



app.get(api + '/client', (req, res) => {

    con.query("SELECT * FROM client", function (err, resultat) {
        if (err) throw err;
        //console.log(resultat);
        res.send(resultat);
    })
})


app.post(api + '/login/client', (req, res) => {

    var i = 0;

    con.query("SELECT * FROM client WHERE contact_client = '" + req.body.contact + "' AND password_client = '" + req.body.password + "'", function (err, resultat) {

        if (err) throw err;
        // console.log(resultat.length)

        // if (resultat[0] !== undefined) {
        //     console.log('ok')
        //     if (bcrypt.compareSync(req.body.password, resultat[0].password))
        //         i = 1;
        // }

        if (resultat.length == 1) {
            let data = {
                "user_id": resultat[0].id_client,
                "contact": resultat[0].contact_client,
                "nom": resultat[0].nom_client,
                "prenom": resultat[0].prenom_client,
            }
            res.send(data)

        }
        else
            res.status(204).json({ success: false, message: "utilisateur non trouver !" })

    })
})


app.post(api + '/client', (req, res) => {

    const copyNumAuthVente = numAuthVente + 1;
    let date = new Date();
    const month = date.getMonth() + 1;
    date = date.getDate() + "/" + month + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

    // console.log(date)
    //console.log(resultat);

    con.query("INSERT INTO `client`(`nom_client`, `prenom_client`, `email_client`, `password_client`, `contact_client`, `date_creation_client`, `isActive_client`, `photo_profile`) VALUES ('" + req.body.nom_client + "','" + req.body.prenom_client + "','" + req.body.email_client + "','" + req.body.password_client + "','" + req.body.contact_client + "','" + date + "','1', 'empty')",

        function (err, resultat) {
            if (err) throw err;

            if (!resultat.affectedRows)
                res.status(404).json({ success: false, message: "client non creer !" })
            else {
                res.status(200).json({ success: true, message: "client créer avec succes !" });
                numAuthVente += 1;
            }
        })


})


app.delete(api + '/client/:id', (req, res) => {

    con.query("DELETE FROM `client` WHERE id_client = '" + req.params.id + "'", function (err, resultat) {
        if (err) throw err;

        //console.log("affectedRows = "+resultat.affectedRows);

        if (!resultat.affectedRows)
            res.status(404).json({ success: false, message: "client non trouver !" })
        else
            res.status(200).json({ success: true, message: "client créer avec succes !" });
    })
})


app.put(api + '/client/:id', (req, res) => {

    // bcrypt.hashSync(req.body.password, 10)

    con.query("UPDATE `client` SET `nom_client`='" + req.body.nom_client + "',`prenom_client`='" + req.body.prenom_client + "',`email_client`='" + req.body.email_client + "',`password_client`='" + req.body.password_client + "',`contact_client`='" + req.body.contact_client + "',`date_creation_client`='" + req.body.date_creation_client + "',`photo_profile`='" + req.body.photo_profile + "' WHERE id_client = '" + req.params.id + "'", function (err, resultat) {
        if (err) throw err;

        if (!resultat.affectedRows)
            res.status(404).json({ success: false, message: "Données client non trouver !" })
        else
            res.status(200).json({ success: true, message: "Données client modifier avec succes !" });
    })
})

//**********************************************************************************************************/

// requettes pour Founisseur



app.get(api + '/vendor', (req, res) => {

    con.query("SELECT * FROM fournisseur", function (err, resultat) {
        if (err) throw err;
        //console.log(resultat);
        res.send(resultat);
    })
})

app.get(api + `/vendor/search/:id`, (req, res) => {

    con.query("SELECT * FROM fournisseur WHERE id_Fournisseur = " + req.params.id + "", function (err, resultat) {
        if (err) throw err;
        //console.log(resultat);
        res.send(resultat);
    })
})

app.get(api + `/vendor/product/:id`, (req, res) => {

    con.query("SELECT * FROM produit WHERE id_fournisseur = " + req.params.id + "", function (err, resultat) {
        if (err) throw err;
        //console.log(resultat);
        res.send(resultat);
    })
})


app.post(api + '/login/vendor', (req, res) => {

    var i = 0;

    con.query("SELECT * FROM fournisseur WHERE contact_client = '" + req.body.contact + "' AND password_client = '" + req.body.password + "'", function (err, resultat) {

        if (err) throw err;
        // console.log(resultat.length)

        // if (resultat[0] !== undefined) {
        //     console.log('ok')
        //     if (bcrypt.compareSync(req.body.password, resultat[0].password))
        //         i = 1;
        // }

        if (resultat.length == 1) {
            let data = {
                "user_id": resultat[0].id_client,
                "contact": resultat[0].contact_client,
                "nom": resultat[0].nom_client,
                "prenom": resultat[0].prenom_client,
            }
            res.send(data)

        }
        else
            res.status(204).json({ success: false, message: "utilisateur non trouver !" })

    })
})


app.post(api + '/vendor', (req, res) => {

    const copyNumAuthVente = numAuthVente + 1;
    let date = new Date();
    const month = date.getMonth() + 1;
    date = date.getDate() + "/" + month + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

    // console.log(date)
    //console.log(resultat);

    con.query("INSERT INTO `fournisseur`(`nom_Fournisseur`, `prenom_Fournisseur`, `email`, `contact`,`password`, `numero_ifu`, `numero_bccm`, `domaine`, `numero_cnib`, `date_cnib`, `date_naissance`, `pers_a_prevenir`, `image`) VALUES ('" + req.body.nom_Fournisseur + "','" + req.body.prenom_Fournisseur + "','" + req.body.email + "','" + req.body.contact + "','" + req.body.password + "','" + req.body.numero_ifu + "','" + req.body.numero_bccm + "','" + req.body.domaine + "','" + req.body.numero_cnib + "','" + req.body.date_cnib + "','" + req.body.date_naissance + "','" + req.body.pers_a_prevenir + "')",

        function (err, resultat) {
            if (err) throw err;

            if (!resultat.affectedRows)
                res.status(404).json({ success: false, message: "fournisseur non creer !" })
            else {
                res.status(200).json({ success: true, message: "fournisseur créer avec succes !" });
            }
        })


})


app.delete(api + '/vendor/:id', (req, res) => {

    con.query("DELETE FROM `fournisseur` WHERE id_Fournisseur = '" + req.params.id + "'", function (err, resultat) {
        if (err) throw err;

        //console.log("affectedRows = "+resultat.affectedRows);

        if (!resultat.affectedRows)
            res.status(404).json({ success: false, message: "Founisseur non trouver !" })
        else
            res.status(200).json({ success: true, message: "Founisseur supprimé avec succes !" });
    })
})


app.put(api + '/vendor/:id', (req, res) => {

    // bcrypt.hashSync(req.body.password, 10)

    con.query("UPDATE `fournisseur` SET `nom_Fournisseur`='" + req.body.nom_Fournisseur + "',`prenom_Fournisseur`='" + req.body.prenom_Fournisseur + "',`email`='" + req.body.email + "',`contact`='" + req.body.contact + "',`password`='" + req.body.password + "',`numero_ifu`='" + req.body.numero_ifu + "',`numero_bccm`='" + req.body.numero_bccm + "',`domaine`='" + req.body.domaine + "',`numero_cnib`='" + req.body.numero_cnib + "',`date_cnib`='" + req.body.date_cnib + "',`date_naissance`='" + req.body.date_naissance + "',`pers_a_prevenir`='" + req.body.pers_a_prevenir + "' WHERE id_Fournisseur = '" + req.params.id + "'", function (err, resultat) {
        if (err) throw err;

        if (!resultat.affectedRows)
            res.status(404).json({ success: false, message: "Données Fournisseur non trouver !" })
        else
            res.status(200).json({ success: true, message: "Données Fournisseur modifier avec succes !" });
    })
})

//**********************************************************************************************************/

// requettes pour livreur



app.get(api + '/livreur', (req, res) => {

    con.query("SELECT * FROM livreur", function (err, resultat) {
        if (err) throw err;
        //console.log(resultat);
        res.send(resultat);
    })
})


app.post(api + '/login/livreur', (req, res) => {

    var i = 0;

    con.query("SELECT * FROM livreur WHERE contact_Livreur = '" + req.body.contact + "' AND password_Livreur = '" + req.body.password + "'", function (err, resultat) {

        if (err) throw err;
        // console.log(resultat.length)

        // if (resultat[0] !== undefined) {
        //     console.log('ok')
        //     if (bcrypt.compareSync(req.body.password, resultat[0].password))
        //         i = 1;
        // }

        if (resultat.length == 1) {
            let data = {
                "user_id": resultat[0].id_client,
                "contact": resultat[0].contact_client,
                "nom": resultat[0].nom_client,
                "prenom": resultat[0].prenom_client,
            }
            res.send(data)

        }
        else
            res.status(204).json({ success: false, message: "utilisateur non trouver !" })

    })
})


app.post(api + '/livreur', (req, res) => {

    // console.log(date)
    //console.log(resultat);

    con.query("INSERT INTO `livreur`(`nom_Livreur`, `date_naissance_Livreur`, `prenom_Livreur`, `email_Livreur`, `contact_Livreur`,`password_Livreur`, `num_cnib_Livreur`, `marque_engin_Livreur`, `etat_engin_Livreur`, `immatriculation_Livreur`, `isonline_Livreur`) VALUES ('" + req.body.nom_Livreur + "','" + req.body.date_naissance_Livreur + "','" + req.body.prenom_Livreur + "','" + req.body.email_Livreur + "','" + req.body.contact_Livreur + "','" + req.body.password_Livreur + "','" + req.body.num_cnib_Livreur + "','" + req.body.marque_engin_Livreur + "','" + req.body.etat_engin_Livreur + "','" + req.body.immatriculation_Livreur + "','1')",

        function (err, resultat) {
            if (err) throw err;

            if (!resultat.affectedRows)
                res.status(404).json({ success: false, message: "Livreur non creer !" })
            else {
                res.status(200).json({ success: true, message: "Livreur créer avec succes !" });
            }
        })
})




app.delete(api + '/livreur/:id', (req, res) => {

    con.query("DELETE FROM `livreur` WHERE id_Livreur = '" + req.params.id + "'", function (err, resultat) {
        if (err) throw err;

        //console.log("affectedRows = "+resultat.affectedRows);

        if (!resultat.affectedRows)
            res.status(404).json({ success: false, message: "Livreur non trouver !" })
        else
            res.status(200).json({ success: true, message: "Livreur supprimé avec succes !" });
    })
})


app.put(api + '/livreur/:id', (req, res) => {

    // bcrypt.hashSync(req.body.password, 10)

    con.query("UPDATE `livreur` SET `nom_Livreur`='" + req.body.nom_Livreur + "',`date_naissance_Livreur`='" + req.body.date_naissance_Livreur + "',`prenom_Livreur`='" + req.body.prenom_Livreur + "',`email_Livreur`='" + req.body.email_Livreur + "',`contact_Livreur`='" + req.body.contact_Livreur + "',`password_Livreur`='" + req.body.password_Livreur + "',`num_cnib_Livreur`='" + req.body.num_cnib_Livreur + "',`marque_engin_Livreur`='" + req.body.marque_engin_Livreur + "',`etat_engin_Livreur`='" + req.body.etat_engin_Livreur + "',`immatriculation_Livreur`='" + req.body.immatriculation_Livreur + "' WHERE id_Livreur = '" + req.params.id + "'", function (err, resultat) {
        if (err) throw err;

        if (!resultat.affectedRows)
            res.status(404).json({ success: false, message: "Données Fournisseur non trouver !" })
        else
            res.status(200).json({ success: true, message: "Données Fournisseur modifier avec succes !" });
    })
})

//**********************************************************************************************************/



// requettes pour utilisateur



app.get(api + '/user', (req, res) => {

    con.query("SELECT * FROM user", function (err, resultat) {
        if (err) throw err;
        //console.log(resultat);
        res.send(resultat);
    })
})


app.post(api + '/login/custumer', (req, res) => {

    var i = 0;

    con.query("SELECT * FROM user WHERE email = '" + req.body.email + "'", function (err, resultat) {

        if (err) throw err;
        console.log(resultat[0])

        if (resultat[0] !== undefined) {
            console.log('ok')
            if (bcrypt.compareSync(req.body.password, resultat[0].password))
                i = 1;
        }

        if (i == 1) {
            const data = [
                {
                    id_User: resultat[0].id_User,
                    nom: resultat[0].nom,
                    prenom: resultat[0].prenom,
                    email: resultat[0].email,
                    image: resultat[0].image,
                }
            ]
            res.send(data)

        }
        else
            res.status(404).json({ success: false, message: "utilisateur non trouver !" })

    })
})


app.post(api + '/user/id', (req, res) => {

    const copyNumAuthVente = numAuthVente + 1;

    con.query("INSERT INTO `user`(`nom`, `prenom`, `email`, `password`, `ville`, `numero`, `numAuthVente`, `user`) VALUES ('" + '' + "','" + '' + "','" + req.body.email + "','" + bcrypt.hashSync(req.body.password, 10) + "','" + '' + "','" + req.body.numero + "','" + copyNumAuthVente + "','" + req.body.user + "')", function (err, resultat) {
        if (err) throw err;

        if (!resultat.affectedRows)
            res.status(404).json({ success: false, message: "utilisateur non creer !" })
        else {
            res.status(200).json({ success: true, message: "utilisateur créer avec succes !" });
            numAuthVente += 1;
        }
    })
})


app.delete(api + '/user/id', (req, res) => {

    con.query("DELETE FROM `user` WHERE id_User = '" + req.body.id + "'", function (err, resultat) {
        if (err) throw err;

        //console.log("affectedRows = "+resultat.affectedRows);

        if (!resultat.affectedRows)
            res.status(404).json({ success: false, message: "utilisateur non trouver !" })
        else
            res.status(200).json({ success: true, message: "utilisateur créer avec succes !" });
    })
})


app.put(api + '/user/id', (req, res) => {

    con.query("UPDATE `user` SET `nom`='" + req.body.nom + "',`prenom`='" + req.body.prenom + "',`email`='" + req.body.email + "',`password`='" + bcrypt.hashSync(req.body.password, 10) + "',`ville`='" + req.body.ville + "',`numero`='" + req.body.numero + "' WHERE id_User = '" + req.params.id + "'", function (err, resultat) {
        if (err) throw err;

        if (!resultat.affectedRows)
            res.status(404).json({ success: false, message: "Données utilisateur non trouver !" })
        else
            res.status(200).json({ success: true, message: "Données utilisateur modifier avec succes !" });
    })
})

//**********************************************************************************************************/



// requettes pour produits

app.get(api + '/product', (req, res) => {

    con.query("SELECT produit.*, caracteristique.* FROM produit, caracteristique WHERE produit.id = caracteristique.id_produit", function (err, resultat) {
        if (err) throw err;
        console.log(resultat);
        res.send(resultat);
    })
})

app.get(api + '/product/detaille/:id', (req, res) => {

    con.query("SELECT produit.*, caracteristique.* FROM produit, caracteristique WHERE produit.id = caracteristique.id_produit and produit.id =" + req.params.id, function (err, resultat) {
        if (err) throw err;
        // console.log(resultat);
        res.send(resultat);
    })
})

app.get(api + '/product/categorie/:id', (req, res) => {

    con.query("SELECT produit.*, caracteristique.* FROM produit, caracteristique WHERE produit.id_categorie =  " + req.params.id, function (err, resultat) {
        if (err) throw err;
        //console.log(resultat);
        res.send(resultat);
    })
})

app.get(api + '/product/search/:val', (req, res) => {
    console.log(req.params.val);


    con.query("SELECT produit.*, caracteristique.* FROM produit, caracteristique WHERE produit.libelle LIKE  '%" + req.params.val + "%'", function (err, resultat) {
        if (err) throw err;
        //console.log(resultat);
        res.send(resultat);
    })
})

app.get(api + '/product/filtre/:min&:max', (req, res) => {

    con.query("SELECT produit.*, caracteristique.* FROM produit, caracteristique WHERE produit.prix BETWEEN   '" + req.params.min + "' AND '" + req.params.max + "'", function (err, resultat) {
        if (err) throw err;
        //console.log(resultat);
        res.send(resultat);
    })
})

app.get(api + '/product/:id', (req, res) => {

    con.query("SELECT produit.*, caracteristique.* FROM produit, caracteristique WHERE produit.id =  " + req.params.id, function (err, resultat) {
        if (err) throw err;
        //console.log(resultat);
        res.send(resultat);
    })
})


app.post(api + '/product', (req, res) => {

    // const file = req.file;

    // if (!file)
    //     res.status(400).json({ success: false, message: "pas d'image dans la requette !" })

    // const filename = req.file.filename;
    // const basePath = req.protocol + '://' + req.get('host') + '/uploads/';
    con.query("SELECT COUNT(*) FROM produit", function (err, resultat) {
        if (err)
            res.status(400).json({ success: false, message: "produit non Ajouter !" });

        var num = resultat[0]["COUNT(*)"];
        var i = 6
        var val = num
        while (i > num.toString().length) {
            val = "0" + val;
            i--;
        }

        con.query("INSERT INTO `produit`(`id`, `libelle`, `description`, `prix`, `image`, `gallerie_img`, `slug`, `tags`, `isPacking`, `id_sousCategorie`, `isPromo`, `code_produit`, `id_fournisseur`) VALUES ('" + val + "','" + req.body.libelle + "','" + req.body.description + "','" + req.body.prix + "','" + req.body.image + "','" + req.body.gallerie_img + "','" + req.body.slug + "','" + req.body.tags + "','" + req.body.isPacking + "','" + req.body.id_sousCategorie + "','" + req.body.isPromo + "','" + req.body.code_produit + "','" + req.body.id_Fournisseur +"') ", function (err, res1) {
            if (err) {
                if (err) throw err;

                res.status(400).json({ success: false, message: "produit non Ajouter !" })
                return;
            }

            con.query("INSERT INTO `caracteristique`(`couleur`, `poids`, `taille`, `longueur`, `largeur`, `hauteur`, `id_produit`) VALUES('" + req.body.couleur + "','" + req.body.poids + "','" + req.body.taille + "','" + req.body.longueur + "','" + req.body.largeur + "','" + req.body.hauteur + "','" + val + "')", function (err, resultat) {
                if (err) {
                    if (err) throw err;

                    res.status(200).json({ success: false, message: "produit non Ajouter !3" })
                    return;

                }


                res.send("Produit ajouté avec succes !")

            })


        });
    })


})


app.delete(api + '/product/:id', (req, res) => {

    con.query("DELETE FROM `produits` WHERE id_Produits = '" + req.params.id + "'", function (err, resultat) {
        if (err) throw err;

        //console.log("affectedRows = "+resultat.affectedRows);

        if (!resultat.affectedRows)
            res.status(404).json({ success: false, message: "utilisateur non trouver !" })
        else
            res.status(404).json({ success: true, message: "utilisateur suprimer avec succes !" });
    })
})

app.put(api + '/product/:id', (req, res) => {


    con.query("UPDATE `produit` SET `libelle`='" + req.body.libelle + "',`description`='" + req.body.description + "',`image`='" + req.body.image + "',`gallerie_img`='" + req.body.gallerie_img + "',`prix`='" + req.body.prix + "',`slug`='" + req.body.slug + "',`tags`='" + req.body.tags + "',`isPacking`='" + req.body.isPacking + "',`code_produit`='" + req.body.code_produit + "' WHERE id = '" + req.params.id + "'", function (err, resultat) {
        if (err) {
            res.status(404).json({ success: false, message: "Données produit non modifiées! 1" })
            return;
        }

        //console.log("affectedRows = "+resultat.affectedRows);





        con.query("UPDATE `caracteristique` SET `couleur`='" + req.body.couleur + "',`poids`='" + req.body.poids + "',`taille`='" + req.body.taille + "',`longueur`='" + req.body.longueur + "',`largeur`='" + req.body.largeur + "',`hauteur`='" + req.body.hauteur + "' WHERE id_Produit = '" + req.params.id + "'", function (err, resultat) {

            if (err) {
                res.status(404).json({ success: false, message: "Données produit non modifiées ! 2" })
                return;
            }

            //console.log("affectedRows = "+resultat.affectedRows);

            // res.send(resultat);
            res.status(404).json({ success: true, message: "Données produit modifier avec succes !" });
        })

        // res.status(404).json({success: true, message: "Données utilisateur modifier avec succes !"});
    })
})

app.put(api + '/product/gallery-images/:id', uploadOption.array('images', 10), (req, res) => {

    const files = req.files;
    let imagesPaths = [];
    const basePath = req.protocol + '://' + req.get('host') + '/uploads/';

    if (files) {
        files.map(file => {
            imagesPaths.push(basePath + file.filename)
        })

    }

    con.query("UPDATE `produits` SET`images`='" + imagesPaths + "' WHERE id_Produits = '" + req.params.id + "'", function (err, resultat) {
        if (err) throw err;

        //console.log("affectedRows = "+resultat.affectedRows);

        if (!resultat.affectedRows)
            res.status(404).json({ success: false, message: "Données galerie non trouver !" })
        else
            res.status(404).json({ success: true, message: "Données galerie modifier avec succes !" });
    })

})

//**********************************************************************************************************/

// requettes pour category



app.get(api + '/category', (req, res) => {

    con.query("SELECT * FROM categorie", function (err, resultat) {
        if (err) throw err;
        //console.log(resultat);
        res.send(resultat);
    })
})

app.get(api + '/sous_categorie', (req, res) => {

    con.query("SELECT sous_categorie.*, categorie.* FROM sous_categorie, categorie WHERE sous_categorie.id_categorie = categorie.id ", function (err, resultat) {
        if (err) throw err;
        //console.log(resultat);
        res.send(resultat);
    })
})

app.get(api + '/category/sous_categorie/:id', (req, res) => {

    con.query("SELECT sous_categorie.* FROM sous_categorie WHERE sous_categorie.id_categorie = '" + req.params.id + "'", function (err, resultat) {
        if (err) throw err;
        //console.log(resultat);
        res.send(resultat);
    })
})

app.get(api + '/category/product', (req, res) => {

    con.query("SELECT * FROM product WHERE id_sousCategorie IN SELECT id FROM sous_categorie  ", function (err, resultat) {
        if (err) {
            res.status(404).json({ success: false, message: "Données non trouver !" });
            return;
        }        //console.log(resultat);
        res.send(resultat);
    })
})


app.post(api + '/category', (req, res) => {

    con.query("INSERT INTO `categorie`(`libelle`, `image`) VALUES ('" + req.body.libelle + "','" + req.body.image + "')", function (err, resultat) {
        if (err) throw err;
        // console.log(resultat);

        if (!resultat.affectedRows)
            res.status(500).json({ success: false, message: "Catégorie non créer recommencer SVP !" })
        else
            res.send("Catégorie créer avec succes !");
    })
})

app.post(api + '/sous_categorie', (req, res) => {

    con.query("INSERT INTO `sous_categorie`(`nom_sous_categorie`, `image_sous_categorie`, `id_categorie`) VALUES ('" + req.body.nom_sous_categorie + "','" + req.body.image_sous_categorie + "','" + req.body.id_categorie + "')", function (err, resultat) {
        if (err) throw err;
        // console.log(resultat);

        if (!resultat.affectedRows)
            res.status(500).json({ success: false, message: "sous_categorie non créer recommencer SVP !" })
        else
            res.status(200).json({ success: true, message: "sous_categorie créer avec succes !" })
    })
})


app.delete(api + '/category', (req, res) => {

    con.query("DELETE FROM `categorie` WHERE id = '" + req.body.id + "'", function (err, resultat) {
        if (err) throw err;

        //console.log("affectedRows = "+resultat.affectedRows);
        if (err) {
            res.status(404).json({ success: false, message: "Categorie non trouver !" })
            return;
        }

        res.status(200).json({ success: true, message: "Categorie suprimer avec succes !" });
    })
})

app.delete(api + '/sous_categorie', (req, res) => {

    console.log(req)

    con.query("DELETE FROM `sous_categorie` WHERE id_sous_cat = '" + req.body.id + "'", function (err, resultat) {
        if (err) {
            res.status(404).json({ success: false, message: "Sous categorie non trouver !" })
            return;
        }

        res.status(200).json({ success: true, message: "Sous categorie suprimer avec succes !" });
    })
})


app.put(api + '/category', (req, res) => {

    con.query("UPDATE `category` SET `nom`='" + req.body.nom + "',`couleur`='" + req.body.couleur + "',`icon`='" + req.body.icon + "',`image`='" + req.body.image + "' WHERE id_Category = '" + req.params.id + "'", function (err, resultat) {
        if (err) throw err;


        if (!resultat.affectedRows)
            res.status(404).json({ success: false, message: "Données utilisateur non trouver !" })
        else
            res.status(404).json({ success: true, message: "Données utilisateur modifier avec succes !" });
    })
})

app.put(api + '/category/products', (req, res) => {

    con.query("SELECT * FROM produits where id_categorie ='" + req.body.id_category + "'", function (err, resultat) {
        if (err) throw err;

        console.log(req.body);
        res.send(resultat)
    })
})


//**********************************************************************************************************/



// requettes pour boutique



app.get(api + '/boutique', (req, res) => {

    con.query("SELECT * FROM boutique", function (err, resultat) {
        if (err) throw err;
        //console.log(resultat);
        res.send(resultat);
    })
})


app.post(api + '/boutique', (req, res) => {

    con.query("INSERT INTO `boutique`(`nom`, `couleur`, `icon`, `image`) VALUES ('" + req.body.nom + "','" + req.body.couleur + "','" + req.body.icon + "','" + req.body.image + "')", function (err, resultat) {
        if (err) throw err;
        console.log(resultat);

        if (!resultat.affectedRows)
            res.status(500).json({ success: false, message: "utilisateur non créer !" })
        else
            res.send("utilisateur créer avec succes !");
    })
})


app.delete(api + '/boutique/:id', (req, res) => {

    con.query("DELETE FROM `boutique` WHERE id_Category = '" + req.params.id + "'", function (err, resultat) {
        if (err) throw err;

        //console.log("affectedRows = "+resultat.affectedRows);

        if (!resultat.affectedRows)
            res.status(404).json({ success: false, message: "utilisateur non trouver !" })
        else
            res.status(404).json({ success: true, message: "utilisateur suprimer avec succes !" });
    })
})


app.put(api + '/boutique', (req, res) => {

    con.query("UPDATE `boutique` SET `nom`='" + req.body.nom + "',`couleur`='" + req.body.couleur + "',`icon`='" + req.body.icon + "',`image`='" + req.body.image + "' WHERE id_Category = '" + req.params.id + "'", function (err, resultat) {
        if (err) throw err;


        if (!resultat.affectedRows)
            res.status(404).json({ success: false, message: "Données utilisateur non trouver !" })
        else
            res.status(404).json({ success: true, message: "Données utilisateur modifier avec succes !" });
    })
})

app.put(api + '/boutique/products', (req, res) => {

    con.query("SELECT * FROM produits where numAuthVente ='" + req.body.numAuthVente + "'", function (err, resultat) {
        if (err) throw err;

        console.log(req.body);
        res.send(resultat)
    })
})


//**********************************************************************************************************/



// requettes pour Commandes



app.get(api + '/order', (req, res) => {

    con.query("SELECT * FROM Commande", function (err, resultat) {
        if (err) throw err;
        //console.log(resultat);
        res.send(resultat);
    })
})


app.post(api + '/order', (req, res) => {

    con.query("INSERT INTO `commande`(`elsmentCommande`, `adress`, `ville`, `numero`, `statut`, `prixTotal`, `id_User`) VALUES ('" + req.body.elsmentCommande + "','" + req.body.adress + "','" + req.body.ville + "','" + req.body.numero + "','" + req.body.statut + "','" + req.body.prixTotal + "','" + req.body.id_User + "')", function (err, resultat) {
        if (err) throw err;
        console.log(resultat);

        if (!resultat.affectedRows)
            res.status(500).json({ success: false, message: "utilisateur non créer !" })
        else
            res.send("Commande créer avec succes !");
    })
})


app.delete(api + '/order/:id', (req, res) => {

    con.query("DELETE FROM `Commande` WHERE id_Commande = '" + req.params.id + "'", function (err, resultat) {
        if (err) throw err;

        //console.log("affectedRows = "+resultat.affectedRows);

        if (!resultat.affectedRows)
            res.status(404).json({ success: false, message: "utilisateur non trouver !" })
        else
            res.status(404).json({ success: true, message: "utilisateur suprimer avec succes !" });
    })
})


app.put(api + '/order/:id', (req, res) => {

    con.query("UPDATE `commande` SET `elsmentCommande`='" + req.body.elsmentCommande + "',`adress`='" + req.body.adress + "',`ville`='" + req.body.ville + "',`numero`='" + req.body.numero + "',`statut`='" + req.body.statut + "',`prixTotal`='" + req.body.prixTotal + "' WHERE id_Commande = '" + req.params.id + "'", function (err, resultat) {
        if (err) throw err;

        //console.log("affectedRows = "+resultat.affectedRows);

        if (!resultat.affectedRows)
            res.status(404).json({ success: false, message: "Données utilisateur non trouver !" })
        else
            res.status(404).json({ success: true, message: "Données utilisateur modifier avec succes !" });
    })
})



//**********************************************************************************************************/*


// requettes pour Panier



app.get(api + '/panier', (req, res) => {

    con.query("select prod.*, pan.quantity from produits prod, panier pan where prod.id_Produits = pan.id_Produits and pan.id_user = 1 ", function (err, resultat) {
        if (err) throw err;
        //console.log(resultat);
        res.send(resultat);
    })
})

app.put(api + '/achat', (req, res) => {

    con.query("select * from achat where id_user = '" + req.body.id_user + "' and code = '" + req.body.code + "'", function (err, resultat) {
        if (err) throw err;
        console.log(req.body);
        res.send(resultat);
    })
})


app.post(api + '/panier', (req, res) => {

    con.query("INSERT INTO `panier`(`id_user`, `id_produits`, `quantity`) VALUES ('" + req.body.id_user + "','" + req.body.id_produit + "','" + req.body.quantity + "')", function (err, resultat) {
        if (err) throw err;
        console.log(req.body);

        if (!resultat.affectedRows)
            res.status(500).json({ success: false, message: "utilisateur non créer !" })
        else
            res.send("utilisateur créer avec succes !");
    })
})


app.delete(api + '/panier', (req, res) => {

    console.log(req.body)

    con.query("DELETE FROM `panier` WHERE id_produits = '" + req.body.id_produit + "' AND id_user = '" + req.body.id_user + "'", function (err, resultat) {
        if (err) throw err;

        //console.log(req.body)

        res.send(resultat);

    })
})

app.put(api + '/panier', (req, res) => {

    con.query("UPDATE `panier` SET `quantity`='" + req.body.quantity + "' WHERE id_produits = '" + req.body.id_produit + "' AND id_user = '" + req.body.id_user + "'", function (err, resultat) {
        if (err) throw err;

        console.log(req.body);
        res.send(resultat);
    })
})

app.get(api + '/panier/id', (req, res) => {

    con.query("SELECT * FROM panier WHERE id_user = '" + req.body.id_user + "'", function (err, resultat) {
        console.log(res)
        if (err) throw err;

        console.log(resultat);

        res.send(resultat);

    })
})


//**********************************************************************************************************/*

// requettes pour Panier


//**********************************************************************************************************/*



// Ecoute serveur
app.listen(3000, () => {
    //console.log("");
    console.log("server is running on http://localhost:3000");
})

