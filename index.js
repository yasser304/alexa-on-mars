/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * The Intent Schema, Custom Slots, and Sample Utterances for this skill, as well as
 * testing instructions are located at http://amzn.to/1LzFrj6
 *
 * For additional samples, visit the Alexa Skills Kit Getting Started guide at
 * http://amzn.to/1LGWsLG
 */

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.

var http = require('http');
var weatherStr = '';

exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
        if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.[unique-value-here]") {
             context.fail("Invalid Application ID");
        }
        */

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
        ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
        ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    if ("VisibilityIntent" === intentName) {
        getWeatherInfo(intent, session, callback);
    } else if ("TempratureIntent" === intentName) {
        getWeatherInfo(intent, session, callback);
    } else if ("CuriosityIntent" === intentName) {
        getCuriositySounds(intent, session, callback);
    } else if ("SpaceSuitIntent" === intentName) {
        getWeatherInfo(intent, session, callback);
    } else if ("SafeIntent" === intentName) {
        getWeatherInfo(intent, session, callback);
    } else if ("AMAZON.HelpIntent" === intentName) {
        getWelcomeResponse(callback);
    } else if ("AMAZON.StopIntent" === intentName || "AMAZON.CancelIntent" === intentName) {
        handleSessionEndRequest(callback);
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
        ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput =  'Hello Mars explorer. How can I help you ?'
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "Please tell me what I can help you with. You can try, Whats the weather like on Mars today";
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleSessionEndRequest(callback) {
    var cardTitle = "Session Ended";
    var speechOutput = "Thank you for using the Alexa Mars companion. Have a nice day exploring Mars!";
    // Setting this to true ends the session and exits the skill.
    var shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}

/**
 * Functions that get the data from the API
 */

var options = {
  host: 'marsweather.ingenology.com',
  port: 80,
  path: '/v1/latest/',
  method: 'GET'
};

var useResponse = function(response, callback, intent, sessionAttributes, shouldEndSession) {
    var str = '';
    var speechOutput = '';
    var repromptText = '';
    response.on('data', function (chunk) {
        str += chunk;
    });
  
  console.log(intent);
     response.on('end', function () {
        var obj = JSON.parse(str);
    
    if ("VisibilityIntent" === intent.name) {
        speechOutput = "Curiosity tells me the weather for today, Mars sol date, "+ obj.report['sol'] +", will be "+ obj.report['atmo_opacity']
                    + ". The maximum temperature will be "+obj.report['max_temp'] +" degree celsius. While the minimum will go as low as "
                    + obj.report['min_temp'] + " degree celsius";
        repromptText = "You can ask me the weather by saying, what's the weather like on Mars today?";
     } else if ( "TempratureIntent" === intent.name) {
         speechOutput = "Curiosity tells me it will get to a maximum of "+obj.report['max_temp'] +" degree celsius and the minimum will go as low as "
                    + obj.report['min_temp'] + " degree celsius";
        repromptText = "You can ask me the temprature on Mars by saying, what's the temprature like on out there today?";
     } else if ( "SpaceSuitIntent" === intent.name) {
         speechOutput = "<speak>"
                        + "Hmm...let me do some complex calculations and get back to you <break time='3s'/>. "
                        + "Alright, according to the pressure, humidity and temprature data from curiosity <break time='1s'/>"
                        + "I would recommend your take the <say-as interpret-as='characters'>PXS</say-as> suit. But hey... you're the boss!"
                        +"</speak>";
        repromptText = "You can ask me spacesuit recommendations by saying, what spacesuit should I take?";
     } else if ( "SafeIntent" === intent.name) {
         var avgTemp = (obj.report['min_temp'] + obj.report['max_temp']) / 2;
         speechOutput = avgTemp < -55 ? "Its bad out there. I wouldnt recommend going exploring right now" : "Its a great day out there! Go forth and explore";
         repromptText = "You can ask me spacesuit recommendations by saying, what spacesuit should I take?";
     } 
     else {
         speechOutput = "You can ask me the temprature on Mars by saying, what's the temprature like on out there today?";
     }

    var callbackOption = "SpaceSuitIntent" === intent.name ? buildSoundletResponse(intent.name, speechOutput, repromptText, shouldEndSession) : buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession);
    callback(sessionAttributes, callbackOption);
  });
};

function getWeatherInfo(intent, session, callback) {
    var sessionAttributes = {};
    var shouldEndSession = false;

    var req = http.request(options, function(response){
        useResponse(response, callback, intent, sessionAttributes, shouldEndSession);
    });

    req.end();
}

function getCuriositySounds(intent, session, callback){
    var sessionAttributes = {};
    var speechOutput = "<speak>Welcome to the Curiosity Lounge. Get ready for some sweet tunes <break time= '2s'/>"
                + "<audio src='https://s3.amazonaws.com/soundofcuriosity/alexa_sound_of_curiosity.mp3'/>"
                + "</speak>";
    var shouldEndSession = false;
    var repromptText = null;
    callback(sessionAttributes,
         buildSoundletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
}

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: "SessionSpeechlet - " + title,
            content: "SessionSpeechlet - " + output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSoundletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech : {
            ssml: output,
            type: "SSML"
        },
        card: {
            type: "Simple",
            title: "SessionSpeechlet - " + title,
            content: "SessionSpeechlet - " + output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}