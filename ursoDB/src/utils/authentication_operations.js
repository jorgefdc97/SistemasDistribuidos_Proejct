

const authenticateDataNode = (req, res, next) => {
    // Check if the request contains valid authentication token
    const authToken = req.headers['authorization'];
  
    if (!isValidToken(authToken)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    next();
  };
  
 
const isValidToken = (token) => {

    // Your validation logic here
    
    return token === 'valid_token';
};

module.exports = authenticateDataNode;
  