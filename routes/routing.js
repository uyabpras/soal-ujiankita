const express = require('express');
const soalController = require('../controller/soalController');

const router = express.Router();
router.post('/create', soalController.create);
router.get('/', soalController.list);
router.get('/find/:id', soalController.findID);
router.put('/:id', soalController.update);
router.delete('/:id', soalController.delete);
router.post('/score', soalController.score);
router.get('/health', soalController.getHealth);
module.exports = router;

// const soalController = require('../controller/soalController');
// module.exports = router=> {
    
//     var router = require('express').Router();  
//     router.post('/create', soalController.create);
// }