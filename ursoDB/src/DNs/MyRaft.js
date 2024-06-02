const LifeRaft = require('@markwylde/liferaft');
const logger = require('../logger'); 

class MyRaft extends LifeRaft {
  constructor(options) {
    super(options);
    this.votes = {};
    this.peers = options.peers || []; 
  }

  onVote(vote) {
    logger.info(`Received vote request from ${vote.address} for term ${vote.term}`);

    const voteGranted = this.shouldGrantVote(vote);

    this.emit('vote response', {
      address: vote.address,
      term: vote.term,
      voteGranted: voteGranted
    });

    if (voteGranted) {
      logger.info(`Voted for ${vote.address} in term ${vote.term}`);
    } else {
      logger.info(`Rejected vote request from ${vote.address} in term ${vote.term}`);
    }
  }

  shouldGrantVote(vote) {
    return true;
  }

  onVoteResponse(response) {
    logger.info(`Received vote response from ${response.address} for term ${response.term}, voteGranted: ${response.voteGranted}`);

    if (response.term > this.term) {
      this.term = response.term;
      this.state = 'follower';
      logger.info(`Stepped down to follower for term ${this.term}`);
    }

    if (response.voteGranted) {
      this.votes[response.address] = true;
      const voteCount = Object.values(this.votes).filter(vote => vote).length;
      const majority = Math.floor((this.peers.length + 1) / 2) + 1;

      if (voteCount >= majority) {
        this.state = 'leader';
        this.emit('leader', this.address);
        logger.info(`Node ${this.address} - Elected as leader for term ${this.term}`);
      }
    }
  }

  emit(event, data) {
    super.emit(event, data);
    if (event === 'vote response') {
      this.onVoteResponse(data);
    }
  }
}

module.exports = MyRaft;
