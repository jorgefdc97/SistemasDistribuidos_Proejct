// Synchronous readFile function
function readFile(key, callback) {
    try {
      const data = fs.readFileSync(`${key}.json`, 'utf8');
      callback(null, JSON.parse(data));
    } catch (error) {
      callback(error, null);
    }
  }
  // Asynchronous readFile function
  async function readFileAsync(key, callback) {
    try {
      const data = await new Promise((resolve, reject) => {
        fs.readFile(`${key}.json`, 'utf8', (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      }); 
      callback(null, JSON.parse(data));
    } catch (error) {
      callback(error, null);
    }
  }
  // Synchronous updateFile function
  function updateFile(key, newData, callback) {
    try {
      const data = fs.readFileSync(`${key}.json`, 'utf8');
      const parsedData = JSON.parse(data);
      Object.assign(parsedData, newData);
      fs.writeFileSync(`${key}.json`, JSON.stringify(parsedData));
      callback(null);
    } catch (error) {
      callback(error);
    }
  } 
  // Asynchronous updateFile function
  async function updateFileAsync(key, newData, callback) {
    try {
      const data = await readFileAsync(key);
      Object.assign(data, newData);
      if (newData[key] === '--nil--') {
        delete data[key];
      }
      await writeFileAsync(key, data);
      callback(null);
    } catch (error) {
      callback(error);
    }
  }
  // Synchronous deleteFile function
  function deleteFile(key, callback) {
    try {
      fs.unlinkSync(`${key}.json`);
      callback(null);
    } catch (error) {
      callback(error);
    }
  }
  // Asynchronous deleteFile
  async function deleteFileAsync(key, callback) {
    try {
      await new Promise((resolve, reject) => {
        fs.unlink(`${key}.json`, err => {
          if (err) reject(err);
          else resolve();
        });
      });
      callback(null);
    } catch (error) {
      callback(error);
    }
  }
  // Synchronous writeFile
  function writeFile(key, data, callback) {
    try {
      fs.writeFileSync(`${key}.json`, JSON.stringify(data));
      callback(null);
    } catch (error) {
      callback(error);
    }
  }
  // Asynchronous writeFile
  async function writeFileAsync(key, data) {
    try {
      await new Promise((resolve, reject) => {
        fs.writeFile(`${key}.json`, JSON.stringify(data), err => {
          if (err) reject(err);
          else resolve();
        });
      });
    } catch (error) {
      throw error;
    }
  }