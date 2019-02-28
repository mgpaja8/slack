class Room {
  constructor(roomId, roomTitle, privateRoom = false) {
    this.roomId = roomId;
    this.roomTitle = roomTitle;
    this.privateRoom = privateRoom;
    this.history = [];
  }

  addMessage(meesage) {
    this.history.push(meesage);
  }

  clearHistory() {
    this.history = [];
  }
}

module.exports = Room;
