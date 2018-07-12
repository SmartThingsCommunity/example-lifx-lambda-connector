"use strict"

const AWS = require('aws-sdk');
const config = require('config');
const dynamoTableName = config.get('dynamo.tableName');
AWS.config.update({region: config.get('dynamo.region')});

const docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
const log = require('../local/log');

/**
 * DynamoDB-based storage and retrival of account data
 */
module.exports = {

    /**
     * Saves data map associated with an installed instance of the app
     */
    put: function(installedAppId, map, callback) {
        let params = {
            TableName: dynamoTableName,
            Item: {
                appId : installedAppId,
            }
        };
        for (let key in map) {
            if (map.hasOwnProperty(key)) {
                params.Item[key] = map[key];
            }
        }

        docClient.put(params, function(err, data) {
            if (err) {
                log.error(err);
            } else if (callback) {
                callback(data);
            }
        });
    },

    /**
     * Delete the entire map
     */
    delete: function(installedAppId, callback) {
        let params = {
            TableName: dynamoTableName,
            Key: {
                appId: installedAppId
			}
        };

        docClient.delete(params, function(err, data) {
            if (err) {
                log.error(err);
            } else if (callback) {
                callback(data);
            }
        });
    },

    /**
     * Gets the map for a specific installed app instance
     */
    get: function(installedAppId, callback) {
        let params = {
            TableName: dynamoTableName,
            Key: {
                appId: installedAppId
            }
        };

        docClient.get(params, function(err, data) {
            if (err) {
                log.error(err);
            } else if (callback) {
                if (data.Item) {
                    callback(data.Item);
                }
                else {
                    callback({});
                }
            }
        });
    }
};
