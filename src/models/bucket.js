module.exports = (sequelize, DataTypes) => {
  "use strict";
  var Bucket = sequelize.define(
    "Bucket",
    {
      "bucketId": {
        "type": DataTypes.CHAR(8),
        "primaryKey": true
      },
      "path": {
        "type": DataTypes.STRING(1024),
        "allowNull": false
      }
    },
    {
      "classMethods": {
        associate: (models) => {
          Bucket.hasMany(models.Key, {
            "onDelete": "CASCADE",
            "foreignKey": {
              allowNull: false
            }
          });
        }
      },
      "timestamps": false
    }
  );

  return Bucket;
};
