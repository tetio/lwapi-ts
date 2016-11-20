var config = {
  "local": {
    "MONGO_URI": "mongodb://localhost:27017/lw",
    "MONGO_OPTIONS": {"db": {"safe": true}}
  },
  "development": {
    "MONGO_URI": "mongodb://192.168.19.99:27000/lw?replicaSet=r1",
    "MONGO_OPTIONS": {"db": {"safe": true}}
  },
  "production": {
    "MONGO_URI": "mongodb://user:pwd@instance.mongolab.com:port/heroku_appNumber",
    "MONGO_OPTIONS": {"db": {"safe": true}}
  }
}

export { config }