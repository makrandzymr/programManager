var express = require('express');
var router = express.Router();

const programController = require('../controllers/program.controller');
router.get('/', programController.getUserPrograms);
router.get('/:programName', programController.getProgram);
router.put('/', programController.updateProgram);
router.post('/', programController.addProgram);
router.delete('/', programController.deleteUserProgram);

module.exports = router;
