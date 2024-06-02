const {format, createLogger, transports} = require('winston');
const {timestamp, combine, printf, colorize, errors}= format;
function buildDevLogger() {

  const myFormat= printf(({level, message, timestamp, stack})=>{
      return `${timestamp},  ${level}, /*code,*/ ${stack 
        /*cortar o tamanho da stack, apenas o necessario
      exemplo da stack: 
      ReferenceError: ola is not defined
    at Object.<anonymous> (C:\Users\tiago\Documents\faculdade\SD\reverse-proxy\app.js:12:1)
    */ || message}`
  });

  return createLogger({
      level:'info',
      format: combine(colorize(), timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),errors({stack:true}), myFormat),
      //format:winston.format.json(),
      transports: [
          new transports.Console()
      ],
  });
}

module.exports = buildDevLogger;
