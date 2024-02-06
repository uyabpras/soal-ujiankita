const db = require("../db/connect");
const axiosInstance = require("../helper/axiosInstance");
const kafkaProducer = require('../config/kafka');
const SoalDB = db.soal;
const Op = db.Sequelize.Op;

/**
 * @swagger
 * /api/soal:
 *   post:
 *     description: create a new soal (cant work bcoz the controller wanna req.body)
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
 *       '500':
 *         description: error creating soal
 */
exports.create = async(req, res) => {
    try{ 
        console.log(req.body.token);           
        const soal = {
            mata_pelajaran: req.body.data.mata_pelajaran,
            kategori: req.body.data.kategori,
            deskripsi_soal1: req.body.data.deskripsi_soal1,
            deskripsi_soal2: req.body.data.deskripsi_soal2||null,
            multiple1: req.body.data.multiple1,
            multiple2: req.body.data.multiple2,
            multiple3: req.body.data.multiple3,
            multiple4: req.body.data.multiple4,
            multiple5: req.body.data.multiple5,
            correct_answer: req.body.data.correct_answer,
            description_answer: req.body.data.description_answer||null,
        };
        console.log(soal);
        

        const newsoal = await SoalDB.create(soal)

        const msg = {
            userID: req.body.token.id,
            service: 'soal',
            typeTask: `soal ID: ${newsoal.id}`,
            status: req.body.data.status,
            data:{
                soal: newsoal.id,
                desc: 'create soal'
            }
        }
        kafkaProducer.createTask(msg);

        res.status(201).json({
            success: true,  
            message: 'soal created succesfully', 
            data: newsoal
        });    

    }catch(err){
        res.status(500).send({
            message: err.message || "error creating soal"
        });
    }
};

/**
 * @swagger
 * /api/soal:
 *   get:
 *     description: Get a list of soal
 *     parameters:
 *       - name: mata_pelajaran
 *         in: query
 *         description: Nama mata pelajaran yang dicari
 *         required: false
 *         schema:
 *           type: string
 *       - name: kategori
 *         in: query
 *         description: Nama kategori yang dicari
 *         required: false
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         description: Nomor halaman
 *         required: false
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         description: Jumlah item per halaman
 *         required: false
 *         schema:
 *           type: integer
 *       - name: order
 *         in: query
 *         description: Urutkan berdasarkan createdAt
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - ASC
 *             - DESC
 *           default: ASC
 *     responses:
 *       '200':
 *         description: List of soal
 *       '500':
 *         description: Error getting soal
 */

exports.list = async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = parseInt(req.query.limit)|| 10;
        const offset = page * limit - limit;
        const whereClause = {};

        // Periksa apakah query parameters tersedia
        if (req.query.mata_pelajaran) {
          whereClause.mata_pelajaran = req.query.mata_pelajaran;
        }
    
        if (req.query.kategori) {
          whereClause.kategori = req.query.kategori;
        }
    
        const result = await SoalDB.findAndCountAll({
          where: whereClause,
          order: [["createdAt", req.query.order || "ASC"]],
          limit: limit,
          offset: offset
        });
        const totalpages = Math.ceil(result.count / limit);
        if (page > totalpages) {
            res.status(400).json({
              success: false,
              message: "Invalid page number, exceeds total pages.",
              totalpages: totalpages
            });
          } else {
            res.status(200).json({
              success: true,
              data: result.rows,
              totalpages: totalpages
            });
          }
    } catch (err) {
        res.status(500).send({
            message: err.message || "error getting soal"
        });
    }
};

/**
 * @swagger
 * /api/soal/{id}:
 *   get:
 *     description: Retrieve a specific soal by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the soal to retrieve
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful retrieval of the soal
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Soal'  # Replace with the actual schema reference for your Soal model
 *       '404':
 *         description: Soal not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                   example: "soal not found by id: {id}"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "error getting soal"
 */

exports.findID = async (req, res) => {
    try {
        console.log(req.params);
        const findID = await SoalDB.findByPk(req.params.id);
        if (!findID) {
            res.status(404).send({ 
                success: false,
                data: null,
                message: "soal not found by id:" + req.params.id
            });
        } else {
            res.status(200).send({
                success: true,
                data: findID,
            });
        }
    } catch (err) {
        res.status(500).send({
            message: err.message || "error getting soal"
        });
    }
};

exports.getBulk = async (req, res) => {
    try{
        const result = await SoalDB.findAll({
            where: {
                id: {
                    [Op.in]: req.body.id_soal,
                }
            }
        });

        const foundIds = result.map(item => item.id);
        const notFoundIds = requestedIds.filter(id => !foundIds.includes(id));
    
        if (notFoundIds.length > 0) {
          // Ada beberapa id yang tidak ditemukan
          return res.status(404).send({
            success: false,
            data: null,
            message: `IDs not found: ${notFoundIds.join(', ')}`
          });
        }

        res.status(200).send({
            success: true,
            data: result,
        });
        
    } catch (err) {
        res.status(500).send({
            message: err.message || "error getting soal"
        });
    }
};

/**
 * @swagger
 * /api/soal/{id}:
 *   put:
 *     description: Update a specific soal by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the soal to update
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mata_pelajaran:
 *                 type: string
 *               kategori:
 *                 type: string
 *               deskripsi_soal1:
 *                 type: string
 *               deskripsi_soal2:
 *                 type: string
 *               multiple1:
 *                 type: string
 *               multiple2:
 *                 type: string
 *               multiple3:
 *                 type: string
 *               multiple4:
 *                 type: string
 *               multiple5:
 *                 type: string
 *               correct_answer:
 *                 type: string
 *               description_answer:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successfully updated the soal
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *                   example: "Successfully updated data by id: {id}"
 *       '400':
 *         description: Update soal failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *                   example: "Update soal is failed by id: {id}"
 *       '404':
 *         description: Soal not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                   example: "Soal not found by id: {id}"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "error updating soal"
 */

