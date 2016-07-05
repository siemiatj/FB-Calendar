/*
* 2013 Jakub Siemiatkowski
* @sasklacz
* jsiemiatkowski at gmail.com
*
*/
import './app.scss';
import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import Timeline from './components/Timeline.es6';

render(
  <Timeline />,
  document.getElementById('timeline')
);


(function(){
    /*
    * Array storing events to be rendered in the calendar
    */
    var EVENTS_TO_RENDER = [];

    /*
    * Object storing events as keys, and array of their overlapping events as values
    */
    var EVENTS_OVERLAPPING = {};

    /*
    * Object storing events with position and width already set
    */
    var EVENTS_READY = {};

    /*
    * Template of a single event in the calendar
    */
    var EVENT_TEMPLATE = [
        '<div class="event" style="top: {{top}}px; left: {{left}}px; height: {{height}}px; width: {{width}}px">',
            '<div class="bar"></div>',
            '<div class="content" style="width: {{contentWidth}}px">',
                '<div class="inner-content">',
                    '<span class="event-title">Sample Item</span>',
                    '<span class="event-location">Sample Location</span>',
                '</div>',
            '</div>',
        '</div>'
    ].join('');

    /*
    * ID selector for the calendar DOM element where events are to be added
    */
    var CALENDAR_SELECTOR = 'scheduler';

    /*
    * Function for sorting array of event objects by their start and position paremeters. Added to prototype
    * for better readability
    */
    Array.prototype.sortArray = function () {
        this.sort(function(a, b) {
            if (a.start > b.start){
                return 1;
            } else if (a.start < b.start){
                return -1;
            } else {
                if (a.position > b.position){
                    return 1;
                } else if (a.position < b.position){
                    return -1;
                }
                return 0;
            }
        });
    };

    /*
    * Fill string template with data using simple regexes
    */
    var fillTemplate = function (data) {
        var _template = EVENT_TEMPLATE,
            key, regex;

        for (key in data) {
            regex     = new RegExp('{{' + key + '}}', 'ig');
            _template = (_template).replace(regex, data[key]);
        }

        return _template;
    };

    /*
    * Check all events against themselves if they're start/end values overlap.
    */
    var getEventsOverlapping = function(){
        var currentStart,
            currentEnd,
            objectKey,
            overlappingEvent;

        for (var i=0, l=EVENTS_TO_RENDER.length; i<l; i+=1){
            currentStart = EVENTS_TO_RENDER[i].start;
            currentEnd   = EVENTS_TO_RENDER[i].end;
            objectKey    = currentStart+'*'+currentEnd+'*'+EVENTS_TO_RENDER[i].position;

            EVENTS_OVERLAPPING[objectKey] = {items: {}, length: 0};

            for (var j=0; j<l; j+=1){
                if (j !== i){
                    overlappingEvent = EVENTS_TO_RENDER[j];
                    if ((overlappingEvent.start < currentStart && overlappingEvent.end > currentStart) ||
                        (overlappingEvent.start > currentStart && overlappingEvent.start < currentEnd) ||
                        overlappingEvent.start === currentStart && overlappingEvent.end > currentStart){
                        EVENTS_OVERLAPPING[objectKey].items[overlappingEvent.start+'*'+overlappingEvent.end+'*'+
                            overlappingEvent.position]       = 1;
                        EVENTS_OVERLAPPING[objectKey].length += 1;
                    }
                }
            }

            if (!overlappingEvent){
                EVENTS_OVERLAPPING[objectKey] = null;
            }
        }
    };

    /*
    * This function performs few operations. It accepts object with overlapping events of event to be rendered (let's call it E).
    * First of all it checks if E has any overlapping events. If not - then we know that it can take the full available width
    * and will be positioned at x=0. If there are overlapping events we check if they overlap with each other, because if they don't
    * then one event from each pair doesn't influence the width of E, but still it's x position can be influenced (e2) :

    ********
    *  e1  *  *******
    ********  *  E  *
    ********  *******
    *  e2  *
    ********

    * Finally we find the x position of E using the positions of events that were already positioned.
    */
    var checkCollidingOverlapping = function (overlapObject, eventKey){
        var width                   = null,
            left                    = 0,
            startingLefts           = {},
            overlappingEventsAmount = overlapObject.length,
            collidingEvents         = {},
            collidingEventsPairs    = 0,
            overlappingIEvents,
            overlapReadyIEvent;

        if (overlapObject){
            for(var i in overlapObject.items){
                //added for jshint
                if (overlapObject.items.hasOwnProperty(i)){
                    overlapReadyIEvent = EVENTS_READY[i];
                    overlappingIEvents = EVENTS_OVERLAPPING[i].items;

                    for (var m in overlapObject.items){
                        if (overlapObject.items.hasOwnProperty(m) && collidingEvents[m] !== i &&
                            collidingEvents[i] !== m && !overlappingIEvents[m] && m !== i &&
                            m !== eventKey && i !== eventKey){
                            collidingEvents[i]   = m;
                            collidingEvents[m]   = i;
                            collidingEventsPairs += 1;
                        }
                    }
                    if (overlapReadyIEvent){
                        startingLefts[overlapReadyIEvent.left] = 1;
                        //overlapping events should have the same width so we can use the value of an already
                        //rendered event
                        width = overlapReadyIEvent.width;
                    }
                }
            }

            overlappingEventsAmount -= collidingEventsPairs;
            if (!width){
                width = 600 / (overlappingEventsAmount + 1);
            }

            for (var k in startingLefts){
                if (startingLefts[left]){
                    left += width;
                }
            }
        } else {
            width = 600;
        }

        return {
            width: width,
            left : left
        };
    };

    /*
    * Function that adds additional properties to events in `EVENTS_TO_RENDER` array, so that they can be
    * positioned properly in the calendar. Events with calculated position are added to `EVENTS_READY` object.
    */
    var prepareRenderData = function(){
        var currentEvent,
            overlappingEvents,
            eventKey,
            width,
            left;

        EVENTS_READY = {};
        EVENTS_TO_RENDER.sortArray();

        for (var i=0, l=EVENTS_TO_RENDER.length; i<l; i+=1){
            currentEvent      = EVENTS_TO_RENDER[i];
            eventKey          = currentEvent.start+'*'+currentEvent.end+'*'+currentEvent.position;
            overlappingEvents = checkCollidingOverlapping(EVENTS_OVERLAPPING[eventKey], eventKey);

            width = overlappingEvents.width;
            left  = overlappingEvents.left;

            currentEvent.top          = currentEvent.start;
            currentEvent.width        = width;
            currentEvent.left         = left;
            currentEvent.height       = currentEvent.end - currentEvent.start;
            currentEvent.contentWidth = currentEvent.width - 4;

            EVENTS_READY[eventKey]    = {
                left: left,
                width : width
            };
        }
    };

    /*
    * Function generating HTML for the calendar DOM element using a predefined template. I've chosen template
    * in place of DOM elements, as for each event I'm setting values for 2 elements and even when a DOM Fragment
    * was used it would still be slower and more tedious in my oppinion.
    */
    var renderEvents = function () {
        var calendarElement = document.getElementById(CALENDAR_SELECTOR),
            renderHTML      = '';

        for (var i=0, l=EVENTS_TO_RENDER.length; i<l; i+=1){
            renderHTML += fillTemplate(EVENTS_TO_RENDER[i]);
        }
        calendarElement.innerHTML = renderHTML;
    };

    /*
    * Function responsible for adding new events to `EVENTS_TO_RENDER` array. Also checks validity of input data.
    */
    var addEvents = function (events) {
        var modifiedEvents = 0,
            //in modern browsers caching prototype chain like this doesn't help but in older IE's it still does
            cachedToString = Object.prototype.toString,
            eventsData,
            eventEnd,
            eventStart;

        //today is tuesday so I choose this method of testing Array/Object
        if (cachedToString.call(events) === "[object Array]"){
            eventsData = events;
        } else if (cachedToString.call(events) === "[object Object]"){
            eventsData = [];
            eventsData.push(events);
        } else {
            throw 'Wrong data type';
        }

        for (var i=0, l=eventsData.length; i<l; i+=1){
            eventStart = eventsData[i].start;
            eventEnd   = eventsData[i].end;

            //check if event object has the required properties. I'm skipping test for numerical value.
            if (eventStart != null && eventEnd != null && eventStart < eventEnd &&
                eventStart >= 0 && eventEnd <= 720){

                //creating new object in case the original had any additional properties
                EVENTS_TO_RENDER.push({
                    start : eventStart,
                    end   : eventEnd,
                    position : EVENTS_TO_RENDER.length
                });
                modifiedEvents = 1;
            }
        }

        //we don't want to refresh the DOM if nothing changed
        if (modifiedEvents){
            getEventsOverlapping();
            prepareRenderData();
            renderEvents();

            return true;
        }
        //return value tells us if the view was refreshed
        return false;
    };

    //we need this function in the global scope
    window.addEvents = addEvents;
})();

//as required in the doc
window.layOutDay = function (events) {
    return addEvents(events);
};
