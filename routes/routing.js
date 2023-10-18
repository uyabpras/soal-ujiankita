// const express = require('express');
// const soalController = require('../controller/soalController');

// const router = express.Router();
// router.post('/api/create', soalController.create);
// module.exports = router;

module.exports = app => {
    const soalController = require('../controller/soalController');
    var router = require('express').Router();  
    
    router.post('/api/create', soalController.create);
}