exports.update = async (req, res) =>{
    try {
        console.log(req.body);
        console.log(req.query);
        const FindID = await SoalDB.findByPk(req.params.id);

        if (!FindID) {
            res.status(404).send({ 
                success: false,
                data: null,
                message: "soal not found by id:" + req.params.id
            });
        }
        const updateSoal = {
            mata_pelajaran: req.body.mata_pelajaran,
            kategori: req.body.kategori,
            deskripsi_soal1: req.body.deskripsi_soal1,
            deskripsi_soal2: req.body.deskripsi_soal2,
            multiple1: req.body.multiple1,
            multiple2: req.body.multiple2,
            multiple3: req.body.multiple3,
            multiple4: req.body.multiple4,
            multiple5: req.body.multiple5,
            correct_answer: req.body.correct_answer,
            description_answer: req.body.description_answer,
        }
        const updatedSoal = await SoalDB.update(updateSoal,{where: {id: req.params.id}});
        if (!updatedSoal){
            res.status(400).send({ 
                success: false,
                data: updatedSoal,
                message: "update soal is failed by id:" + req.params.id
            });
        }
        const msg = {
            userID: req.body.token.id,
            service: 'soal',
            typeTask: `soal ID: ${updateSoal.id}`,
            data:{
                soal: updateSoal.id,
                desc: req.body.comment || 'update soal'
            }
        }
        kafkaProducer.updateTask(msg);

        res.status(200).send({
            success: true,
            data: updateSoal,
            message: "successfully updated data by id:" + req.params.id
        });
    


    } catch (err) {
        res.status(500).send({
            message: err.message || "error updating soal"
        });
    }
};

exports.delete = async (req, res) => {
    try {
      // Find the document by id and delete it
      const findID = await SoalDB.findByPk(req.params.id);
      // If no results found, return document not found
      if (!findID) {
        res.status(404).json({
          success: false,
          result: null,
          message: "No soal found by this id: " + req.params.id,
        });
    }else{
        const result = await SoalDB.destroy({where: {id: req.params.id}})
        const msg = {
            userID: req.body.token.id,
            service: 'soal',
            typeTask: `soal ID: ${req.params.id}`,
            data:{
                soal: req.params.id,
                desc: 'delete'
            }
        }
        kafkaProducer.updateTask(msg);
        res.status(200).json({
          success: true,
          data: result,
          message: "Successfully Deleted the soal by id: " + req.params.id,
        });
    }  
    } catch(err) {
      return res.status(500).json({
        success: false,
        result: null,
        message: "Oops there is an Error",
      });
    }
  };

  exports.score = async (req, res) => {
    try {
        const answer = req.body.data.answer;
        /*
        const answer = [
                        { no_soal: 1, id_soal: 10, correct_answer: 'A' },
                        { no_soal: 2, id_soal: 21, correct_answer: 'B' },
                        { no_soal: 3, id_soal: 34, correct_answer: 'C' },
                        { no_soal: 4, id_soal: 14, correct_answer: 'A' },
                        { no_soal: 5, id_soal: 15, correct_answer: 'B' }
                    ];
         */
        
        const total = {
            modulID: req.body.modulID,
            score: 0,
            data: {
                numberWrongs: [],
                category: [],
                count: {},
            }
            
        };
        const multiplierScore = 100/answer.length;

        await Promise.all(answer.map(async (obj) => {
            const checksoal = await SoalDB.findByPk(obj.id_soal);
            if (checksoal.correct_answer === obj.correct_answer) {
              total.score += multiplierScore;
            } else {
                let numWrongs = {
                    number : obj.no_soal,
                    idSoal : obj.id_soal
                }
                total.data.numberWrongs.push(numWrongs);
                total.data.category.push(checksoal.category);
            }
          }));

          if (total.data.category > 0){
            const count = total.data.category.reduce((name, sum) => {
                name[sum] = (name[sum] || 0) + 1;
            }, {});
            total.data.count = count;
        }

          /* console.log(total);
                    {
                        score: 7, // Contoh skor, jumlah jawaban benar
                        data: {
                                numberWrongs: {
                                                    number: 5,
                                                    idSoal: 789
                                                }, // Contoh jawaban salah
                                category: ['Math',' Science', 'History',  ... dan seterusnya ], // Kategori soal yang dijawab salah
                                count: {
                                        Math: 2,
                                        Science: 3,
                                        History: 1,
                                        // ... dan seterusnya
                                    } // Contoh hitungan jawaban salah per kategori
                            }
                    }

          */
        
        const msg = {
            userID: req.body.token.id,
            typeTask: `score modul ID: ${total.modulID}`,
            data:{
                modul: total.modulID,
                score: total.score,
                details: total.data,
                desc: `score modul ID: ${total.modulID} with score: ${total.score}`
            },
            status: 'active'
        }
        kafkaProducer.createTask(msg);
        // axiosInstance.post(`localhost: ${process.env.score_svc}`,{
        //     userID: req.body.userID,
        //     data: total
        // })
        res.status(200).send({
            success: true,
            data: total,
            message: "successfull calculation score"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            result: null,
            message: "Oops there is an Error",
          });
    }
  };

exports.getHealth = async(req, res) => {
    const data = {
      uptime: process.uptime(),
      message: 'Ok',
      date: new Date()
    }
  
    res.status(200).send(data);
  }