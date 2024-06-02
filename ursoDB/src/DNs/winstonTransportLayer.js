const winston = require('winston');

class WinstonTransport {
  constructor(options) {
    this.logger = options.logger;
    this.logEntries = []; // In-memory log store
  }

  append(entry) {
    this.logger.info(entry);
    this.logEntries.push(entry); // Store the log entry
  }

  // Implement getLastInfo method
  async getLastInfo() {
    if (this.logEntries.length === 0) {
      return {
        index: 0,
        term: 0,
        data: null
      };
    }
    const lastEntry = this.logEntries[this.logEntries.length - 1];
    return {
      index: this.logEntries.length - 1,
      term: lastEntry.term,
      data: lastEntry.data
    };
  }

  // Implement commit method
  async commit(index) {
    this.logger.info(`Committing log entry at index: ${index}`);
    // Handle commit logic if necessary
  }

  // Implement get method
  async get(index) {
    if (index < 0 || index >= this.logEntries.length) {
      return null;
    }
    return this.logEntries[index];
  }

  // Implement getEntries method
  async getEntries(startIndex) {
    if (startIndex < 0 || startIndex >= this.logEntries.length) {
      return [];
    }
    return this.logEntries.slice(startIndex);
  }
}

module.exports = WinstonTransport;
