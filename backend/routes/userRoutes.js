const express = require('express'); 
const router = express.Router(); 
const { validateToken, registerUser, loginUser } = require('../controllers/userController'); 

router.post('/validate', validateToken);
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router; 
