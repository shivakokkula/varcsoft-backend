const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");

dotenv.config();

let checkToken = (req, res, next) => {
    let token = req.headers['authorization'];
    if (token) {
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length);
            jwt.verify(token, process.env.SECRET, (err, decoded) => {
                if (err) {
                    console.log(err);                    
                    res.status(500).json({message: 'Token is not valid'});
                } else {
                    req.user = decoded;
                    next();
                }
            });
        }
    }
    else{
        res.status(500).json({message: 'Auth token is not supplied'});
    }
};

module.exports = {checkToken: checkToken}