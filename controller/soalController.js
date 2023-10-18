const db = require("../db/connect");
const Soal = db.soal;
const Op = db.Sequelize.Op;

/**
 * @swagger
 * /api/create:
 *   post:
 *     description: create a new soal
 *     parameters:
 *       - name: mata_pelajaran
 *         in: query
 *         description: nama mata palajaran
 *         required: true
 *         type: string
 *       - name: kategori
 *         in: query
 *         description: kategori soal
 *         required: true
 *         type: string
 *       - name: deskripsi_soal1
 *         in: query
 *         description: deskripsi soal
 *         required: true
 *         type: string
 *       - name: deskripsi_soal2
 *         in: query
 *         description: deskripsi soal
 *         required: false
 *         type: string
 *       - name: multiple1
 *         in: query
 *         description: mengisi pilihan jawaban ke 1
 *         required: true
 *         type: string
 *       - name: multiple2
 *         in: query
 *         description: mengisi pilihan jawaban ke 2
 *         required: true
 *         type: string
 *       - name: multiple3
 *         in: query
 *         description: mengisi pilihan jawaban ke 3
 *         required: true
 *         type: string
 *       - name: multiple4
 *         in: query
 *         description: mengisi pilihan jawaban ke 4
 *         required: true
 *         type: string
 *       - name: multiple5
 *         in: query
 *         description: mengisi pilihan jawaban ke 5
 *         required: true
 *         type: string
 *       - name: correct_answer
 *         in: query
 *         description: isikan multiple keberapa yang benar
 *         required: true
 *         type: string
 *       - name: description_answer
 *         in: query
 *         description: untuk pembahasan jawaban
 *         required: false
 *         type: string
 *     responses:
 *       '200':
 *         description: Hasil perhitungan
 */
exports.create = async(req, res) => {
    try{
        if(!req.body.deskripsi_soal1||req.body.multiple1||req.body.multiple1||
            req.body.multiple2||req.body.multiple3||req.body.multiple4){
            res.status(404).send({
                message: "content can not be empty!"
            });
            return;
        };

        const soal = {
            mata_pelajaran: req.body.mata_pelajaran,
            kategori: req.body.kategori,
            deskripsi_soal1: req.body.deskripsi_soal1,
            deskripsi_soal2: req.body.deskripsi_soal2,
            multiple1: req.body.multiple1,
            multiple2: req.body.multiple2,
            multiple3: req.body.multiple3,
            multiple4: req.body.multiple4,
            correct_answer: req.body.correct_answer,
            description_answer: req.body.description_answer,
        };

        Soal.create(soal)
        .then((data) => {
          res.send(data);  
        }).catch((err) => {
            res.status(500).send({
                message: err.message || "error creating soal"
            });
        });

    }catch(err){
        res.status(500).send({
            message: err.message || "error creating soal"
        });
    }
};