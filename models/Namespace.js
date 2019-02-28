class Namespace {
  constructor(id, namespaceTitle, img, endpoint) {
    this.id = id;
    this.img = img;
    this.namespaceTitle = namespaceTitle;
    this.endpoint = endpoint;
    this.rooms = [];
  }

  addRoom(roomObj) {
    this.rooms.push(roomObj);
  }
}

module.exports = Namespace;
