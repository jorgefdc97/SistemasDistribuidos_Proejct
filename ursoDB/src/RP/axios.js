const axios = require('axios').default;
//axios test
//-----------------------------------------

axios.get('http://localhost:3000/users')
  .then(function (response) {
    // handle success
    console.log(response);
  })
  .catch(function (error) {
    // handle error
    console.log("ola");
  })
  .finally(function () {
    // always executed
  });
/*  
axios.post('/users', {
    firstName: 'Fred',
    lastName: 'Flintstone'
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });*/