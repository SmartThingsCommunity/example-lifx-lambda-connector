'use strict';

const log = require('./lib/local/log');
const configurationLifecycle = require('./lib/lifecycle/configuration');
const oauthLifecycle = require('./lib/lifecycle/oauth');
const crudLifecycle = require('./lib/lifecycle/crud');
const eventLifecycle = require('./lib/lifecycle/event');

exports.handle = (evt, context, callback) => {
    switch (evt.lifecycle) {

        // PING happens during app creation. Respond with challenge to verify app
        case 'PING': {
            log.info(`${evt.lifecycle}\nREQUEST: ${JSON.stringify(evt, null, 2)}`);
            log.response(callback, {statusCode: 200, pingData: {challenge: evt.pingData.challenge}});
            break;
        }

        // CONFIGURATION is once with INITIALIZE and then for each PAGE
        case 'CONFIGURATION': {
            let configurationData = evt.configurationData;
            switch (configurationData.phase) {
                case 'INITIALIZE':
                    log.info(`${evt.lifecycle}/${configurationData.phase}\nREQUEST: ${JSON.stringify(evt, null, 2)}`);
                    configurationLifecycle.initialize(configurationData, callback);
                    break;
                case 'PAGE':
                    log.info(`${evt.lifecycle}/${configurationData.phase}/${configurationData.pageId}\nREQUEST: ${JSON.stringify(evt, null, 2)}`);
                    configurationLifecycle.page(configurationData, callback);
                    break;
                default:
                    throw new Error(`Unsupported config phase: ${configurationData.phase}`);
            }
            break;
        }

        case 'OAUTH_CALLBACK': {
            log.info(`${evt.lifecycle}\nREQUEST: ${JSON.stringify(evt, null, 2)}`);
            log.debug(JSON.stringify(evt));
            oauthLifecycle.handleOauthCallback(evt.oauthCallbackData);
            log.info(`RESPONSE: ${JSON.stringify(evt, null, 2)}`);
            log.response(callback, {statusCode: 200, oAuthCallbackData: {}});
            break;
        }

        case 'INSTALL': {
            log.info(`${evt.lifecycle}\nREQUEST: ${JSON.stringify(evt, null, 2)}`);
            crudLifecycle.install(evt.installData);
            log.info(`RESPONSE: ${JSON.stringify(evt, null, 2)}`);
            log.response(callback, {statusCode: 200, installData: {}});
            break;
        }

        case 'UPDATE': {
            log.info(`${evt.lifecycle}\nREQUEST: ${JSON.stringify(evt, null, 2)}`);
            crudLifecycle.update(evt.updateData);
            log.info(`RESPONSE: ${JSON.stringify(evt, null, 2)}`);
            log.response(callback, {statusCode: 200, updateData: {}});
            break;
        }

        case 'UNINSTALL': {
            log.info(`${evt.lifecycle}\nREQUEST: ${JSON.stringify(evt, null, 2)}`);
            crudLifecycle.uninstall(evt.uninstallData);
            log.info(`RESPONSE: ${JSON.stringify(evt, null, 2)}`);
            log.response(callback, {statusCode: 200, uninstallData: {}});
            break;
        }

        case 'EVENT': {
            log.info(`${evt.lifecycle}\nREQUEST: ${JSON.stringify(evt, null, 2)}`);
            evt.eventData.events.forEach(function(event) {
                switch (event.eventType) {
                    case "DEVICE_EVENT": {
                        break;
                    }
                    case "TIMER_EVENT": {
                        eventLifecycle.handleScheduledEvent(evt.eventData, event);
                        break;
                    }
                    case "DEVICE_COMMANDS_EVENT": {
                        eventLifecycle.handleDeviceCommand(evt.eventData, event);
                        break;
                    }
                    default: {
                        console.warn(`Unhandled event of type ${event.eventType}`)
                    }
                }
            });
            log.response(callback, {statusCode: 200, eventData: {}});
            break;
        }

        default: {
            console.log(`Lifecycle ${evt.lifecycle} not supported`);
        }
    }
}
