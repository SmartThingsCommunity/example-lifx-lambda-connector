# SmartThings LIFX C2C Lambda Connector

This project is an example AWS Lambda C2C device connector app that uses the SmartThings API to import LIFX bulbs
into your SmartThings account. It's written in NodeJS and uses [DynamoDB](https://aws.amazon.com/dynamodb/) 
for storing LIFX API credentials.


## Folder structure

- config
  - default.json -- Keys, IDs, and other instance specific configuration values
- lib
    - api
        - lifx.js -- Methods for communicating to LIFX required by this app
        - st.js -- Prototype framework to abstract away some endpoint app implementation details, not specific to this app
    - lifecycle
        - configuration.js -- CONFIGURATION lifecycle event handling
        - crud.js -- INSTALL, UPDATE, and UNINSTALL lifecycle event handling
        - event.js -- EVENT lifecycle handling
        - oauth.js -- OAUTH lifecycle handling
    - local
        - db.js -- Simple DynamoDB-based store of state data for this application
        - log.js -- Simple wrapper around console.log, not specific to this app
- package.json -- Node package file
- server.js -- This application

## Prerequisites

- An [Amazon AWS account](https://portal.aws.amazon.com/billing/signup#/start)
- The [AWS command line tools](https://aws.amazon.com/cli/)
- The [Apex](http://apex.run/) Lambda deployment tool
- A [Samsung ID and SmartThings](https://account.smartthings.com/login) account
- A [SmartThings Developer Workspace](https://devworkspace.developer.samsung.com/smartthingsconsole/iotweb/site/index.html#/home) account
- At least one [LIFX light bulb](https://www.lifx.com/products/lifx) and the LIFX Mobile app (to install the light)
- Either a LIFX _clientId_ and _clientSecret_ (from LIFX) or a [LIFX personal API Token](https://cloud.lifx.com/) (You can generate the personal
API token during the connector installation process)

## Setup instructions

1. Clone this repository and cd into the resulting directory.

2. If you have a LIFX clientId and clientSecret copy them into the appropriate fields in `config/default.json`. If 
you don't then skip to the next step (Note that LIFX does not allow the general public to register apps and get 
client IDs and secrets. You need to contact them for that)

3. From within the repository directory run `apex init` and fill answer the resulting prompts. The project name you choose will determine the 
name of your lambda function and is used in some of the following steps. This command will create a demo directory in `functions/hello` which 
you can remove as it is not used in this example. The _connector_ directory in the GitHub repo contains the code for this example.

4. CD into `functions/connector` and install the dependencies with `npm install`.

5. CD back to the root repository directory and run `apex deploy` to create your lambda function and the required user policy.

6. Run the following command, substituting your project name for `<your-project-name>`, to give SmartThings permission to run your Lambda:<br/>
`aws lambda add-permission --function-name <your-project-name>_lambda_function --statement-id smartthings --principal 906037444270 --action lambda:InvokeFunction`

7. Run the following command, substituting your project name for `<your-project-name>`, to create a DynamoDB table for storing tokens:<br/>
`aws dynamodb create-table --table-name CloudConnectors --attribute-definitions 'AttributeName=appId,AttributeType=S' --key-schema 'AttributeName=appId,KeyType=HASH' --provisioned-throughput '{"ReadCapacityUnits": 5, "WriteCapacityUnits": 5}'`

8. Run the following command, substituting your project name for `<your-project-name>`, to give your Lambda permission to access the DynamoDB table:<br/>
`aws iam attach-role-policy --role-name <project-name>_lambda_function --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess`

9. Log into the SmartThings [Developer Workspace](https://devworkspace.developer.samsung.com/) and go to the 
[Cloud-To-Cloud](https://devworkspace.developer.samsung.com/smartthingsconsole/iotweb/site/index.html#/development/smartThingsDevice/cloudToCloud)
devices page. Click _Create_ to start the process of creating a device profile and connector app. These steps assume you have a full color LIFX bulb
to test with. The example also has places to insert device profile IDs for color temperature and white bulbs if you have them.

    01. Enter and save a Service name such as "My LIFX Connector"
    02. Click _Add a device profile_ to create a device profile for your light. Give the device a name 
    such as "LIFX Color Bulb" a VID such as "lifx-color-bulb" and an optional description. Set the _Device type_ to _Light_.
    Click the plus (+) sign to add capabilities and select the _Color Control_, _Color Temperature_, _Switch_ and _Switch Level_
    capabilities and click _ADD_. Finally scroll down and select _Switch: main_ for _main state_ and _Main action_ and click _Save_
    to create the device profile. Then click _Next_.
    03. Enter a connector name and description. You can leave _Multi instance_ set to _Single and should set the
    _Connector type_ to _AWS Lambda_. 
    04. Paste the Lambda ARN into the _Target URL_ page and click _SAVE AND NEXT_. 
    05. Click _Settings_ to define API scopes. Select the _l:devices_, _i:deviceprofiles_ and _w:schedules_ scopes and click _Set_.
    06. Enter a name you will recognize under _Model code_ and click _NEXT_ and then _CLOSE_.
    07. Click on your entry in the list and select the _Device info._ tab and paste the _Device profile ID_ field into
    the `config/default.json` file in the `"deviceProfiles": {"color": ""}` entry.
    
10. On the _Devices_ page of the SmartThings mobile app tap _ADD DEVICES_, tap _ADD DEVICE MANUALLY_ and then select your device from 
_My Testing Devices_ at the bottom of the page (you can also install the devices in the ST Classic app from Marketplace -> SmartApps -> My Apps). 

11. If you have configured your Lambda for OAuth with _clientId_ and _clientSecret_ from LIFX, you will be prompted to connect to the LIFX
site to import your devices into SmartThings. In this case the LIFX access token is stored for use by your app without you seeing
it via the standard OAuth process. If your server isn't configured for OAuth (i.e. _clientId_ and _clientSecret_ are not set) then you will be
prompted to manually enter a personal access token. You can get such a token by tapping the _Get a LIFX Personal Access Token >>_ link 
at the bottom of the page, logging into LIFX, tapping the _Generate New Token_ button, and copying the token to the clipboard (LIFX won't show
it to you again). Then tap _Done_ and paste the token into the _Enter your LIFX API token_ field. 

12. Whichever method you use to get a token, tap _NEXT_ to go to the next configuration page and tap _Select location_ to select which 
LIFX location you want to import into this SmartThings location. Tap _DONE_ to install the connector app and create the devices.
