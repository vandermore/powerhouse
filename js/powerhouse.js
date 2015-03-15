/*==============================================================================
 * powerhouse.js
 *
 * PowerHouse Javascript
 *
 * Author: Kyle W T Sherman
 *
 * Time-stamp: <2014-08-24 21:18:34 (kyle)>
 *============================================================================*/

var debug = false;
var version = '0.9.27';
var releaseDate = '2014-08-23';
var buildVersion = 10;

var siteName = 'PowerHouse';
var siteUrl = 'http://powerhouse.nullware.com/';
var buildUrl = siteUrl + 'index.html';
var mouseX = 0;
var mouseY = 0;
var clickableClasses = [];
clickableClasses[0] = 'selection';
clickableClasses[1] = 'link';

var analyticsPrefCatagory = 'Preference';
var analyticsSetCatagory = 'Set';
var analyticsBuildCatagory = 'Build';

// cookie variables with default values
var cookieExpireDays = 365;
var forumExportType = 'co';
var prefFontFamilyList = ['Andale Mono', 'Arial', 'Comic Sans MS', 'Courier New', 'Garuda', 'Georgia', 'Helvetica', 'Lexia', 'Lucida Sans', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'sans-serif'];
var prefFontFamily = 'Lexia';
var prefFontSize = 100;
var prefPopupTipsList = ['Off', 'When Selecting', 'On'];
var prefPopupTips = parseInt( 2 );
var prefConfirmSelections = false;
var prefAnalytics = true;

// escape quotes
function escapeQuotes( str ) {
	return (str + '').replace( /[\\"']/g, '\\$&' ).replace( /\u0000/g, '\\0' );
}

// set and get cookies
function setCookie( name, value, expireDays ) {
	var expireDate = new Date();
	expireDate.setDate( expireDate.getDate() + expireDays );
	var cookieValue = escape( value ) + ((expireDays == null) ? '' : '; expires=' + expireDate.toUTCString());
	document.cookie = name + '=' + cookieValue;
}

window.setCookie = setCookie;

function getCookie( name ) {
	var cookies = document.cookie.split( ';' );
	for ( var i = 0; i < cookies.length; i++ ) {
		var x = cookies[i].substr( 0, cookies[i].indexOf( '=' ) );
		var y = cookies[i].substr( cookies[i].indexOf( '=' ) + 1 );
		x = x.replace( /^\s+|\s+$/g, '' );
		if ( x == name ) {
			return unescape( y );
		}
	}
	return undefined;
}

window.getCookie = getCookie;

// encode number to url code
// valid number range is 0-61 (invalid numbers default to 0)
function numToUrlCode( num ) {
	var charCode = 0;
	if ( num >= 0 && num <= 9 ) {
		charCode = num + 48;
	} else if ( num >= 10 && num <= 35 ) {
		charCode = num + 55;
	} else if ( num >= 36 && num <= 61 ) {
		charCode = num + 61;
	} else {
		throw 'numToUrlCode: num is out of valid range: ' + num;
	}
	return String.fromCharCode( charCode );
}
window.numToUrlCode = numToUrlCode;
// encode number to two digit url code
// valid number range is 0-3721 (invalid numbers default to 0)
function numToUrlCode2( num ) {
	return numToUrlCode( Math.floor( num / 61 ) ) + numToUrlCode( num % 61 );
}
window.numToUrlCode2 = numToUrlCode2;
// encode number to four digit url code
// valid number range is 0-13845841 (invalid numbers default to 0)
function numToUrlCode4( num ) {
	var result = '';
	var tmp = num;
	for ( var i = 3; i >= 0; i-- ) {
		result += numToUrlCode( Math.floor( tmp / Math.pow( 61, i ) ) );
		tmp = tmp % Math.pow( 61, i );
	}
	return result;
}
window.numToUrlCode4 = numToUrlCode4;

// decode url code to number
// invalid codes default to 0
function urlCodeToNum( code ) {
	var num = 0;
	var charCode = code.charCodeAt( 0 );
	if ( charCode >= 48 && charCode <= 57 ) {
		num = charCode - 48;
	} else if ( charCode >= 65 && charCode <= 90 ) {
		num = charCode - 55;
	} else if ( charCode >= 97 && charCode <= 122 ) {
		num = charCode - 61;
	} else {
		throw 'urlCodeToNum: code is out of valid range: ' + code + ' (' + charCode + ')';
	}
	return num;
}
window.urlCodeToNum = urlCodeToNum;
// decode two character url code to number
// invalid codes default to 0
function urlCodeToNum2( code ) {
	return urlCodeToNum( code[0] ) * 61 + urlCodeToNum( code[1] );
}
window.urlCodeToNum2 = urlCodeToNum2;
// decode four character url code to number
// invalid codes default to 0
function urlCodeToNum4( code ) {
	return urlCodeToNum( code[0] ) * 226981 + urlCodeToNum( code[1] ) * 3721 + urlCodeToNum( code[2] ) * 61 + urlCodeToNum( code[3] );
}
window.urlCodeToNum4 = urlCodeToNum4;

// submit google analytics
function submitAnalytics( catagory, action, label, value ) {
	if ( prefAnalytics ) {
		if ( debug ) {
			console.log( ['_trackEvent', catagory, action, label, value] );
		} else {
			_gaq.push( ['_trackEvent', catagory, action, label, value] );
		}
	}
}
window.submitAnalytics = submitAnalytics;
// queue google analytics for background submission
var analyticsTimeout = 2000;
var analyticsQueue = [];
var analyticsQueueServiceRunning = false;
function queueAnalytics( catagory, action, label, value ) {
	if ( prefAnalytics ) {
		analyticsQueue.push( [catagory, action, label, value] );
		// start google analytics queue submission service
		if ( !analyticsQueueServiceRunning ) {
			analyticsQueueService();
		}
	}
}
window.queueAnalytics = queueAnalytics;
// pop submissions off of queue and submit them
function analyticsQueueService() {
	if ( analyticsQueue.length > 0 ) {
		analyticsQueueServiceRunning = true;
		var event = analyticsQueue.shift();
		submitAnalytics( event[0], event[1], event[2], event[3] );
		setTimeout( analyticsQueueService, analyticsTimeout );
	} else {
		analyticsQueueServiceRunning = false;
	}
}
window.analyticsQueueService = analyticsQueueService;

// get data sets (from powerhouse-data.js)
var dataSuperStat = getDataSuperStat();
var dataInnateTalent = getDataInnateTalent();
var dataTalent = getDataTalent();
var dataTravelPower = getDataTravelPower();
var dataPowerSet = getDataPowerSet();
var dataFramework = getDataFramework();
var dataPower = getDataPower();
var dataEnergyUnlockPower = getDataEnergyUnlockPower();
var dataArchetypeGroup = getDataArchetypeGroup();
var dataArchetype = getDataArchetype();
var dataSpecializationTree = getDataSpecializationTree();
var dataVersionUpdate = getDataVersionUpdate();

// power code lookup
var dataPowerIdFromCode = [];
for ( var i = 0; i < dataPower.length; i++ ) {
	dataPowerIdFromCode[dataPower[i].code()] = parseInt( i );
}

// power set lookup
var dataPowerIdFromPowerSet = [];
for ( var i = 0; i < dataPower.length; i++ ) {
	var powerSet = dataPower[i].powerSet;
	if ( powerSet != null ) {
		if ( dataPowerIdFromPowerSet[powerSet] == undefined ) {
			dataPowerIdFromPowerSet[powerSet] = [];
		}
		dataPowerIdFromPowerSet[powerSet].push( parseInt( i ) );
	}
}

// power framework lookup
var dataPowerIdFromFramework = [];
for ( var i = 0; i < dataPower.length; i++ ) {
	var framework = dataPower[i].framework;
	if ( framework != null ) {
		if ( dataPowerIdFromFramework[framework] == undefined ) {
			dataPowerIdFromFramework[framework] = [];
		}
		dataPowerIdFromFramework[framework].push( parseInt( i ) );
	}
}

// current power house character info
//TODO:: This is a bunch of initialization stuff.
var phVersion = buildVersion;
var phName = '';
var phArchetype = dataArchetype[1];
var phSuperStat = [];
for ( var i = 1; i <= 3; i++ ) {
	phSuperStat[i] = dataSuperStat[0];
}
var phInnateTalent = Array();
for ( var i = 1; i <= 1; i++ ) {
	phInnateTalent[i] = dataInnateTalent[0];
}
var phTalent = [];
for ( var i = 1; i <= 6; i++ ) {
	phTalent[i] = dataTalent[0];
}
var phTravelPower = [];
for ( var i = 1; i <= 2; i++ ) {
	phTravelPower[i] = dataTravelPower[0];
}
var phTravelPowerAdvantage = [];
for ( var i = 1; i <= 2; i++ ) {
	phTravelPowerAdvantage[i] = 0;
}
var phPower = [];
for ( var i = 1; i <= 14; i++ ) {
	phPower[i] = dataPower[0];
}
var phPowerAdvantage = [];
for ( var i = 1; i <= 14; i++ ) {
	phPowerAdvantage[i] = 0;
}
var phSpecializationTree = [];
for ( var i = 1; i <= 4; i++ ) {
	phSpecializationTree[i] = dataSpecializationTree[0];
}
var phSpecialization = [];
for ( var i = 1; i <= 4; i++ ) {
	phSpecialization[i] = 0;
}
var phBuildLink = '';

var statFrameworkCount = [];
for ( var i = 1; i <= dataFramework.length; i++ ) {
	statFrameworkCount[i] = 0;
}
var statPowerSetCount = [];
for ( var i = 0; i < dataPowerSet.length; i++ ) {
	statPowerSetCount[i] = 0;
}

var statAdvantagePoints = 0;
var maxAdvantagePointsTotal = 36;
var maxAdvantagePointsPerPower = 5;
var selectedNum = 0;
var selectedFieldId = null;
var selectedFieldClass = null;
var prevSelectedFramework = 0;
var prevSelectedSpecializationSuperStat = 0;


// event functions
function catchEvent( eventObj, event, eventHandler ) {
	if ( eventObj.addEventListener ) {
		eventObj.addEventListener( event, eventHandler, false );
	} else if ( eventObj.attachEvent ) {
		event = 'on' + event;
		eventObj.attachEvent( event, eventHandler );
	}
}
window.catchEvent = catchEvent;
function setupEvents( evnt ) {
	// disable enter key in forms
	catchEvent( document, 'keypress', noEnter );
	// mouseX and mouseY
	catchEvent( document, 'mousemove', setMouseXY );
	// change name
	catchEvent( document.getElementById( 'editName' ), 'change', changeName );
	// close popups when main document is clicked, but not when the popup divs are clicked
	catchEvent( document, 'mouseup', selectClearMaybe );
}
window.setupEvents = setupEvents;
catchEvent( window, 'load', setupEvents );

// disable enter key (used in form fields)
function noEnter( evnt ) {
	//return !(window.event && window.event.keyCode == 13);
	var evnt = (evnt) ? evnt : ((event) ? event : null);
	var node = (evnt.target) ? evnt.target : ((evnt.srcElement) ? evnt.srcElement : null);
	if ( (evnt.keyCode == 13) && (node.type == 'text') ) {
		changeName();
	}
}
window.noEnter = noEnter;
// document.onkeypress = noEnter;

// set mouseX and mouseY globals
function setMouseXY( evnt ) {
	var x, y;
	try {
		x = evnt.pageX;
		y = evnt.pageY;
	} // firefox
	catch ( e ) {
		x = event.x;
		y = event.y;
	} // internet explorer
	mouseX = x;
	mouseY = y;
}
window.setMouseXY = setMouseXY;

// popup (tool tip)
function popup( text ) {
	var x = mouseX;
	var y = mouseY;
	var xoffset = 20;
	var yoffset = 10;
	var margin = 20;
	var tip = document.getElementById( 'popup' );
	var width = (document.documentElement.clientWidth || document.body.clientWidth || document.body.scrollWidth);
	var height = (window.scrollY || document.documentElement.scrollTop || document.body.scrollTop) + (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || document.body.scrollHeight);
	tip.innerHTML = text;
	tip.style.display = 'block';
	x += xoffset;
	y += yoffset;
	if ( x > width - tip.offsetWidth - margin ) {
		x = width - tip.offsetWidth - margin;
	}
	if ( x < 0 ) {
		x = 0;
	}
	if ( y > height - tip.offsetHeight - margin ) {
		y = height - tip.offsetHeight - margin;
	}
	if ( y < 0 ) {
		y = 0;
	}
	if ( x < mouseX ) {
		var nx = mouseX - xoffset - tip.offsetWidth;
		if ( nx < margin ) {
			nx = margin;
		}
		if ( nx + tip.offsetWidth - mouseX < mouseX - x ) {
			x = nx;
		}
	}
	if ( y < mouseY ) {
		var ny = mouseY - yoffset - tip.offsetHeight;
		if ( ny < margin ) {
			ny = margin;
		}
		if ( ny + tip.offsetHeight - mouseY < mouseY - y ) {
			y = ny;
		}
	}
	tip.style.left = x + 'px';
	tip.style.top = y + 'px';
}
window.popup = popup;
function popupL1( text ) {
	if ( prefPopupTips >= 1 ) {
		popup( text );
	}
}
window.popupL1 = popupL1;
function popupL2( text ) {
	if ( prefPopupTips >= 2 ) {
		popup( text );
	}
}
window.popupL2 = popupL2;
function popout() {
	var tip = document.getElementById( 'popup' );
	tip.style.display = 'none';
}
window.popout = popout;
// function delayedPopup(text) {
//     return function() {
//         var field = this;
//         var delay = setTimeout(popup(text), 1000);
//         field.onmouseout = function() {
//             clearTimeout(delay);
//             popout();
//         };
//     }
// }
// window.delayedPopup = delayedPopup;
function setOnmouseoverPopupL1( field, text ) {
	if ( text != null ) {
		field.setAttribute( 'onmouseover', 'popupL1(\'' + text + '\')' );
		field.setAttribute( 'onmouseout', 'popout()' );
	} else {
		clearOnmouseoverPopup( field );
	}
}
window.setOnmouseoverPopupL1 = setOnmouseoverPopupL1;
function setOnmouseoverPopupL2( field, text ) {
	if ( text != null ) {
		field.setAttribute( 'onmouseover', 'popupL2(\'' + text + '\')' );
		field.setAttribute( 'onmouseout', 'popout()' );
	} else {
		clearOnmouseoverPopup( field );
	}
}
window.setOnmouseoverPopupL2 = setOnmouseoverPopupL2;
function clearOnmouseoverPopup( field ) {
	field.removeAttribute( 'onmouseover' );
	field.removeAttribute( 'onmouseout' );
}
window.clearOnmouseoverPopup = clearOnmouseoverPopup;

// hide/show section
function hideSection( id ) {
	document.getElementById( id ).style.display = 'none';
}
window.hideSection = hideSection;
function showSection( id ) {
	document.getElementById( id ).style.display = '';
}
window.showSection = showSection;

// show and position section
// if right is true, then orientation is to the right
// if right is false, then orientation is to the left
function showPositionSection( id, right ) {
	var section = document.getElementById( id );
	var margin = 50;
	var x = mouseX;
	var y = mouseY;
	var xoffset = ((right) ? 20 : -20);
	var yoffset = 10;
	var width = (document.documentElement.clientWidth || document.body.clientWidth || document.body.scrollWidth);
	var height = (window.scrollY || document.documentElement.scrollTop || document.body.scrollTop) + (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || document.body.scrollHeight);
	showSection( section.id );
	x += xoffset;
	y += yoffset;
	if ( !right ) {
		x = x - section.offsetWidth;
	}
	if ( x > width - section.offsetWidth - margin ) {
		x = width - section.offsetWidth - margin;
	}
	if ( y > height - section.offsetHeight - margin ) {
		y = height - section.offsetHeight - margin;
	}
	if ( x < 0 ) {
		x = 0;
	}
	if ( y < 0 ) {
		y = 0;
	}
	section.style.left = x + 'px';
	section.style.top = y + 'px';
}
window.showPositionSection = showPositionSection;

// update section position
function updatePositionSection( id ) {
	var section = document.getElementById( id );
	var margin = 50;
	var x = section.style.left.substring( 0, section.style.left.length - 2 );
	var y = section.style.top.substring( 0, section.style.top.length - 2 );
	var width = (document.documentElement.clientWidth || document.body.clientWidth || document.body.scrollWidth);
	var height = (window.scrollY || document.documentElement.scrollTop || document.body.scrollTop) + (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || document.body.scrollHeight);
	if ( x > width - section.offsetWidth - margin ) {
		x = width - section.offsetWidth - margin;
	}
	if ( y > height - section.offsetHeight - margin ) {
		y = height - section.offsetHeight - margin;
	}
	if ( x < 0 ) {
		x = 0;
	}
	if ( y < 0 ) {
		y = 0;
	}
	section.style.left = x + 'px';
	section.style.top = y + 'px';
}
window.updatePositionSection = updatePositionSection;

// name functions
function editName() {
	var field = document.getElementById( 'editName' );
	field.value = phName;
	hideSection( 'sectionDisplayName' );
	showSection( 'sectionEditName' );
	field.focus();
}
window.editName = editName;
function cancelName() {
	hideSection( 'sectionEditName' );
	showSection( 'sectionDisplayName' );
}
window.cancelName = cancelName;
function changeName( evnt ) {
	//var evnt = evnt ? evnt : window.event;
	//var target = evnt.target ? evnt.target : evnt.srcElement;
	phName = document.getElementById( 'editName' ).value;
	hideSection( 'sectionEditName' );
	document.getElementById( 'fieldName' ).firstChild.data = phName;
	showSection( 'sectionDisplayName' );
	changeUpdate();
	//submitAnalytics(analyticsSetCatagory, 'Name', phName);
}
window.changeName = changeName;
// enter key also changes name
// function changeNameEnter() {
//     var test = (window.event && window.event.keyCode == 13);
//     if (test) changeName(window.event);
//     return !test;
// }

// clear selections
function selectClear() {
	if ( selectedFieldId && selectedFieldClass ) {
		var field = document.getElementById( selectedFieldId );
		field.setAttribute( 'class', selectedFieldClass );
	}
	selectedNum = 0;
	selectedFieldId = null;
	selectedFieldClass = null;
	selectClearHideSections();
	changeUpdate();
}
window.selectClear = selectClear;
function selectClearHideSections() {
	hideSection( 'selectionSuperStat' );
	hideSection( 'selectionInnateTalent' );
	hideSection( 'selectionTalent' );
	hideSection( 'selectionTravelPower' );
	hideSection( 'selectionTravelPowerAdvantage' );
	hideSection( 'selectionPower' );
	hideSection( 'selectionPowerAdvantage' );
	hideSection( 'selectionArchetype' );
	hideSection( 'selectionArchetypePower' );
	hideSection( 'selectionSpecialization' );
	hideSection( 'selectionPref' );
	hideSection( 'selectionConfirmation' );
}
window.selectClearHideSections = selectClearHideSections;

// clear selections on mouse click outside of div
// note: any clickable items must be in the inner if statement in order to work
function selectClearMaybe( evnt ) {
	var node = (evnt.target) ? evnt.target : ((evnt.srcElement) ? evnt.srcElement : null);
	if ( !checkParent( node ) ) {
		selectClear();
	}
	// check if any parent is a selection class
	function checkParent( node ) {
		while ( node.parentNode ) {
			var test = false;
			for ( var i = 0; i < clickableClasses.length; i++ ) {
				if ( node.className == clickableClasses[i] ) {
					test = true;
				}
			}
			if ( test ) {
				return true;
			}
			node = node.parentNode;
		}
		return false;
	}
}
window.selectClearMaybe = selectClearMaybe;

// confirm selection
// if prefConfirmSelections is true then prompt user for confirmation before setting things
function selectConfirmation( func, name, text ) {
	if ( prefConfirmSelections ) {
		var selectConfirmation = document.getElementById( 'selectConfirmation' );
		var children = selectConfirmation.getElementsByTagName( '*' );
		while ( children.length > 0 ) {
			selectConfirmation.removeChild( children[0] );
		}
		var spanLeft = document.createElement( 'span' );
		spanLeft.setAttribute( 'style', 'float:left' );
		var spanRight = document.createElement( 'span' );
		spanRight.setAttribute( 'style', 'float:right' );
		var spanClear = document.createElement( 'span' );
		spanClear.setAttribute( 'style', 'clear:both' );
		var a = document.createElement( 'a' );
		a.setAttribute( 'id', 'selectConfirmationSet' );
		a.setAttribute( 'onclick', func + ';hideSection(\'selectionConfirmation\')' );
		a.innerHTML = 'Confirm Selection';
		spanLeft.appendChild( a );
		var span = document.createElement( 'span' );
		span.innerHTML = ' &nbsp; ';
		spanRight.appendChild( span );
		var a = document.createElement( 'a' );
		a.setAttribute( 'id', 'selectConfirmationCancel' );
		a.setAttribute( 'onclick', 'hideSection(\'selectionConfirmation\')' );
		a.innerHTML = 'X';
		spanRight.appendChild( a );
		selectConfirmation.appendChild( spanLeft );
		selectConfirmation.appendChild( spanRight );
		selectConfirmation.appendChild( document.createElement( 'br' ) );
		selectConfirmation.appendChild( spanClear );
		var span = document.createElement( 'span' );
		span.innerHTML = name;
		selectConfirmation.appendChild( span );
		selectConfirmation.appendChild( document.createElement( 'br' ) );
		var span = document.createElement( 'span' );
		span.innerHTML = text;
		selectConfirmation.appendChild( span );
		showPositionSection( 'selectionConfirmation', true );
	} else {
		eval( func );
	}
}
window.selectConfirmation = selectConfirmation;

// super stat functions
function setupSuperStats() {
	var selectSuperStat = document.getElementById( 'selectSuperStat' );
	var children = selectSuperStat.getElementsByTagName( '*' );
	while ( children.length > 0 ) {
		selectSuperStat.removeChild( children[0] );
	}
	for ( var i = 0; i < dataSuperStat.length; i++ ) {
		if ( i == 0 ) {
			var spanLeft = document.createElement( 'span' );
			spanLeft.setAttribute( 'style', 'float:left' );
			var spanRight = document.createElement( 'span' );
			spanRight.setAttribute( 'style', 'float:right' );
			var spanClear = document.createElement( 'span' );
			spanClear.setAttribute( 'style', 'clear:both' );
			var a = document.createElement( 'a' );
			a.setAttribute( 'id', 'selectSuperStat' + i );
			a.setAttribute( 'onclick', 'setSuperStat(' + i + ')' );
			a.setAttribute( 'onclick', 'selectConfirmation(\'setSuperStat(' + i + ')\', \'Clear\', \'\')' );
			a.innerHTML = 'Clear';
			spanLeft.appendChild( a );
			var span = document.createElement( 'span' );
			span.innerHTML = ' &nbsp; ';
			spanRight.appendChild( span );
			var a = document.createElement( 'a' );
			a.setAttribute( 'id', 'selectSuperStatCancel' );
			a.setAttribute( 'onclick', 'selectClear()' );
			a.innerHTML = 'X';
			spanRight.appendChild( a );
			selectSuperStat.appendChild( spanLeft );
			selectSuperStat.appendChild( spanRight );
			selectSuperStat.appendChild( document.createElement( 'br' ) );
			selectSuperStat.appendChild( spanClear );
		} else {
			var a = document.createElement( 'a' );
			a.setAttribute( 'id', 'selectSuperStat' + i );
			a.setAttribute( 'onclick',
							'selectConfirmation(\'setSuperStat(' + i + ')\', \'' + escapeQuotes( dataSuperStat[i].desc ) + '\', \'' + dataSuperStat[i].tip + '\')' );
			a.innerHTML = dataSuperStat[i].desc;
			setOnmouseoverPopupL1( a, dataSuperStat[i].tip );
			selectSuperStat.appendChild( a );
			selectSuperStat.appendChild( document.createElement( 'br' ) );
		}
	}
	hideSection( 'selectionSuperStat' );
}
window.setupSuperStats = setupSuperStats;
function selectSuperStat( num ) {
	var fieldId = 'fieldSuperStat' + num;
	var field = document.getElementById( fieldId );
	if ( selectedFieldId == fieldId ) {
		selectClear();
	} else {
		selectClear();
		selectedNum = num;
		selectedFieldId = fieldId;
		selectedFieldClass = field.getAttribute( 'class' );
		field.setAttribute( 'class', 'selectedButton' );
		showPositionSection( 'selectionSuperStat', true );
	}
}
window.selectSuperStat = selectSuperStat;
function setSuperStat( id ) {
	var num = selectedNum;
	var field = document.getElementById( 'fieldSuperStat' + num );
	var selectField = document.getElementById( 'selectSuperStat' + id );
	var oldId = phSuperStat[num].id;
	var oldSelectField = document.getElementById( 'selectSuperStat' + oldId );
	var swapNum = 0;
	var swapField;
	if ( id != oldId ) {
		if ( id > 0 ) {
			for ( var i = 1; i < phSuperStat.length; i++ ) {
				if ( i != num && phSuperStat[i].id == id ) {
					swapNum = i;
					swapField = document.getElementById( 'fieldSuperStat' + i );
				}
			}
		}
		phSuperStat[num] = dataSuperStat[id];
		if ( id == 0 ) {
			field.innerHTML = getSuperStatDefault( num );
			clearOnmouseoverPopup( field );
		} else {
			field.innerHTML = getSuperStatDesc( id, num );
			setOnmouseoverPopupL2( field, dataSuperStat[id].tip );
			selectField.setAttribute( 'class', 'takenButton' );
		}
		if ( swapNum > 0 ) {
			phSuperStat[swapNum] = dataSuperStat[oldId];
			if ( oldId != 0 ) {
				swapField.innerHTML = getSuperStatDesc( oldId, swapNum );
				setOnmouseoverPopupL2( swapField, dataSuperStat[oldId].tip );
			} else {
				swapField.innerHTML = getSuperStatDefault( swapNum );
				clearOnmouseoverPopup( swapField );
			}
		} else if ( oldId != 0 ) {
			oldSelectField.setAttribute( 'class', 'button' );
		}
		//submitAnalytics(analyticsSetCatagory, 'SuperStat', phSuperStat[num].name);
	}
	setupInnateTalents();
	setupTalents();
	setupSpecializations();
	selectClear();
}
window.setSuperStat = setSuperStat;
function getSuperStatDefault( num ) {
	if ( num == 1 ) {
		return '<span><img src="../img/blank.png" />&nbsp;Primary Super Stat</span>';
	} else {
		return '<span><img src="../img/blank.png" />&nbsp;Secondary Super Stat ' + (num - 1) + '</span>';
	}
}
window.getSuperStatDefault = getSuperStatDefault;
function getSuperStatDesc( id, num ) {
	return dataSuperStat[id].desc + ' <span class="spec">' + ((num == 1) ? '(Primary)' : '(Secondary)') + '</span>';
}
window.getSuperStatDesc = getSuperStatDesc;
function highlightSuperStats( str ) {
	for ( var i = 1; i < phSuperStat.length; i++ ) {
		var regex = new RegExp( '(' + phSuperStat[i].abbrev + ': \\d+)' );
		if ( regex != null ) {
			str = str.replace( regex, '<span class="specHighlight">$1</span>' );
		}
	}
	return str;
}
window.highlightSuperStats = highlightSuperStats;

// innate talent functions
function setupInnateTalents() {
	var selectInnateTalentIds = ['selectInnateTalent', 'selectInnateTalentLeft', 'selectInnateTalentRight'];
	for ( var i = 0; i < selectInnateTalentIds.length; i++ ) {
		var selectInnateTalent = document.getElementById( selectInnateTalentIds[i] );
		var children = selectInnateTalent.getElementsByTagName( '*' );
		while ( children.length > 0 ) {
			selectInnateTalent.removeChild( children[0] );
		}
	}
	var selectInnateTalent = document.getElementById( 'selectInnateTalent' );
	var selectInnateTalentLeft = document.getElementById( 'selectInnateTalentLeft' );
	var selectInnateTalentRight = document.getElementById( 'selectInnateTalentRight' );
	for ( var i = 0; i < dataInnateTalent.length; i++ ) {
		if ( i == 0 ) {
			var spanLeft = document.createElement( 'span' );
			spanLeft.setAttribute( 'style', 'float:left' );
			var spanRight = document.createElement( 'span' );
			spanRight.setAttribute( 'style', 'float:right' );
			var spanClear = document.createElement( 'span' );
			spanClear.setAttribute( 'style', 'clear:both' );
			var a = document.createElement( 'a' );
			a.setAttribute( 'id', 'selectInnateTalent' + i );
			a.setAttribute( 'onclick', 'selectConfirmation(\'setInnateTalent(' + i + ')\', \'Clear\', \'\')' );
			a.innerHTML = 'Clear';
			spanLeft.appendChild( a );
			var span = document.createElement( 'span' );
			span.innerHTML = ' &nbsp; ';
			spanRight.appendChild( span );
			var a = document.createElement( 'a' );
			a.setAttribute( 'id', 'selectInnateTalentCancel' );
			a.setAttribute( 'onclick', 'selectClear()' );
			a.innerHTML = 'X';
			spanRight.appendChild( a );
			selectInnateTalent.appendChild( spanLeft );
			selectInnateTalent.appendChild( spanRight );
			selectInnateTalent.appendChild( document.createElement( 'br' ) );
			selectInnateTalent.appendChild( spanClear );
		} else {
			if ( i <= dataInnateTalent.length / 2 ) {
				selectInnateTalent = selectInnateTalentLeft;
			} else {
				selectInnateTalent = selectInnateTalentRight;
			}
			var a = document.createElement( 'a' );
			a.setAttribute( 'id', 'selectInnateTalent' + i );
			a.setAttribute( 'onclick',
							'selectConfirmation(\'setInnateTalent(' + i + ')\', \'' + escapeQuotes( dataInnateTalent[i].desc ) + '\', \'' + dataInnateTalent[i].tip + '\')' );
			a.innerHTML = '<img src="../img/Innate_Talent.png" />&nbsp;' + dataInnateTalent[i].desc + ((dataInnateTalent[i].extra != null) ? ' <span class="selectSpec">(' + highlightSuperStats( dataInnateTalent[i].extra ) + ')</span>' : '');
			setOnmouseoverPopupL1( a, dataInnateTalent[i].tip );
			selectInnateTalent.appendChild( a );
			selectInnateTalent.appendChild( document.createElement( 'br' ) );
		}
	}
	hideSection( 'selectionInnateTalent' );
}
window.setupInnateTalents = setupInnateTalents;
function selectInnateTalent( num ) {
	var fieldId = 'fieldInnateTalent' + num;
	var field = document.getElementById( fieldId );
	if ( selectedFieldId == fieldId ) {
		selectClear();
	} else {
		selectClear();
		selectedNum = num;
		selectedFieldId = fieldId;
		selectedFieldClass = field.getAttribute( 'class' );
		field.setAttribute( 'class', 'selectedButton' );
		showPositionSection( 'selectionInnateTalent', true );
	}
}
window.selectInnateTalent = selectInnateTalent;
function setInnateTalent( id ) {
	var num = selectedNum;
	var field = document.getElementById( 'fieldInnateTalent' + num );
	var selectField = document.getElementById( 'selectInnateTalent' + id );
	var oldId = phInnateTalent[num].id;
	var oldSelectField = document.getElementById( 'selectInnateTalent' + oldId );
	if ( id != oldId ) {
		phInnateTalent[num] = dataInnateTalent[id];
		if ( id == 0 ) {
			field.innerHTML = getInnateTalentDefault( num );
			clearOnmouseoverPopup( field );
		} else {
			field.innerHTML = getInnateTalentDesc( id, num );
			setOnmouseoverPopupL2( field, dataInnateTalent[id].tip );
			selectField.setAttribute( 'class', 'takenButton' );
		}
		if ( oldId != 0 ) {
			oldSelectField.setAttribute( 'class', 'selectButton' );
		}
		//submitAnalytics(analyticsSetCatagory, 'InnateTalent', phInnateTalent[num].name);
	}
	selectClear();
}
window.setInnateTalent = setInnateTalent;
function getInnateTalentDefault( num ) {
	return '<span><img src="../img/blank.png" />&nbsp;Innate Talent</span>';
}
window.getInnateTalentDefault = getInnateTalentDefault;
function getInnateTalentDesc( id, num ) {
	return '<img src="../img/Innate_Talent.png" />&nbsp;' + dataInnateTalent[id].desc + ((dataInnateTalent[id].extra != null) ? ' <span class="spec">(' + dataInnateTalent[id].extra + ')</span>' : '');
}
window.getInnateTalentDesc = getInnateTalentDesc;

// talent functions
function setupTalents() {
	var selectTalentIds = ['selectTalent', 'selectTalentLeft', 'selectTalentRight'];
	for ( var i = 0; i < selectTalentIds.length; i++ ) {
		var selectTalent = document.getElementById( selectTalentIds[i] );
		var children = selectTalent.getElementsByTagName( '*' );
		while ( children.length > 0 ) {
			selectTalent.removeChild( children[0] );
		}
	}
	var selectTalent = document.getElementById( 'selectTalent' );
	var selectTalentLeft = document.getElementById( 'selectTalentLeft' );
	var selectTalentRight = document.getElementById( 'selectTalentRight' );
	for ( var i = 0; i < dataTalent.length; i++ ) {
		if ( i == 0 ) {
			var spanLeft = document.createElement( 'span' );
			spanLeft.setAttribute( 'style', 'float:left' );
			var spanRight = document.createElement( 'span' );
			spanRight.setAttribute( 'style', 'float:right' );
			var spanClear = document.createElement( 'span' );
			spanClear.setAttribute( 'style', 'clear:both' );
			var a = document.createElement( 'a' );
			a.setAttribute( 'id', 'selectTalent' + i );
			a.setAttribute( 'onclick', 'selectConfirmation(\'setTalent(' + i + ')\', \'Clear\', \'\')' );
			a.innerHTML = 'Clear';
			spanLeft.appendChild( a );
			var span = document.createElement( 'span' );
			span.setAttribute( 'style', 'float:right' );
			span.innerHTML = ' &nbsp; ';
			spanRight.appendChild( span );
			var a = document.createElement( 'a' );
			a.setAttribute( 'id', 'selectTalentCancel' );
			a.setAttribute( 'onclick', 'selectClear()' );
			a.innerHTML = 'X';
			spanRight.appendChild( a );
			selectTalent.appendChild( spanLeft );
			selectTalent.appendChild( spanRight );
			selectTalent.appendChild( document.createElement( 'br' ) );
			selectTalent.appendChild( spanClear );
		} else {
			if ( i <= dataTalent.length / 2 ) {
				selectTalent = selectTalentLeft;
			} else {
				selectTalent = selectTalentRight;
			}
			var a = document.createElement( 'a' );
			a.setAttribute( 'id', 'selectTalent' + i );
			a.setAttribute( 'onclick',
							'selectConfirmation(\'setTalent(' + i + ')\', \'' + escapeQuotes( dataTalent[i].desc ) + '\', \'\')' );
			a.innerHTML = '<img src="../img/Talent.png" />&nbsp;' + dataTalent[i].desc + ((dataTalent[i].extra != null) ? ' <span class="selectSpec">(' + highlightSuperStats( dataTalent[i].extra ) + ')</span>' : '');
			setOnmouseoverPopupL2( a, dataTalent[i].tip );
			selectTalent.appendChild( a );
			selectTalent.appendChild( document.createElement( 'br' ) );
		}
	}
	hideSection( 'selectionTalent' );
}
window.setupTalents = setupTalents;
function selectTalent( num ) {
	var fieldId = 'fieldTalent' + num;
	var field = document.getElementById( fieldId );
	if ( selectedFieldId == fieldId ) {
		selectClear();
	} else {
		selectClear();
		selectedNum = num;
		selectedFieldId = fieldId;
		selectedFieldClass = field.getAttribute( 'class' );
		field.setAttribute( 'class', 'selectedButton' );
		showPositionSection( 'selectionTalent', true );
	}
}
window.selectTalent = selectTalent;
function setTalent( id ) {
	var num = selectedNum;
	var field = document.getElementById( 'fieldTalent' + num );
	var selectField = document.getElementById( 'selectTalent' + id );
	var oldId = phTalent[num].id;
	var oldSelectField = document.getElementById( 'selectTalent' + oldId );
	var swapNum = 0;
	var swapField;
	if ( id != oldId ) {
		if ( id > 0 ) {
			for ( var i = 1; i < phTalent.length; i++ ) {
				if ( i != num && phTalent[i].id == id ) {
					swapNum = i;
					swapField = document.getElementById( 'fieldTalent' + i );
				}
			}
		}
		phTalent[num] = dataTalent[id];
		if ( id == 0 ) {
			field.innerHTML = getTalentDefault( num );
			clearOnmouseoverPopup( field );
		} else {
			field.innerHTML = getTalentDesc( id );
			setOnmouseoverPopupL2( field, dataTalent[id].tip );
			selectField.setAttribute( 'class', 'takenButton' );
		}
		if ( swapNum > 0 ) {
			phTalent[swapNum] = dataTalent[oldId];
			if ( oldId != 0 ) {
				swapField.innerHTML = getTalentDesc( oldId );
				setOnmouseoverPopupL2( swapField, dataTalent[oldId].tip );
			} else {
				swapField.innerHTML = getTalentDefault( swapNum );
				clearOnmouseoverPopup( swapField );
			}
		} else if ( oldId != 0 ) {
			oldSelectField.setAttribute( 'class', 'button' );
		}
		//submitAnalytics(analyticsSetCatagory, 'Talent', phTalent[num].name);
	}
	selectClear();
}
window.setTalent = setTalent;
function getTalentDefault( num ) {
	return '<span><img src="../img/blank.png" />&nbsp;Talent ' + num + '</span>';
}
window.getTalentDefault = getTalentDefault;
function getTalentDesc( id ) {
	return '<img src="../img/Talent.png" />&nbsp;' + dataTalent[id].desc + ((dataTalent[id].extra != null) ? ' <span class="spec">(' + dataTalent[id].extra + ')</span>' : '');
}
window.getTalentDesc = getTalentDesc;

// travel power functions
function setupTravelPowers() {
	var selectTravelPowerIds = ['selectTravelPower', 'selectTravelPowerLeft', 'selectTravelPowerRight'];
	for ( var i = 0; i < selectTravelPowerIds.length; i++ ) {
		var selectTravelPower = document.getElementById( selectTravelPowerIds[i] );
		var children = selectTravelPower.getElementsByTagName( '*' );
		while ( children.length > 0 ) {
			selectTravelPower.removeChild( children[0] );
		}
	}
	var selectTravelPower = document.getElementById( 'selectTravelPower' );
	var selectTravelPowerLeft = document.getElementById( 'selectTravelPowerLeft' );
	var selectTravelPowerRight = document.getElementById( 'selectTravelPowerRight' );
	for ( var i = 0; i < dataTravelPower.length; i++ ) {
		if ( i == 0 ) {
			var spanLeft = document.createElement( 'span' );
			spanLeft.setAttribute( 'style', 'float:left' );
			var spanRight = document.createElement( 'span' );
			spanRight.setAttribute( 'style', 'float:right' );
			var spanClear = document.createElement( 'span' );
			spanClear.setAttribute( 'style', 'clear:both' );
			var a = document.createElement( 'a' );
			a.setAttribute( 'id', 'selectTravelPower' + i );
			a.setAttribute( 'onclick', 'setTravelPower(' + i + ')' );
			a.setAttribute( 'onclick', 'selectConfirmation(\'setTravelPower(' + i + ')\', \'Clear\', \'\')' );
			a.innerHTML = 'Clear';
			spanLeft.appendChild( a );
			var span = document.createElement( 'span' );
			span.innerHTML = ' &nbsp; ';
			spanRight.appendChild( span );
			var a = document.createElement( 'a' );
			a.setAttribute( 'id', 'selectTravelPowerCancel' );
			a.setAttribute( 'onclick', 'selectClear()' );
			a.innerHTML = 'X';
			spanRight.appendChild( a );
			selectTravelPower.appendChild( spanLeft );
			selectTravelPower.appendChild( spanRight );
			selectTravelPower.appendChild( document.createElement( 'br' ) );
			selectTravelPower.appendChild( spanClear );
		} else {
			if ( i <= dataTravelPower.length / 2 ) {
				selectTravelPower = selectTravelPowerLeft;
			} else {
				selectTravelPower = selectTravelPowerRight;
			}
			var a = document.createElement( 'a' );
			a.setAttribute( 'id', 'selectTravelPower' + i );
			a.setAttribute( 'onclick',
							'selectConfirmation(\'setTravelPower(' + i + ')\', \'' + escapeQuotes( dataTravelPower[i].desc ) + '\', \'' + dataTravelPower[i].tip + '\')' );
			a.innerHTML = dataTravelPower[i].desc;
			setOnmouseoverPopupL1( a, dataTravelPower[i].tip );
			selectTravelPower.appendChild( a );
			selectTravelPower.appendChild( document.createElement( 'br' ) );
		}
	}
	hideSection( 'selectionTravelPower' );
	hideSection( 'selectionTravelPowerAdvantage' );
}
window.setupTravelPowers = setupTravelPowers;
function selectTravelPower( num ) {
	var fieldId = 'fieldTravelPower' + num;
	var field = document.getElementById( fieldId );
	if ( selectedFieldId == fieldId ) {
		selectClear();
	} else {
		selectClear();
		selectedNum = num;
		selectedFieldId = fieldId;
		selectedFieldClass = field.getAttribute( 'class' );
		field.setAttribute( 'class', 'selectedButton' );
		showPositionSection( 'selectionTravelPower', true );
	}
}
window.selectTravelPower = selectTravelPower;
function setTravelPower( id ) {
	var num = selectedNum;
	var field = document.getElementById( 'fieldTravelPower' + num );
	var advantageField = document.getElementById( 'fieldTravelPowerAdvantage' + num );
	var selectField = document.getElementById( 'selectTravelPower' + id );
	var oldId = phTravelPower[num].id;
	var oldAdvantage = phTravelPowerAdvantage[num];
	var oldSelectField = document.getElementById( 'selectTravelPower' + oldId );
	var swapNum = 0;
	var swapField;
	var swapAdvantageField;
	if ( id != oldId ) {
		if ( id > 0 ) {
			for ( var i = 1; i < phTravelPower.length; i++ ) {
				if ( i != num && phTravelPower[i].id == id ) {
					swapNum = i;
					swapField = document.getElementById( 'fieldTravelPower' + i );
					swapAdvantageField = document.getElementById( 'fieldTravelPowerAdvantage' + i );
				}
			}
		}
		if ( swapNum > 0 ) {
			phTravelPower[num] = phTravelPower[swapNum];
			phTravelPowerAdvantage[num] = phTravelPowerAdvantage[swapNum];
			field.innerHTML = dataTravelPower[id].desc;
			setOnmouseoverPopupL2( field, dataTravelPower[id].tip );
			advantageField.style.display = '';
			setAdvantage( 2, num, phTravelPowerAdvantage[num] );
			phTravelPower[swapNum] = dataTravelPower[oldId];
			phTravelPowerAdvantage[swapNum] = oldAdvantage;
			if ( oldId != 0 ) {
				swapField.innerHTML = dataTravelPower[oldId].desc;
				setOnmouseoverPopupL2( swapField, dataTravelPower[oldId].tip );
				setAdvantage( 2, swapNum, phTravelPowerAdvantage[swapNum] );
			} else {
				swapField.innerHTML = getTravelPowerDefault( swapNum );
				clearOnmouseoverPopup( swapField );
				swapAdvantageField.style.display = 'none';
				setAdvantage( 2, swapNum, 0 );
			}
		} else {
			if ( phTravelPower[num].id != 0 ) {
				setAdvantage( 2, num, 0 );
			}
			phTravelPower[num] = dataTravelPower[id];
			phTravelPowerAdvantage[num] = 0;
			if ( id == 0 ) {
				field.innerHTML = getTravelPowerDefault( num );
				clearOnmouseoverPopup( field );
				advantageField.style.display = 'none';
			} else {
				field.innerHTML = dataTravelPower[id].desc;
				setOnmouseoverPopupL2( field, dataTravelPower[id].tip );
				advantageField.innerHTML = advantageTextSpan( 2, num, 0 );
				advantageField.style.display = '';
				selectField.setAttribute( 'class', 'takenButton' );
				if ( oldId != 0 ) {
					oldSelectField.setAttribute( 'class', 'button' );
				}
			}
			if ( oldId != 0 ) {
				oldSelectField.setAttribute( 'class', 'button' );
			}
		}
		//submitAnalytics(analyticsSetCatagory, 'TravelPower', phTravelPower[num].name);
	}
	selectClear();
}
window.setTravelPower = setTravelPower;
function getTravelPowerDefault( num ) {
	return '<span><img src="../img/blank.png" />&nbsp;Travel Power ' + num + '</span>';
}
window.getTravelPowerDefault = getTravelPowerDefault;

// power functions
function setupFrameworks() {
	var selectFramework = document.getElementById( 'selectFramework' );
	var children = selectFramework.getElementsByTagName( '*' );
	while ( children.length > 0 ) {
		selectFramework.removeChild( children[0] );
	}
	var spanLeft = document.createElement( 'span' );
	spanLeft.setAttribute( 'style', 'float:left' );
	var spanRight = document.createElement( 'span' );
	spanRight.setAttribute( 'style', 'float:right' );
	var spanClear = document.createElement( 'span' );
	spanClear.setAttribute( 'style', 'clear:both' );
	var table = document.createElement( 'table' );
	var tr = document.createElement( 'tr' );
	table.appendChild( tr );
	var newRow = Math.floor( dataFramework.length / 2 );
	for ( var i = 1; i < dataFramework.length; i++ ) {
		var td = document.createElement( 'td' );
		tr.appendChild( td );
		var a = document.createElement( 'a' );
		a.setAttribute( 'id', 'selectFramework' + i );
		a.setAttribute( 'onclick', 'selectFramework(' + i + ')' );
		a.innerHTML = dataFramework[i].desc;
		setOnmouseoverPopupL1( a, dataFramework[i].tip );
		td.appendChild( a );
		if ( i == newRow ) {
			tr = document.createElement( 'tr' );
			table.appendChild( tr );
		}
	}
	spanLeft.appendChild( table );
	var span = document.createElement( 'span' );
	span.innerHTML = ' &nbsp; ';
	spanRight.appendChild( span );
	var a = document.createElement( 'a' );
	a.setAttribute( 'id', 'selectPowerCancel' );
	a.setAttribute( 'onclick', 'selectClear()' );
	a.innerHTML = 'X';
	spanRight.appendChild( a );
	selectFramework.appendChild( spanLeft );
	selectFramework.appendChild( spanRight );
	selectFramework.appendChild( document.createElement( 'br' ) );
	selectFramework.appendChild( spanClear );
}
window.setupFrameworks = setupFrameworks;
function selectFramework( framework ) {
	var selectPowerIds = ['selectPower', 'selectPowerLeft', 'selectPowerRight'];
	for ( var i = 0; i < selectPowerIds.length; i++ ) {
		var selectPower = document.getElementById( selectPowerIds[i] );
		var children = selectPower.getElementsByTagName( '*' );
		while ( children.length > 0 ) {
			selectPower.removeChild( children[0] );
		}
	}
	var selectPower = document.getElementById( 'selectPower' );
	var selectPowerLeft = document.getElementById( 'selectPowerLeft' );
	var selectPowerRight = document.getElementById( 'selectPowerRight' );
	var spanLeft = document.createElement( 'span' );
	spanLeft.setAttribute( 'style', 'float:left' );
	// var spanRight = document.createElement('span');
	// spanRight.setAttribute('style', 'float:right');
	var a = document.createElement( 'a' );
	a.setAttribute( 'id', 'selectPower0' );
	a.setAttribute( 'onclick', 'selectConfirmation(\'setPower(0)\', \'Clear\', \'\')' );
	a.innerHTML = 'Clear';
	spanLeft.appendChild( a );
	var span = document.createElement( 'span' );
	span.innerHTML = ' &nbsp; ';
	spanLeft.appendChild( span );
	var a = document.createElement( 'a' );
	a.setAttribute( 'id', 'selectPowerInsert' );
	a.setAttribute( 'onclick', 'selectPowerInsert(' + selectedNum + ')' );
	a.innerHTML = 'Insert';
	spanLeft.appendChild( a );
	var span = document.createElement( 'span' );
	span.innerHTML = ' &nbsp; ';
	spanLeft.appendChild( span );
	var a = document.createElement( 'a' );
	a.setAttribute( 'id', 'selectPowerDelete' );
	a.setAttribute( 'onclick', 'selectPowerDelete(' + selectedNum + ')' );
	a.innerHTML = 'Delete';
	spanLeft.appendChild( a );
	selectPower.appendChild( spanLeft );
	selectPower.appendChild( document.createElement( 'br' ) );
	var frameworkPowers = dataPowerIdFromFramework[framework];
	for ( var i = 0; i < frameworkPowers.length; i++ ) {
		if ( i < frameworkPowers.length / 2 ) {
			selectPower = selectPowerLeft;
		} else {
			selectPower = selectPowerRight;
		}
		var powerId = frameworkPowers[i];
		var power = dataPower[powerId];
		var a = document.createElement( 'a' );
		a.setAttribute( 'id', 'selectPower' + powerId );
		switch ( selectPowerAllowed( selectedNum, powerId ) ) {
			case 0:
				a.setAttribute( 'class', 'disabledButton' );
				break;
			case 1:
				a.setAttribute( 'onclick',
								'selectConfirmation(\'setPower(' + powerId + ')\', \'' + escapeQuotes( dataPower[powerId].desc ) + '\', \'' + dataPower[powerId].tip + '\')' );
				a.setAttribute( 'class', 'button' );
				break;
			case 2:
				a.setAttribute( 'onclick',
								'selectConfirmation(\'setPower(' + powerId + ')\', \'' + escapeQuotes( dataPower[powerId].desc ) + '\', \'' + dataPower[powerId].tip + '\')' );
				a.setAttribute( 'class', 'takenButton' );
				break;
		}
		a.innerHTML = dataPower[powerId].desc;
		setOnmouseoverPopupL1( a, dataPower[powerId].tip );
		selectPower.appendChild( a );
		selectPower.appendChild( document.createElement( 'br' ) );
	}
	prevSelectedFramework = framework;
	updatePositionSection( 'selectionPower' );
}
window.selectFramework = selectFramework;
function selectPower( num ) {
	var fieldId = 'fieldPower' + num;
	var field = document.getElementById( fieldId );
	if ( selectedFieldId == fieldId ) {
		selectClear();
	} else {
		selectClear();
		selectedNum = num;
		selectedFieldId = fieldId;
		selectedFieldClass = field.getAttribute( 'class' );
		field.setAttribute( 'class', 'selectedButton' );
		if ( phPower[num].id != 0 ) {
			selectFramework( phPower[num].framework );
		} else if ( prevSelectedFramework != 0 ) {
			selectFramework( prevSelectedFramework );
		} else {
			selectFramework( 0 );
		}
		showPositionSection( 'selectionPower', false );
	}
}
window.selectPower = selectPower;
function setPower( id ) {
	if ( dataReplacePower[id] != undefined ) {
		id = dataReplacePower[id];
	}
	var num = selectedNum;
	var field = document.getElementById( 'fieldPower' + num );
	var advantageField = document.getElementById( 'fieldPowerAdvantage' + num );
	var oldId = phPower[num].id;
	var oldAdvantage = phPowerAdvantage[num];
	var swapNum = 0;
	var swapField;
	var swapAdvantageField;
	if ( id != oldId ) {
		if ( id > 0 ) {
			for ( var i = 1; i < phPower.length; i++ ) {
				if ( i != num && phPower[i].name == dataPower[id].name ) {
					swapNum = i;
					swapField = document.getElementById( 'fieldPower' + i );
					swapAdvantageField = document.getElementById( 'fieldPowerAdvantage' + i );
				}
			}
		}
		if ( swapNum > 0 ) {
			phPower[num] = phPower[swapNum];
			phPowerAdvantage[num] = phPowerAdvantage[swapNum];
			field.innerHTML = dataPower[id].desc;
			setOnmouseoverPopupL2( field, dataPower[id].tip );
			advantageField.style.display = '';
			setAdvantage( 1, num, phPowerAdvantage[num] );
			phPower[swapNum] = dataPower[oldId];
			phPowerAdvantage[swapNum] = oldAdvantage;
			if ( oldId != 0 ) {
				swapField.innerHTML = dataPower[oldId].desc;
				setOnmouseoverPopupL2( swapField, dataPower[oldId].tip );
				swapAdvantageField.style.display = '';
				setAdvantage( 1, swapNum, phPowerAdvantage[swapNum] );
			} else {
				swapField.innerHTML = getPowerDefault( swapNum );
				clearOnmouseoverPopup( swapField );
				swapAdvantageField.style.display = 'none';
				setAdvantage( 1, swapNum, 0 );
			}
		} else {
			if ( phPower[num].id != 0 ) {
				setAdvantage( 1, num, 0 );
			}
			phPower[num] = dataPower[id];
			phPowerAdvantage[num] = 0;
			if ( id == 0 ) {
				field.innerHTML = getPowerDefault( num );
				clearOnmouseoverPopup( field );
				advantageField.style.display = 'none';
			} else {
				field.innerHTML = dataPower[id].desc;
				setOnmouseoverPopupL2( field, dataPower[id].tip );
				advantageField.innerHTML = advantageTextSpan( 1, num, 0 );
				advantageField.style.display = '';
			}
		}
		//submitAnalytics(analyticsSetCatagory, 'Power', phPower[num].name);
	}
	selectClear();
	validatePowers();
}
window.setPower = setPower;
function getPowerDefault( num ) {
	return '<span><img src="../img/blank.png" />&nbsp;Power ' + num + '</span>';
}
window.getPowerDefault = getPowerDefault;
function selectPowerAllowed( num, id ) {
	// returns: 0=no, 1=yes, 2=taken
	var result = 0;
	var power = dataPower[id];
	var oldTier = (num > 0) ? phPower[num].tier : -1;
	var powerCount = 0;
	var powerSetCount = 0;
	var frameworkCount = 0;
	var groupCount = 0;
	var otherCount = 0;
	var energyBuilderId = 0;
	var energyUnlockId = 0;
	var tier4Id = 0;
	for ( var i = 1; i < phPower.length; i++ ) {
		var p = phPower[i];
		if ( i < num ) {
			if ( p.tier == -1 ) {
				// eb counts for framework, but not powerSet or otherCount
				if ( p.framework == power.framework ) {
					frameworkCount++;
				}
				// } else if (p.tier != 4) {
				//     // tier 4 does not count for powerSet or framework
			} else {
				if ( p.powerSet == power.powerSet ) {
					powerSetCount++;
				}
				if ( p.framework == power.framework ) {
					frameworkCount++;
				}
				otherCount++;
			}
			if ( p.tier != 4 ) {
				// all powers except for tier 4's count for power group
				if ( dataRequireGroupPower[power.id] != undefined ) {
					var group = dataRequireGroupPower[power.id];
					for ( var j = 0; j < dataRequireGroup[group].length; j++ ) {
						if ( p.framework == dataRequireGroup[group][j] ) {
							groupCount++;
						}
					}
				}
			}
			powerCount++;
		}
		// power types you may only have one of
		if ( p.tier == -1 ) {
			energyBuilderId = p.id;
		}
		if ( p.tier == 4 ) {
			tier4Id = p.id;
		}
		if ( dataEnergyUnlockPower[p.id] != undefined ) {
			energyUnlockId = p.id;
		}
	}
	switch ( power.tier ) {
		case -1:
			if ( energyBuilderId == 0 ) {
				result = 1;
			} else if ( oldTier == -1 ) {
				result = 2;
			}
			break;
		case 0:
			result = 1;
			break;
		case 1:
			if ( frameworkCount >= 1 || groupCount >= 1 || otherCount >= 2 ) {
				result = 1;
			}
			break;
		case 2:
			//if (frameworkCount >= 3 || groupCount >= 3 || otherCount >= 5) result = 1;
			if ( frameworkCount >= 3 || groupCount >= 3 || otherCount >= 4 ) {
				result = 1;
			}
			break;
		case 3:
			//if (frameworkCount >= 5 || groupCount >= 5 || otherCount >= 8) result = 1;
			if ( frameworkCount >= 5 || groupCount >= 5 || otherCount >= 6 ) {
				result = 1;
			}
			break;
		case 4:
			//if (powerSetCount >= 10) result = 1;
			//if (powerCount >= 12 && tier4Id == 0) result = 1;
			//if (phArchetype > 1 || num >= 13) { }
			if ( tier4Id == 0 ) {
				result = 1;
			} else if ( oldTier == 4 ) {
				result = 2;
			}
			break;
	}
	if ( result > 0 && energyUnlockId != 0 && dataEnergyUnlockPower[id] != undefined ) {
		if ( dataEnergyUnlockPower[phPower[num].id] != undefined ) {
			result = 2;
		} else {
			result = 0;
		}
	}
	for ( var i = 1; i < phPower.length; i++ ) {
		if ( phPower[i].name == power.name && (num != i || result == 1) ) {
			result = 2;
		}
	}
	return result;
}
window.selectPowerAllowed = selectPowerAllowed;
function validatePower( num, id ) {
	var field = document.getElementById( 'fieldPower' + num );
	if ( id == 0 || selectPowerAllowed( num, id ) > 0 ) {
		field.setAttribute( 'class', 'button' );
	} else {
		field.setAttribute( 'class', 'disabledButton' );
	}
}
window.validatePower = validatePower;
function validatePowers() {
	for ( var i = 1; i < phPower.length; i++ ) {
		validatePower( i, phPower[i].id );
	}
}
window.validatePowers = validatePowers;
function selectPowerInsert( num ) {
	for ( var i = phPower.length - 1; i > num; i-- ) {
		movePower( i - 1, i );
	}
	selectedNum = num;
	setPower( 0 );
	selectClear();
	validatePowers();
}
window.selectPowerInsert = selectPowerInsert;
function selectPowerDelete( num ) {
	for ( var i = num + 1; i < phPower.length; i++ ) {
		movePower( i, i - 1 );
	}
	selectedNum = phPower.length - 1;
	setPower( 0 );
	selectClear();
	validatePowers();
}
window.selectPowerDelete = selectPowerDelete;
function movePower( fromNum, toNum ) {
	var power = phPower[fromNum];
	var mask = phPowerAdvantage[fromNum];
	selectedNum = toNum;
	setPower( power.id );
	setAdvantage( 1, toNum, mask );
}
window.movePower = movePower;

// archetype power functions
function selectArchetypePower( num ) {
	var fieldId = 'fieldPower' + num;
	var field = document.getElementById( fieldId );
	if ( selectedFieldId == fieldId ) {
		selectClear();
	} else {
		selectClear();
		selectedNum = num;
		selectedFieldId = fieldId;
		selectedFieldClass = field.getAttribute( 'class' );
		field.setAttribute( 'class', 'selectedButton' );
		var selectPower = document.getElementById( 'selectArchetypePower' );
		var children = selectPower.getElementsByTagName( '*' );
		while ( children.length > 0 ) {
			selectPower.removeChild( children[0] );
		}
		var span = document.createElement( 'span' );
		span.setAttribute( 'style', 'float:right' );
		span.innerHTML = ' &nbsp; ';
		selectPower.appendChild( span );
		var a = document.createElement( 'a' );
		a.setAttribute( 'id', 'selectPowerCancel' );
		a.setAttribute( 'onclick', 'selectClear()' );
		a.innerHTML = 'X';
		span.appendChild( a );
		selectPower.appendChild( document.createElement( 'br' ) );
		var archetypePowerList = phArchetype.powerList[num];
		for ( var i = 1; i < archetypePowerList.length; i++ ) {
			var powerId = archetypePowerList[i];
			var power = dataPower[powerId];
			var a = document.createElement( 'a' );
			a.setAttribute( 'id', 'selectPower' + powerId );
			if ( powerId == phPower[num].id ) {
				a.setAttribute( 'class', 'disabledButton' );
			} else {
				a.setAttribute( 'onclick',
								'selectConfirmation(\'setArchetypePower(' + powerId + ')\', \'' + escapeQuotes( dataPower[powerId].desc ) + '\', \'' + dataPower[powerId].tip + '\')' );
				a.setAttribute( 'class', 'button' );
			}
			a.innerHTML = dataPower[powerId].desc;
			setOnmouseoverPopupL1( a, dataPower[powerId].tip );
			selectPower.appendChild( a );
			selectPower.appendChild( document.createElement( 'br' ) );
		}
		showPositionSection( 'selectionArchetypePower', true );
	}
}
window.selectArchetypePower = selectArchetypePower;
function setArchetypePower( id ) {
	var num = selectedNum;
	var field = document.getElementById( 'fieldPower' + num );
	var advantageField = document.getElementById( 'fieldPowerAdvantage' + num );
	var oldId = phPower[num].id;
	if ( id != oldId ) {
		setAdvantage( 1, num, 0 );
		phPower[num] = dataPower[id];
		phPowerAdvantage[num] = 0;
		field.innerHTML = dataPower[id].desc;
		advantageField.innerHTML = advantageTextSpan( 1, num, 0 );
		setOnmouseoverPopupL2( advantageField, advantageTip( 1, num, 0 ) );
		advantageField.style.display = '';
		//submitAnalytics(analyticsSetCatagory, 'ArchetypePower', phPower[num].name);
	}
	selectClear();
}
window.setArchetypePower = setArchetypePower;

// power advantage functions
function checkAdvantageDependancyId( type, num, id ) {
	var result = true;
	var power = (type == 1) ? phPower[num] : phTravelPower[num];
	var mask = (type == 1) ? phPowerAdvantage[num] : phTravelPowerAdvantage[num];
	var dependency = power.advantageList[id].dependency;
	if ( dependency != null && !power.hasAdvantage( mask, dependency ) ) {
		result = false;
	}
	return result;
}
window.checkAdvantageDependancyId = checkAdvantageDependancyId;
function checkAdvantageDependancyMask( type, num, mask ) {
	var result = true;
	var power = (type == 1) ? phPower[num] : phTravelPower[num];
	var advantageList = (type == 1) ? phPower[num].advantageList : phTravelPower[num].advantageList;
	for ( var i = 1; i < advantageList.length; i++ ) {
		var advantage = advantageList[i];
		if ( advantage.dependency != null && power.hasAdvantage( mask, advantage.id ) && !power.hasAdvantage( mask,
																											  advantage.dependency ) )
		{
			result = false;
		}
	}
	return result;
}
window.checkAdvantageDependancyMask = checkAdvantageDependancyMask;
function selectTravelPowerAdvantage( num ) {
	selectAdvantage( 2, num );
}
window.selectTravelPowerAdvantage = selectTravelPowerAdvantage;
function selectPowerAdvantage( num ) {
	selectAdvantage( 1, num );
}
window.selectPowerAdvantage = selectPowerAdvantage;
function selectAdvantage( type, num ) {
	var formIds = ['formPowerAdvantage', 'formTravelPowerAdvantage'];
	var fieldId = ((type == 1) ? 'fieldPowerAdvantage' : 'fieldTravelPowerAdvantage') + num;
	var field = document.getElementById( fieldId );
	var power = (type == 1) ? phPower[num] : phTravelPower[num];
	var mask = (type == 1) ? phPowerAdvantage[num] : phTravelPowerAdvantage[num];
	if ( selectedFieldId == fieldId ) {
		selectClear();
	} else {
		selectClear();
		selectedNum = num;
		selectedFieldId = fieldId;
		selectedFieldClass = field.getAttribute( 'class' );
		field.setAttribute( 'class', 'selectedButtonNote' );
		for ( var i = 0; i < formIds.length; i++ ) {
			var form = document.getElementById( formIds[i] );
			var children = form.getElementsByTagName( '*' );
			while ( children.length > 0 ) {
				form.removeChild( children[0] );
			}
		}
		var form = document.getElementById( (type == 1) ? 'formPowerAdvantage' : 'formTravelPowerAdvantage' );
		var spanLeft = document.createElement( 'span' );
		spanLeft.setAttribute( 'style', 'float:left' );
		var spanRight = document.createElement( 'span' );
		spanRight.setAttribute( 'style', 'float:right' );
		var spanClear = document.createElement( 'span' );
		spanClear.setAttribute( 'style', 'clear:both' );
		var a = document.createElement( 'a' );
		a.setAttribute( 'id', 'selectAdvantageClear' );
		a.setAttribute( 'onclick', 'selectAdvantageClear(' + type + ', ' + num + ')' );
		a.innerHTML = 'Clear';
		spanLeft.appendChild( a );
		var span = document.createElement( 'span' );
		span.innerHTML = ' &nbsp; ';
		spanLeft.appendChild( span );
		var a = document.createElement( 'a' );
		a.setAttribute( 'id', 'selectAdvantageCancel' );
		a.setAttribute( 'onclick', 'selectAdvantageCancel(' + type + ', ' + num + ', ' + mask + ')' );
		a.innerHTML = 'Cancel';
		spanLeft.appendChild( a );
		var span = document.createElement( 'span' );
		span.innerHTML = ' &nbsp; ';
		spanRight.appendChild( span );
		var a = document.createElement( 'a' );
		a.setAttribute( 'id', 'selectAdvantageClose' );
		a.setAttribute( 'onclick', 'selectClear()' );
		a.innerHTML = 'X';
		spanRight.appendChild( a );
		form.appendChild( spanLeft );
		form.appendChild( spanRight );
		form.appendChild( document.createElement( 'br' ) );
		form.appendChild( spanClear );
		var table = document.createElement( 'table' );
		var advantageList = power.advantageList;
		var advantagePoints = power.getPoints( mask );
		for ( var i = 1; i < advantageList.length; i++ ) {
			var advantage = advantageList[i];
			var tr = document.createElement( 'tr' );
			table.appendChild( tr );
			var td = document.createElement( 'td' );
			tr.appendChild( td );
			var input = document.createElement( 'input' );
			input.setAttribute( 'id', 'checkboxAdvantage' + i );
			input.setAttribute( 'type', 'checkbox' );
			input.setAttribute( 'name', advantage.name );
			input.setAttribute( 'value', advantage.id );
			if ( mask > 0 && power.hasAdvantage( mask, i ) ) {
				input.checked = true;
			}
			if ( input.checked || (statAdvantagePoints + advantage.points <= maxAdvantagePointsTotal && advantagePoints + advantage.points <= maxAdvantagePointsPerPower && checkAdvantageDependancyId( type,
																																																		num,
																																																		advantage.id )) )
			{
				if ( input.checked ) {
					input.setAttribute( 'onclick', 'selectAdvantageToggle(' + type + ', ' + num + ', ' + i + ')' );
				} else {
					input.setAttribute( 'onclick',
										'selectConfirmation(\'selectAdvantageToggle(' + type + ', ' + num + ', ' + i + ')\', \'' + escapeQuotes( advantage.desc ) + '\', \'' + advantage.tip + '\')' );
				}
			} else {
				input.setAttribute( 'onclick', 'return false' );
			}
			td.appendChild( input );
			var td = document.createElement( 'td' );
			tr.appendChild( td );
			var a = document.createElement( 'a' );
			a.setAttribute( 'id', 'selectAdvantage' + i );
			if ( input.checked || (statAdvantagePoints + advantage.points <= maxAdvantagePointsTotal && advantagePoints + advantage.points <= maxAdvantagePointsPerPower && checkAdvantageDependancyId( type,
																																																		num,
																																																		advantage.id )) )
			{
				if ( input.checked ) {
					a.setAttribute( 'onclick', 'selectAdvantageToggle(' + type + ', ' + num + ', ' + i + ')' );
				} else {
					a.setAttribute( 'onclick',
									'selectConfirmation(\'selectAdvantageToggle(' + type + ', ' + num + ', ' + i + ')\', \'' + escapeQuotes( advantage.desc ) + '\', \'' + advantage.tip + '\')' );
				}
				a.setAttribute( 'class', 'selectButton' );
			} else {
				a.setAttribute( 'onclick', 'return false' );
				a.setAttribute( 'class', 'disabledButton' );
			}
			a.innerHTML = advantage.desc;
			setOnmouseoverPopupL1( a, advantage.tip );
			td.appendChild( a );
			var td = document.createElement( 'td' );
			tr.appendChild( td );
			var span = document.createElement( 'span' );
			span.setAttribute( 'class', 'note' );
			span.innerHTML = ' &nbsp; ' + advantage.points;
			td.appendChild( span );
		}
		form.appendChild( table );
		if ( type == 1 ) {
			showPositionSection( 'selectionPowerAdvantage', false );
		} else {
			showPositionSection( 'selectionTravelPowerAdvantage', true );
		}
	}
}
window.selectAdvantage = selectAdvantage;
function selectAdvantageUpdate( type, num ) {
	var field = document.getElementById( ((type == 1) ? 'fieldPowerAdvantage' : 'fieldTravelPowerAdvantage') + num );
	var power = (type == 1) ? phPower[num] : phTravelPower[num];
	var mask = (type == 1) ? phPowerAdvantage[num] : phTravelPowerAdvantage[num];
	var advantageList = power.advantageList;
	var advantagePoints = power.getPoints( mask );
	for ( var i = 1; i < advantageList.length; i++ ) {
		var advantage = advantageList[i];
		var checkboxAdvantage = document.getElementById( 'checkboxAdvantage' + i );
		var selectAdvantage = document.getElementById( 'selectAdvantage' + i );
		if ( checkboxAdvantage.checked || (statAdvantagePoints + advantage.points <= maxAdvantagePointsTotal && advantagePoints + advantage.points <= maxAdvantagePointsPerPower && checkAdvantageDependancyId( type,
																																																				num,
																																																				advantage.id )) )
		{
			if ( checkboxAdvantage.checked ) {
				checkboxAdvantage.setAttribute( 'onclick',
												'selectAdvantageToggle(' + type + ', ' + num + ', ' + i + ')' );
				selectAdvantage.setAttribute( 'onclick',
											  'selectAdvantageToggle(' + type + ', ' + num + ', ' + i + ')' );
			} else {
				checkboxAdvantage.setAttribute( 'onclick',
												'selectConfirmation(\'selectAdvantageToggle(' + type + ', ' + num + ', ' + i + ')\', \'' + escapeQuotes( advantage.desc ) + '\', \'' + advantage.tip + '\')' );
				selectAdvantage.setAttribute( 'onclick',
											  'selectConfirmation(\'selectAdvantageToggle(' + type + ', ' + num + ', ' + i + ')\', \'' + escapeQuotes( advantage.desc ) + '\', \'' + advantage.tip + '\')' );
			}
			selectAdvantage.setAttribute( 'class', 'selectButton' );
		} else {
			checkboxAdvantage.setAttribute( 'onclick', 'return false' );
			selectAdvantage.setAttribute( 'onclick', 'return false' );
			selectAdvantage.setAttribute( 'class', 'disabledButton' );
		}
	}
}
window.selectAdvantageUpdate = selectAdvantageUpdate;
function selectAdvantageClear( type, num ) {
	var mask = 0;
	setAdvantage( type, num, mask );
	var field = document.getElementById( ((type == 1) ? 'fieldPowerAdvantage' : 'fieldTravelPowerAdvantage') + num );
	var power = (type == 1) ? phPower[num] : phTravelPower[num];
	var advantageList = power.advantageList;
	for ( var i = 1; i < advantageList.length; i++ ) {
		var advantage = advantageList[i];
		var checkboxAdvantage = document.getElementById( 'checkboxAdvantage' + i );
		var selectAdvantage = document.getElementById( 'selectAdvantage' + i );
		checkboxAdvantage.checked = false;
		if ( statAdvantagePoints + advantage.points <= maxAdvantagePointsTotal && checkAdvantageDependancyId( type, num,
																											  advantage.id ) )
		{
			selectAdvantage.setAttribute( 'onclick',
										  'selectConfirmation(\'selectAdvantageToggle(' + type + ', ' + num + ', ' + i + ')\', \'' + escapeQuotes( advantage.desc ) + '\', \'' + advantage.tip + '\')' );
			selectAdvantage.setAttribute( 'class', 'selectButton' );
		} else {
			selectAdvantage.setAttribute( 'onclick', 'return false' );
			selectAdvantage.setAttribute( 'class', 'disabledButton' );
		}
	}
	field.innerHTML = advantageTextSpan( type, num, mask );
	setOnmouseoverPopupL1( field, advantageTip( type, num, mask ) );
}
window.selectAdvantageClear = selectAdvantageClear;
function selectAdvantageCancel( type, num, mask ) {
	var field = document.getElementById( ((type == 1) ? 'fieldPowerAdvantage' : 'fieldTravelPowerAdvantage') + num );
	field.innerHTML = advantageTextSpan( type, num, mask );
	setOnmouseoverPopupL1( field, advantageTip( type, num, mask ) );
	setAdvantage( type, num, mask );
	selectClear();
}
window.selectAdvantageCancel = selectAdvantageCancel;
function selectAdvantageToggle( type, num, id ) {
	var mask = (type == 1) ? phPowerAdvantage[num] : phTravelPowerAdvantage[num];
	var field = document.getElementById( 'checkboxAdvantage' + id );
	var power = (type == 1) ? phPower[num] : phTravelPower[num];
	if ( power.hasAdvantage( mask, id ) ) {
		mask = power.delAdvantage( mask, id );
		var advantageList = power.advantageList;
		for ( var i = 1; i < advantageList.length; i++ ) {
			var advantage = advantageList[i];
			if ( advantage.dependency != null && advantage.dependency == id ) {
				mask = power.delAdvantage( mask, advantage.id );
				document.getElementById( 'checkboxAdvantage' + advantage.id ).checked = false;
			}
		}
		field.checked = false;
		setAdvantage( type, num, mask );
	} else {
		var advantage = power.advantageList[id];
		var advantagePoints = power.getPoints( mask );
		if ( statAdvantagePoints + advantage.points <= maxAdvantagePointsTotal && advantagePoints + advantage.points <= maxAdvantagePointsPerPower && checkAdvantageDependancyId( type,
																																												  num,
																																												  id ) )
		{
			mask = power.addAdvantage( mask, id );
			field.checked = true;
			setAdvantage( type, num, mask );
			//submitAnalytics(analyticsSetCatagory, 'Advantage', power.name+': '+advantage.name);
		}
	}
	selectAdvantageUpdate( type, num );
}
window.selectAdvantageToggle = selectAdvantageToggle;
function setAdvantage( type, num, mask ) {
	var oldStatAdvantagePoints = statAdvantagePoints;
	var field = document.getElementById( ((type == 1) ? 'fieldPowerAdvantage' : 'fieldTravelPowerAdvantage') + num );
	var power = (type == 1) ? phPower[num] : phTravelPower[num];
	var phMask = (type == 1) ? phPowerAdvantage[num] : phTravelPowerAdvantage[num];
	var advantageList = power.getAdvantageList( phMask );
	var advantagePoints = power.getPoints( mask );
	for ( var i = 0; i < advantageList.length; i++ ) {
		statAdvantagePoints -= advantageList[i].points;
	}
	var advantageList = power.getAdvantageList( mask );
	for ( var i = 0; i < advantageList.length; i++ ) {
		statAdvantagePoints += advantageList[i].points;
	}
	if ( statAdvantagePoints <= maxAdvantagePointsTotal && advantagePoints <= maxAdvantagePointsPerPower && checkAdvantageDependancyMask( type,
																																		  num,
																																		  mask ) )
	{
		(type == 1) ? phPowerAdvantage[num] = mask : phTravelPowerAdvantage[num] = mask;
		field.innerHTML = advantageTextSpan( type, num, mask );
		setOnmouseoverPopupL2( field, advantageTip( type, num, mask ) );
	} else {
		statAdvantagePoints = oldStatAdvantagePoints;
	}
}
window.setAdvantage = setAdvantage;
function advantageText( type, num, mask ) {
	var power = (type == 1) ? phPower[num] : phTravelPower[num];
	var advantageList = power.advantageList;
	var result = '';
	if ( advantageList.length > 0 ) {
		if ( mask == 0 ) {
			result = '(advantages)';
		} else {
			for ( var i = 1; i < advantageList.length; i++ ) {
				if ( power.hasAdvantage( mask, i ) ) {
					if ( result.length == 0 ) {
						result = '(' + advantageList[i].desc;
					} else {
						result += ', ' + advantageList[i].desc;
					}
				}
			}
			result += ')';
		}
	}
	return result;
}
window.advantageText = advantageText;
function advantageTextSpan( type, num, mask ) {
	return '<span class="advantage">' + advantageText( type, num, mask ) + '</span>';
}
window.advantageTextSpan = advantageTextSpan;
function advantageTip( type, num, mask ) {
	var power = (type == 1) ? phPower[num] : phTravelPower[num];
	var advantageList = power.advantageList;
	var result = '';
	if ( advantageList.length > 0 && mask != 0 ) {
		for ( var i = 1; i < advantageList.length; i++ ) {
			if ( power.hasAdvantage( mask, i ) ) {
				var tip = advantageList[i].tip;
				if ( tip != null && tip.length > 0 ) {
					if ( result.length == 0 ) {
						result = tip;
					} else {
						result += '<br /><br />' + tip;
					}
				}
			}
		}
	}
	if ( result.length == 0 ) {
		return null;
	} else {
		return result;
	}
}
window.advantageTip = advantageTip;

// specialization functions
function setupSpecializations() {
	if ( prevSelectedSpecializationSuperStat != phSuperStat[1].id ) {
		phSpecializationTree[1] = dataSpecializationTree[phSuperStat[1].id];
		phSpecialization[1] = 0;
		prevSelectedSpecializationSuperStat = phSuperStat[1].id;
		phSpecializationTree[4] = dataSpecializationTree[0];
	}
	for ( var i = 1; i <= 4; i++ ) {
		var tableSpecialization = document.getElementById( 'tableSpecialization' + i );
		var children = tableSpecialization.getElementsByTagName( '*' );
		while ( children.length > 0 ) {
			tableSpecialization.removeChild( children[0] );
		}
	}
	for ( var i = 1; i <= 4; i++ ) {
		var specializationTree = phSpecializationTree[i];
		var mask = phSpecialization[i];
		var specializationList = specializationTree.specializationList;
		var specializationPointList = specializationTree.getSpecializationList( mask );
		var totalPoints = specializationTree.getPoints( mask );
		var header = document.getElementById( 'headerSpecialization' + i );
		var table = document.getElementById( 'tableSpecialization' + i );
		switch ( i ) {
			case 1:
				if ( specializationTree.id == 0 ) {
					header.setAttribute( 'class', 'disabledButton' );
					header.setAttribute( 'onclick', 'return false' );
					//header.innerHTML = '<span><img src="img/blank.png" />&nbsp;Stat Tree <span class="spec">(0/10)</span></span>';
					header.innerHTML = '<span>Stat Tree <span class="spec">(0/10)</span></span>';
				} else {
					header.setAttribute( 'class', 'button' );
					header.setAttribute( 'onclick', 'selectSpecialization(' + i + ')' );
					//header.innerHTML = '<span><img src="img/blank.png" />&nbsp;'+specializationTree.desc+' Tree <span class="spec">('+totalPoints+'/10)</span></span>';
					header.innerHTML = '<span>' + specializationTree.desc + ' Tree <span class="spec">(' + totalPoints + '/10)</span></span>';
				}
				break;
			case 2:
			case 3:
				if ( specializationTree.id == 0 ) {
					//header.innerHTML = '<span><img src="img/blank.png" />&nbsp;Role Tree <span class="spec">('+totalPoints+'/10)</span></span>';
					header.innerHTML = '<span>Role Tree <span class="spec">(' + totalPoints + '/10)</span></span>';
				} else {
					header.innerHTML = '<span>' + specializationTree.desc + ' Tree <span class="spec">(' + totalPoints + '/10)</span></span>';
				}
				break;
			case 4:
				if ( specializationTree.id == 0 ) {
					//header.innerHTML = '<span><img src="img/blank.png" />&nbsp;Mastery <span class="spec">(0/1)</span></span>';
					header.innerHTML = '<span>Mastery <span class="spec">(0/1)</span></span>';
				} else {
					// var specialization = specializationList[8];
					// header.innerHTML = '<span>'+specialization.desc+' <span class="spec">(1/1)</span></span>';
					header.innerHTML = '<span>' + specializationTree.desc + ' Mastery <span class="spec">(1/1)</span></span>';
				}
				break;
		}
		if ( i != 4 ) {
			table.setAttribute( 'onclick', 'selectSpecialization(' + i + ')' );
			for ( var j = 0; j < specializationList.length - 1; j++ ) {
				if ( specializationPointList[j] > 0 ) {
					var specialization = specializationList[j];
					var tr = document.createElement( 'tr' );
					table.appendChild( tr );
					var td = document.createElement( 'td' );
					tr.appendChild( td );
					var span = document.createElement( 'span' );
					span.innerHTML = specialization.desc;
					setOnmouseoverPopupL2( span, specialization.tip );
					td.appendChild( span );
					var td = document.createElement( 'td' );
					tr.appendChild( td );
					td.setAttribute( 'class', 'specializationPoints' );
					var span = document.createElement( 'span' );
					span.setAttribute( 'class', 'spec' );
					span.innerHTML = '(' + specializationPointList[j] + '/' + specialization.maxPoints + ')';
					td.appendChild( span );
				}
			}
			// } else {
			//     if (specializationTree.id != 0) {
			//         var tr = document.createElement('tr');
			//         table.appendChild(tr);
			//         var td = document.createElement('td');
			//         tr.appendChild(td);
			//         var span = document.createElement('span');
			//         // var specialization = specializationList[8];
			//         // span.innerHTML = '<span>'+specialization.desc+'</span>';
			//         span.innerHTML = '<span>'+specializationTree.desc+' Mastery</span>';
			//         td.appendChild(span);
			//         var td = document.createElement('td');
			//         tr.appendChild(td);
			//         td.setAttribute('class', 'specializationPoints');
			//         var span = document.createElement('span');
			//         span.setAttribute('class', 'spec');
			//         span.innerHTML = '(1/1)';
			//         td.appendChild(span);
			//     }
		}
	}
}
window.setupSpecializations = setupSpecializations;
function selectSpecialization( num ) {
	selectClear();
	selectSpecializationRefresh( num );
	showPositionSection( 'selectionSpecialization', true );
}
window.selectSpecialization = selectSpecialization;
function selectSpecializationRefresh( num ) {
	var selectSpecializationRole = document.getElementById( 'selectSpecializationRole' );
	var selectSpecialization = document.getElementById( 'selectSpecialization' );
	var specializationTree = phSpecializationTree[num];
	var mask = phSpecialization[num];
	var specializationList = specializationTree.specializationList;
	var specializationPointList = specializationTree.getSpecializationList( mask );
	var totalPoints = specializationTree.getPoints( mask );
	var tier1Points = specializationTree.getTierPoints( mask, 1 );
	var selectSpecializationIds = ['selectSpecializationRole', 'selectSpecialization'];
	for ( var i = 0; i < selectSpecializationIds.length; i++ ) {
		var selectSpecialization = document.getElementById( selectSpecializationIds[i] );
		var children = selectSpecialization.getElementsByTagName( '*' );
		while ( children.length > 0 ) {
			selectSpecialization.removeChild( children[0] );
		}
	}
	var spanLeft = document.createElement( 'span' );
	spanLeft.setAttribute( 'style', 'float:left' );
	var spanRight = document.createElement( 'span' );
	spanRight.setAttribute( 'style', 'float:right' );
	var spanClear = document.createElement( 'span' );
	spanClear.setAttribute( 'style', 'clear:both' );
	var span = document.createElement( 'span' );
	span.innerHTML = ' &nbsp; ';
	spanRight.appendChild( span );
	var a = document.createElement( 'a' );
	a.setAttribute( 'id', 'selectSpecializationClose' );
	a.setAttribute( 'onclick', 'selectClear()' );
	a.innerHTML = 'X';
	spanRight.appendChild( a );
	switch ( num ) {
		case 1:
			var span = document.createElement( 'span' );
			span.setAttribute( 'id', 'selectSpecialization1' );
			if ( specializationTree.id == 0 ) {
				//span.innerHTML = '<img src="img/blank.png" />&nbsp;Stat Tree (0/10)';
				span.innerHTML = 'Stat Tree (0/10)';
			} else {
				//span.innerHTML = '<img src="img/blank.png" />&nbsp;'+specializationTree.desc+' ('+totalPoints+'/10)';
				span.innerHTML = specializationTree.desc + ' Tree (' + totalPoints + '/10)';
			}
			spanLeft.appendChild( span );
			break;
		case 2:
		case 3:
			if ( phArchetype.id == 1 ) {
				for ( var i = 9; i < dataSpecializationTree.length; i++ ) {
					if ( i == 15 ) {
						spanLeft.appendChild( document.createElement( 'br' ) );
					}
					var a = document.createElement( 'a' );
					if ( specializationTree.id == i ) {
						a.setAttribute( 'onclick', 'setSpecializationTree(' + num + ', ' + i + ')' );
						a.setAttribute( 'class', 'takenButton' );
					} else if ( (num == 2 && phSpecializationTree[3].id == i) || (num == 3 && phSpecializationTree[2].id == i) ) {
						a.setAttribute( 'onclick', 'setSpecializationTree(' + num + ', ' + i + ')' );
						a.setAttribute( 'class', 'takenButton' );
					} else {
						a.setAttribute( 'onclick', 'setSpecializationTree(' + num + ', ' + i + ')' );
						a.setAttribute( 'class', 'button' );
					}
					a.innerHTML = dataSpecializationTree[i].desc;
					setOnmouseoverPopupL1( a, dataSpecializationTree[i].tip );
					spanLeft.appendChild( a );
					var span = document.createElement( 'span' );
					span.innerHTML = ' &nbsp; ';
					spanLeft.appendChild( span );
				}
			}
			if ( specializationTree.id != 0 ) {
				var span = document.createElement( 'span' );
				span.setAttribute( 'id', 'selectSpecialization' + num );
				span.innerHTML = specializationTree.desc + ' Tree (' + totalPoints + '/10)';
				selectSpecialization.appendChild( span );
				selectSpecialization.appendChild( document.createElement( 'br' ) );
			}
			break;
		case 4:
			var span = document.createElement( 'span' );
			span.setAttribute( 'id', 'selectSpecialization4' );
			if ( specializationTree.id == 0 ) {
				//span.innerHTML = '<span><img src="img/blank.png" />&nbsp;Mastery (0/1)</span>';
				span.innerHTML = '<span>Mastery (0/1)</span>';
			} else {
				// var specialization = specializationList[8];
				// span.innerHTML = '<span>'+specialization.desc+' (1/1)</span>';
				span.innerHTML = '<span>' + specializationTree.desc + ' Mastery (1/1)</span>';
			}
			spanLeft.appendChild( span );
			break;
	}
	selectSpecializationRole.appendChild( spanLeft );
	selectSpecializationRole.appendChild( spanRight );
	selectSpecializationRole.appendChild( document.createElement( 'br' ) );
	selectSpecializationRole.appendChild( spanClear );
	var a = document.createElement( 'a' );
	a.setAttribute( 'id', 'selectSpecializationClear' );
	a.setAttribute( 'onclick', 'selectSpecializationClear(' + num + ')' );
	a.innerHTML = 'Clear';
	selectSpecialization.appendChild( a );
	var span = document.createElement( 'span' );
	span.innerHTML = ' &nbsp; ';
	selectSpecialization.appendChild( span );
	if ( num != 4 ) {
		var a = document.createElement( 'a' );
		a.setAttribute( 'id', 'selectSpecializationCancel' );
		a.setAttribute( 'onclick', 'selectSpecializationCancel(' + num + ', ' + mask + ')' );
		a.innerHTML = 'Cancel';
		selectSpecialization.appendChild( a );
	}
	selectSpecialization.appendChild( document.createElement( 'br' ) );
	if ( num != 4 ) {
		var table = document.createElement( 'table' );
		for ( var i = 0; i < specializationList.length - 1; i++ ) {
			var specialization = specializationList[i];
			var tr = document.createElement( 'tr' );
			table.appendChild( tr );
			var td = document.createElement( 'td' );
			tr.appendChild( td );
			var span = document.createElement( 'span' );
			span.setAttribute( 'id', 'selectSpecializationDescription' + i );
			//span.setAttribute('class', 'specialization');
			span.innerHTML = specialization.desc;
			setOnmouseoverPopupL1( span, specialization.tip );
			if ( totalPoints < 10 || specializationPointList[i] > 0 ) {
				span.setAttribute( 'class', 'buttonText' );
			} else {
				span.setAttribute( 'class', 'disabledButtonText' );
			}
			td.appendChild( span );
			var td = document.createElement( 'td' );
			tr.appendChild( td );
			var a = document.createElement( 'a' );
			a.setAttribute( 'id', 'selectSpecializationDecrement' + i );
			if ( specializationPointList[i] > 0 ) {
				a.setAttribute( 'onclick', 'selectSpecializationDecrement(' + num + ',' + i + ')' );
				a.setAttribute( 'class', 'selectButton' );
			} else {
				a.setAttribute( 'onclick', 'return false' );
				a.setAttribute( 'class', 'disabledButton' );
			}
			a.innerHTML = '&nbsp;<<<&nbsp;';
			td.appendChild( a );
			var td = document.createElement( 'td' );
			tr.appendChild( td );
			var span = document.createElement( 'span' );
			span.setAttribute( 'id', 'selectSpecializationPoints' + i );
			span.innerHTML = '(' + specializationPointList[i] + '/' + specialization.maxPoints + ')';
			if ( totalPoints < 10 || specializationPointList[i] > 0 ) {
				span.setAttribute( 'class', 'note' );
			} else {
				span.setAttribute( 'class', 'disabledNote' );
			}
			td.appendChild( span );
			var td = document.createElement( 'td' );
			tr.appendChild( td );
			var a = document.createElement( 'a' );
			a.setAttribute( 'id', 'selectSpecializationIncrement' + i );
			if ( totalPoints < 10 && specializationPointList[i] < specialization.maxPoints && (i < 4 || tier1Points >= 5) ) {
				if ( specializationPointList[i] == 0 ) {
					a.setAttribute( 'onclick',
									'selectConfirmation(\'selectSpecializationIncrement(' + num + ', ' + i + ')\', \'' + escapeQuotes( specialization.desc ) + '\', \'' + specialization.tip + '\')' );
				} else {
					a.setAttribute( 'onclick', 'selectSpecializationIncrement(' + num + ',' + i + ')' );
				}
				a.setAttribute( 'class', 'selectButton' );
			} else {
				a.setAttribute( 'onclick', 'return false' );
				a.setAttribute( 'class', 'disabledButton' );
			}
			a.innerHTML = '&nbsp;>>>&nbsp;';
			td.appendChild( a );
		}
	} else {
		var table = document.createElement( 'table' );
		var tr = document.createElement( 'tr' );
		table.appendChild( tr );
		var td = document.createElement( 'td' );
		tr.appendChild( td );
		var a = document.createElement( 'a' );
		if ( phSpecializationTree[1].id == 0 ) {
			a.setAttribute( 'onclick', 'return false' );
			a.setAttribute( 'class', 'disabledButton' );
			a.innerHTML = '<span><img src="../img/blank.png" />&nbsp;Stat Mastery</span>';
			//a.innerHTML = '<span>Stat Mastery</span>';
		} else {
			var specialization = phSpecializationTree[1].specializationList[8];
			a.setAttribute( 'onclick', 'setSpecializationMastery(1)' );
			a.setAttribute( 'class', 'selectButton' );
			a.innerHTML = '<span>' + specialization.desc + '</span>';
			setOnmouseoverPopupL1( a, specialization.tip );
			//a.innerHTML = '<span>'+phSpecializationTree[1].desc+' Mastery</span>';
		}
		td.appendChild( a );
		for ( var i = 2; i <= 3; i++ ) {
			var tr = document.createElement( 'tr' );
			table.appendChild( tr );
			var td = document.createElement( 'td' );
			tr.appendChild( td );
			var a = document.createElement( 'a' );
			if ( phSpecializationTree[i].id == 0 ) {
				a.setAttribute( 'onclick', 'return false' );
				a.setAttribute( 'class', 'disabledButton' );
				a.innerHTML = '<span><img src="../img/blank.png" />&nbsp;Role Mastery</span>';
				//a.innerHTML = '<span>Role Mastery</span>';
			} else {
				var specialization = phSpecializationTree[i].specializationList[8];
				a.setAttribute( 'onclick', 'setSpecializationMastery(' + i + ')' );
				a.setAttribute( 'class', 'selectButton' );
				a.innerHTML = '<span>' + specialization.desc + '</span>';
				setOnmouseoverPopupL1( a, specialization.tip );
				//a.innerHTML = '<span>'+phSpecializationTree[i].desc+' Mastery</span>';
			}
			td.appendChild( a );
		}
	}
	selectSpecialization.appendChild( table );
	updatePositionSection( 'selectionSpecialization' );
}
window.selectSpecializationRefresh = selectSpecializationRefresh;
function selectSpecializationUpdate( num ) {
	var specializationTree = phSpecializationTree[num];
	var mask = phSpecialization[num];
	var specializationList = specializationTree.specializationList;
	var specializationPointList = specializationTree.getSpecializationList( mask );
	var totalPoints = specializationTree.getPoints( mask );
	var tier1Points = specializationTree.getTierPoints( mask, 1 );
	if ( num != 4 ) {
		var selectSpecialization = document.getElementById( 'selectSpecialization' + num );
		//selectSpecialization.innerHTML = '<img src="img/blank.png" />&nbsp;'+specializationTree.desc+' Tree ('+totalPoints+'/10)';
		selectSpecialization.innerHTML = specializationTree.desc + ' Tree (' + totalPoints + '/10)';
	}
	for ( var i = 0; i < specializationList.length - 1; i++ ) {
		var selectSpecializationDescription = document.getElementById( 'selectSpecializationDescription' + i );
		var selectSpecializationDecrement = document.getElementById( 'selectSpecializationDecrement' + i );
		var selectSpecializationPoints = document.getElementById( 'selectSpecializationPoints' + i );
		var selectSpecializationIncrement = document.getElementById( 'selectSpecializationIncrement' + i );
		var specialization = specializationList[i];
		selectSpecializationPoints.innerHTML = '(' + specializationPointList[i] + '/' + specialization.maxPoints + ')';
		if ( totalPoints < 10 || specializationPointList[i] > 0 ) {
			selectSpecializationDescription.setAttribute( 'class', 'buttonText' );
			selectSpecializationPoints.setAttribute( 'class', 'note' );
		} else {
			selectSpecializationDescription.setAttribute( 'class', 'disabledButtonText' );
			selectSpecializationPoints.setAttribute( 'class', 'disabledNote' );
		}
		if ( specializationPointList[i] > 0 ) {
			selectSpecializationDecrement.setAttribute( 'onclick',
														'selectSpecializationDecrement(' + num + ',' + i + ')' );
			selectSpecializationDecrement.setAttribute( 'class', 'selectButton' );
		} else {
			selectSpecializationDecrement.setAttribute( 'onclick', 'return false' );
			selectSpecializationDecrement.setAttribute( 'class', 'disabledButton' );
		}
		if ( totalPoints < 10 && specializationPointList[i] < specialization.maxPoints && (i < 4 || tier1Points >= 5) ) {
			if ( specializationPointList[i] == 0 ) {
				selectSpecializationIncrement.setAttribute( 'onclick',
															'selectConfirmation(\'selectSpecializationIncrement(' + num + ', ' + i + ')\', \'' + escapeQuotes( specialization.desc ) + '\', \'' + specialization.tip + '\')' );
			} else {
				selectSpecializationIncrement.setAttribute( 'onclick',
															'selectSpecializationIncrement(' + num + ',' + i + ')' );
			}
			selectSpecializationIncrement.setAttribute( 'class', 'selectButton' );
		} else {
			selectSpecializationIncrement.setAttribute( 'onclick', 'return false' );
			selectSpecializationIncrement.setAttribute( 'class', 'disabledButton' );
		}
	}
}
window.selectSpecializationUpdate = selectSpecializationUpdate;
function selectSpecializationClear( num ) {
	if ( phArchetype.id == 1 || num == 4 ) {
		phSpecializationTree[num] = dataSpecializationTree[0];
	}
	phSpecialization[num] = 0;
	prevSelectedSpecializationSuperStat = 0; // force super stat specialization to reset properly
	setupSpecializations();
	selectClear();
}
window.selectSpecializationClear = selectSpecializationClear;
function selectSpecializationCancel( num, mask ) {
	setSpecialization( num, mask );
	selectClear();
}
window.selectSpecializationCancel = selectSpecializationCancel;
function selectSpecializationIncrement( num, id ) {
	var specializationTree = phSpecializationTree[num];
	var mask = phSpecialization[num];
	var totalPoints = specializationTree.getPoints( mask );
	var tier1Points = specializationTree.getTierPoints( mask, 1 );
	var specializationList = specializationTree.specializationList;
	var specializationPointList = specializationTree.getSpecializationList( mask );
	var specialization = specializationList[id];
	if ( totalPoints < 10 && specializationPointList[id] < specialization.maxPoints && (id < 4 || tier1Points >= 5) ) {
		var newMask = specializationTree.incrSpecialization( mask, id );
		setSpecialization( num, newMask );
		selectSpecializationUpdate( num );
		//submitAnalytics(analyticsSetCatagory, 'Specialization', specializationTree.name+': '+specialization.name, specializationPointList[id]);
	}
}
window.selectSpecializationIncrement = selectSpecializationIncrement;
function selectSpecializationDecrement( num, id ) {
	var specializationTree = phSpecializationTree[num];
	var mask = phSpecialization[num];
	var totalPoints = specializationTree.getPoints( mask );
	var specializationList = specializationTree.specializationList;
	var specializationPointList = specializationTree.getSpecializationList( mask );
	var specialization = specializationList[id];
	if ( specializationPointList[id] > 0 ) {
		var newMask = specializationTree.decrSpecialization( mask, id );
		setSpecialization( num, newMask );
		selectSpecializationUpdate( num );
		//submitAnalytics(analyticsSetCatagory, 'Specialization', specializationTree.name+': '+specialization.name, specializationPointList[id]);
	}
}
window.selectSpecializationDecrement = selectSpecializationDecrement;
function setSpecialization( num, mask ) {
	if ( dataSpecializationTree[num].getPoints( mask ) <= 10 ) {
		phSpecialization[num] = mask;
		setupSpecializations();
	}
}
window.setSpecialization = setSpecialization;
function setSpecializationTree( num, id ) {
	var currentTree = phSpecializationTree[num];
	if ( currentTree.id != id ) {
		if ( (num == 2 && phSpecializationTree[3].id == id) || (num == 3 && phSpecializationTree[2].id == id) ) {
			var otherNum = ((num == 2) ? 3 : 2);
			var otherTree = phSpecializationTree[otherNum];
			var otherSpec = phSpecialization[otherNum];
			phSpecializationTree[otherNum] = phSpecializationTree[num];
			phSpecialization[otherNum] = phSpecialization[num];
			phSpecializationTree[num] = otherTree;
			phSpecialization[num] = otherSpec;
		} else {
			if ( phSpecializationTree[num].id == phSpecializationTree[4].id ) {
				phSpecializationTree[4] = dataSpecializationTree[0];
			}
			phSpecializationTree[num] = dataSpecializationTree[id];
			phSpecialization[num] = 0;
		}
		selectSpecializationRefresh( num );
		setupSpecializations();
		//submitAnalytics(analyticsSetCatagory, 'SpecializationTree', phSpecializationTree[num].name);
	}
}
window.setSpecializationTree = setSpecializationTree;
function setSpecializationMastery( id ) {
	if ( id == 0 ) {
		phSpecializationTree[4] = dataSpecializationTree[0];
	} else {
		phSpecializationTree[4] = phSpecializationTree[id];
	}
	setupSpecializations();
	selectClear();
	//if (id > 0) submitAnalytics(analyticsSetCatagory, 'SpecializationMastery', phSpecializationTree[4].name);
}
window.setSpecializationMastery = setSpecializationMastery;
function getSpecializationMasteryId( id ) {
	for ( var i = 1; i < phSpecializationTree.length - 1; i++ ) {
		if ( phSpecializationTree[i].id == id ) {
			return i;
		}
	}
	return 0;
}
window.getSpecializationMasteryId = getSpecializationMasteryId;

// archetype functions
function setupArchtypes() {
	var selectArchetypeIds = ['selectArchetype', 'selectArchetypeLeft', 'selectArchetypeRight'];
	for ( var i = 0; i < selectArchetypeIds.length; i++ ) {
		var selectArchetype = document.getElementById( selectArchetypeIds[i] );
		var children = selectArchetype.getElementsByTagName( '*' );
		while ( children.length > 0 ) {
			selectArchetype.removeChild( children[0] );
		}
	}
	var selectArchetype = document.getElementById( 'selectArchetype' );
	var selectArchetypeLeft = document.getElementById( 'selectArchetypeLeft' );
	var selectArchetypeRight = document.getElementById( 'selectArchetypeRight' );
	for ( var i = 0; i < dataArchetype.length; i++ ) {
		if ( i == 0 ) {
			var span = document.createElement( 'span' );
			span.setAttribute( 'style', 'float:right' );
			span.innerHTML = ' &nbsp; ';
			selectArchetype.appendChild( span );
			var a = document.createElement( 'a' );
			a.setAttribute( 'id', 'selectArchetypeCancel' );
			a.setAttribute( 'onclick', 'selectClear()' );
			a.innerHTML = 'X';
			span.appendChild( a );
		} else {
			if ( i <= dataArchetype.length / 2 ) {
				selectArchetype = selectArchetypeLeft;
			} else {
				selectArchetype = selectArchetypeRight;
			}
			var a = document.createElement( 'a' );
			a.setAttribute( 'id', 'selectArchetype' + i );
			a.setAttribute( 'onclick', 'setArchetype(' + i + ')' );
			a.innerHTML = dataArchetype[i].desc;
			setOnmouseoverPopupL1( a, dataArchetype[i].tip );
			selectArchetype.appendChild( a );
		}
		selectArchetype.appendChild( document.createElement( 'br' ) );
	}
	hideSection( 'selectionArchetype' );
	hideSection( 'selectionArchetypePower' );
}
window.setupArchtypes = setupArchtypes;
function selectArchetype() {
	selectClear();
	showPositionSection( 'selectionArchetype', true );
}
window.selectArchetype = selectArchetype;
function setArchetype( id ) {
	var archetype = dataArchetype[id];
	if ( id == 1 ) {
		for ( var i = 1; i < phSuperStat.length; i++ ) {
			var field = document.getElementById( 'fieldSuperStat' + i );
			field.setAttribute( 'onclick', 'selectSuperStat(' + i + ')' );
			field.setAttribute( 'class', 'button' );
		}
		for ( var i = 1; i < phInnateTalent.length; i++ ) {
			var field = document.getElementById( 'fieldInnateTalent' + i );
			field.setAttribute( 'onclick', 'selectInnateTalent(' + i + ')' );
			field.setAttribute( 'class', 'button' );
		}
		for ( var i = 1; i < phPower.length; i++ ) {
			var field = document.getElementById( 'fieldPower' + i );
			field.setAttribute( 'onclick', 'selectPower(' + i + ')' );
			field.setAttribute( 'class', 'button' );
		}
		document.getElementById( 'fieldTalentNote1' ).innerHTML = '6&nbsp;';
		document.getElementById( 'fieldTalentNote2' ).innerHTML = '9&nbsp;';
		document.getElementById( 'fieldTalentNote3' ).innerHTML = '12&nbsp;';
		document.getElementById( 'fieldTalentNote4' ).innerHTML = '15&nbsp;';
		document.getElementById( 'fieldTalentNote5' ).innerHTML = '18&nbsp;';
		document.getElementById( 'fieldTalentNote6' ).innerHTML = '21&nbsp;';
		document.getElementById( 'fieldPowerNote8' ).innerHTML = '20&nbsp;';
		document.getElementById( 'fieldPowerNote9' ).innerHTML = '23&nbsp;';
		document.getElementById( 'fieldPowerNote10' ).innerHTML = '26&nbsp;';
		document.getElementById( 'fieldPowerNote11' ).innerHTML = '29&nbsp;';
		document.getElementById( 'fieldPowerNote12' ).innerHTML = '32&nbsp;';
		document.getElementById( 'rowPower13' ).style.display = '';
		document.getElementById( 'rowPower14' ).style.display = '';
	} else {
		for ( var i = 1; i < phSuperStat.length; i++ ) {
			var id = archetype.superStatList[i];
			var field = document.getElementById( 'fieldSuperStat' + i );
			var selectField = document.getElementById( 'selectSuperStat' + id );
			if ( id != phSuperStat[i].id ) {
				phSuperStat[i] = dataSuperStat[id];
				field.innerHTML = getSuperStatDesc( id, i );
				setOnmouseoverPopupL2( field, dataSuperStat[id].tip );
			}
			field.setAttribute( 'onclick', 'return false' );
			field.setAttribute( 'class', 'lockedButton' );
			selectField.setAttribute( 'class', 'takenButton' );
		}
		for ( var i = 1; i < phInnateTalent.length; i++ ) {
			var id = archetype.innateTalent;
			var field = document.getElementById( 'fieldInnateTalent' + i );
			var selectField = document.getElementById( 'selectInnateTalent' + id );
			if ( id != phInnateTalent[i].id ) {
				phInnateTalent[i] = dataInnateTalent[id];
				field.innerHTML = getInnateTalentDesc( id, i );
				setOnmouseoverPopupL2( field, dataInnateTalent[id].tip );
			}
			field.setAttribute( 'onclick', 'return false' );
			field.setAttribute( 'class', 'lockedButton' );
			selectField.setAttribute( 'class', 'takenButton' );
		}
		for ( var i = 1; i < phPower.length; i++ ) {
			var field = document.getElementById( 'fieldPower' + i );
			var advantageField = document.getElementById( 'fieldPowerAdvantage' + i );
			var id = archetype.powerList[i];
			if ( id != undefined ) {
				var multiplePowers = false;
				if ( id instanceof Array ) {
					multiplePowers = true;
					var powers = id;
					var oldId = phPower[i].id;
					for ( var j = 1; j < powers.length; j++ ) {
						if ( powers[j] == oldId ) {
							id = powers[j];
						}
					}
					if ( id instanceof Array ) {
						id = powers[1];
					}
				}
				if ( id != phPower[i].id ) {
					setAdvantage( 1, i, 0 );
					phPower[i] = dataPower[id];
					field.innerHTML = dataPower[id].desc;
					setOnmouseoverPopupL2( field, dataPower[id].tip );
					advantageField.innerHTML = advantageTextSpan( 1, i, 0 );
					setOnmouseoverPopupL2( advantageField, advantageTip( 1, i, 0 ) );
				}
				if ( multiplePowers ) {
					field.setAttribute( 'onclick', 'selectArchetypePower(' + i + ')' );
					field.setAttribute( 'class', 'button' );
				} else {
					field.setAttribute( 'onclick', 'return false' );
					field.setAttribute( 'class', 'lockedButton' );
				}
				advantageField.style.display = '';
			} else {
				setAdvantage( 1, i, 0 );
				phPower[i] = dataPower[0];
				field.innerHTML = getPowerDefault( i );
				setOnmouseoverPopupL2( field, dataPower[i].tip );
				advantageField.innerHTML = advantageTextSpan( 1, i, 0 );
				setOnmouseoverPopupL2( advantageField, advantageTip( 1, i, 0 ) );
			}
		}
		for ( var i = 1; i <= 3; i++ ) {
			setSpecializationTree( i, archetype.specializationTreeList[i] );
		}
		document.getElementById( 'fieldTalentNote1' ).innerHTML = '7&nbsp;';
		document.getElementById( 'fieldTalentNote2' ).innerHTML = '12&nbsp;';
		document.getElementById( 'fieldTalentNote3' ).innerHTML = '15&nbsp;';
		document.getElementById( 'fieldTalentNote4' ).innerHTML = '20&nbsp;';
		document.getElementById( 'fieldTalentNote5' ).innerHTML = '25&nbsp;';
		document.getElementById( 'fieldTalentNote6' ).innerHTML = '30&nbsp;';
		document.getElementById( 'fieldPowerNote8' ).innerHTML = '21&nbsp;';
		document.getElementById( 'fieldPowerNote9' ).innerHTML = '25&nbsp;';
		document.getElementById( 'fieldPowerNote10' ).innerHTML = '30&nbsp;';
		document.getElementById( 'fieldPowerNote11' ).innerHTML = '35&nbsp;';
		document.getElementById( 'fieldPowerNote12' ).innerHTML = '40&nbsp;';
		document.getElementById( 'rowPower13' ).style.display = 'none';
		document.getElementById( 'rowPower14' ).style.display = 'none';
	}
	phArchetype = archetype;
	document.getElementById( 'fieldArchetype' ).innerHTML = archetype.desc;
	selectClear();
	//submitAnalytics(analyticsSetCatagory, 'Archetype', archetype.name);
}
window.setArchetype = setArchetype;

// apply version update
function applyVersionUpdate( version, thing, value ) {
	var result = value[thing];
	for ( var i = version; i < phVersion; i++ ) {
		if ( i < dataVersionUpdate.length ) {
			var funct = dataVersionUpdate[i].funct;
			result = funct( thing, value );
			value[thing] = result;
		}
	}
	return result;
}
window.applyVersionUpdate = applyVersionUpdate;

// parse url for parameters
function parseUrlParams( url ) {
	var version = buildVersion;
	var data = [];
	var parts = url.split( '?' );
	if ( parts[1] != undefined ) {
		var params = parts[1].split( '&' );
		for ( var i = 0; i < params.length; i++ ) {
			var pair = params[i].split( '=' );
			switch ( pair[0] ) {
				case 'v':
					version = parseInt( pair[1] );
					break;
				case 'n':
					phName = decodeURIComponent( pair[1] );
					document.getElementById( 'fieldName' ).firstChild.data = phName;
					break;
				case 'a':
					// note: deprecated, but needed for backwards compatibility with version 1
					phArchetype = dataArchetype[parseInt( pair[1] )];
					//document.getElementById('fieldArchetype').firstChild.data = phArchetype.name;
					break;
				case 'd':
					data = pair[1];
					break;
			}
		}
	}
	var pos = 0;
	var i = 0;
	var inc = 1;
	var archetype = 1;
	var specializationMasteryId = 0;
	while ( i < data.length ) {
		//var codeNum = urlCodeToNum(data[i]);
		pos = applyVersionUpdate( version, 'pos', {
			'type':      'start',
			'pos':       pos,
			'i':         i,
			'inc':       inc,
			'archetype': archetype
		} );
		i = applyVersionUpdate( version, 'i', {
			'type':      'start',
			'pos':       pos,
			'i':         i,
			'inc':       inc,
			'archetype': archetype
		} );
		//codeNum = applyVersionUpdate(version, 'codeNum', {'type': 'start', 'pos': pos, 'i': i, 'inc': inc, 'codeNum': codeNum, 'archetype': archetype});
		switch ( pos ) {
			case 0:
				// archetype
				var code1 = applyVersionUpdate( version, 'code1', {
					'type':      'archetype',
					'pos':       pos,
					'i':         i,
					'inc':       inc,
					'code1':     data[i],
					'archetype': archetype
				} );
				archetype = urlCodeToNum( code1 );
				archetype = applyVersionUpdate( version, 'archetype', {
					'type':      'archetype',
					'pos':       pos,
					'i':         i,
					'inc':       inc,
					'code1':     code1,
					'archetype': archetype
				} );
				phArchetype = dataArchetype[archetype];
				inc = 1;
				inc = applyVersionUpdate( version, 'inc', {
					'type':      'archetype',
					'pos':       pos,
					'i':         i,
					'inc':       inc,
					'code1':     code1,
					'archetype': archetype
				} );
				break;
			case 1:
			case 2:
			case 3:
				// super stats
				var code1 = applyVersionUpdate( version, 'code1', {
					'type':      'superStat',
					'pos':       pos,
					'i':         i,
					'inc':       inc,
					'code1':     data[i],
					'archetype': archetype
				} );
				var superStat = urlCodeToNum( code1 );
				superStat = applyVersionUpdate( version, 'superStat', {
					'type':      'superStat',
					'pos':       pos,
					'i':         i,
					'inc':       inc,
					'code1':     code1,
					'archetype': archetype,
					'superStat': superStat
				} );
				selectSuperStat( pos );
				setSuperStat( superStat );
				inc = 1;
				inc = applyVersionUpdate( version, 'inc', {
					'type':      'superStat',
					'pos':       pos,
					'i':         i,
					'inc':       inc,
					'code1':     code1,
					'archetype': archetype,
					'superStat': superStat
				} );
				break;
			case 4:
				// innate talent
				var code1 = applyVersionUpdate( version, 'code1', {
					'type':      'innateTalent',
					'pos':       pos,
					'i':         i,
					'inc':       inc,
					'code1':     data[i],
					'archetype': archetype
				} );
				var innateTalent = urlCodeToNum( code1 );
				innateTalent = applyVersionUpdate( version, 'innateTalent', {
					'type':         'innateTalent',
					'pos':          pos,
					'i':            i,
					'inc':          inc,
					'code1':        code1,
					'archetype':    archetype,
					'innateTalent': innateTalent
				} );
				selectInnateTalent( pos - 3 );
				setInnateTalent( innateTalent );
				inc = 1;
				inc = applyVersionUpdate( version, 'inc', {
					'type':         'innateTalent',
					'pos':          pos,
					'i':            i,
					'inc':          inc,
					'code1':        code1,
					'archetype':    archetype,
					'innateTalent': innateTalent
				} );
				break;
			case 5:
			case 6:
			case 7:
			case 8:
			case 9:
			case 10:
				// talents
				var code1 = applyVersionUpdate( version, 'code1', {
					'type':      'talent',
					'pos':       pos,
					'i':         i,
					'inc':       inc,
					'code1':     data[i],
					'archetype': archetype
				} );
				var talent = urlCodeToNum( code1 );
				talent = applyVersionUpdate( version, 'talent', {
					'type':      'talent',
					'pos':       pos,
					'i':         i,
					'inc':       inc,
					'code1':     code1,
					'archetype': archetype,
					'talent':    talent
				} );
				selectTalent( pos - 4 );
				setTalent( talent );
				inc = 1;
				inc = applyVersionUpdate( version, 'inc', {
					'type':      'talent',
					'pos':       pos,
					'i':         i,
					'inc':       inc,
					'code1':     code1,
					'archetype': archetype,
					'talent':    talent
				} );
				break;
			case 11:
			case 12:
				// travel powers
				var code1 = applyVersionUpdate( version, 'code1', {
					'type':      'travelPower',
					'pos':       pos,
					'i':         i,
					'inc':       inc,
					'code1':     data[i],
					'code2':     data[i + 1],
					'archetype': archetype
				} );
				var code2 = applyVersionUpdate( version, 'code2', {
					'type':      'travelPower',
					'pos':       pos,
					'i':         i,
					'inc':       inc,
					'code1':     data[i],
					'code2':     data[i + 1],
					'archetype': archetype
				} );
				var travelPower = urlCodeToNum( code1 );
				travelPower = applyVersionUpdate( version, 'travelPower', {
					'type':        'travelPower',
					'pos':         pos,
					'i':           i,
					'inc':         inc,
					'code1':       code1,
					'code2':       code2,
					'archetype':   archetype,
					'travelPower': travelPower
				} );
				var mask = urlCodeToNum( code2 ) << 1;
				mask = applyVersionUpdate( version, 'mask', {
					'type':        'travelPower',
					'pos':         pos,
					'i':           i,
					'inc':         inc,
					'code1':       code1,
					'code2':       code2,
					'archetype':   archetype,
					'travelPower': travelPower,
					'mask':        mask
				} );
				var num = pos - 10;
				selectTravelPower( num );
				setTravelPower( travelPower );
				setAdvantage( 2, num, mask );
				inc = 2;
				inc = applyVersionUpdate( version, 'inc', {
					'type':        'travelPower',
					'pos':         pos,
					'i':           i,
					'inc':         inc,
					'code1':       code1,
					'code2':       code2,
					'archetype':   archetype,
					'travelPower': travelPower,
					'mask':        mask
				} );
				break;
			case 13:
			case 14:
			case 15:
			case 16:
			case 17:
			case 18:
			case 19:
			case 20:
			case 21:
			case 22:
			case 23:
			case 24:
			case 25:
			case 26:
				// powers
				var code1 = applyVersionUpdate( version, 'code1', {
					'type':      'power',
					'pos':       pos,
					'i':         i,
					'inc':       inc,
					'code1':     data[i],
					'code2':     data[i + 1],
					'code3':     data[i + 2],
					'code4':     data[i + 3],
					'archetype': archetype
				} );
				var code2 = applyVersionUpdate( version, 'code2', {
					'type':      'power',
					'pos':       pos,
					'i':         i,
					'inc':       inc,
					'code1':     data[i],
					'code2':     data[i + 1],
					'code3':     data[i + 2],
					'code4':     data[i + 3],
					'archetype': archetype
				} );
				var code3 = applyVersionUpdate( version, 'code3', {
					'type':      'power',
					'pos':       pos,
					'i':         i,
					'inc':       inc,
					'code1':     data[i],
					'code2':     data[i + 1],
					'code3':     data[i + 2],
					'code4':     data[i + 3],
					'archetype': archetype
				} );
				var code4 = applyVersionUpdate( version, 'code4', {
					'type':      'power',
					'pos':       pos,
					'i':         i,
					'inc':       inc,
					'code1':     data[i],
					'code2':     data[i + 1],
					'code3':     data[i + 2],
					'code4':     data[i + 3],
					'archetype': archetype
				} );
				var framework = applyVersionUpdate( version, 'framework', {
					'type':      'power',
					'pos':       pos,
					'i':         i,
					'inc':       inc,
					'code1':     code1,
					'code2':     code2,
					'code3':     code3,
					'code4':     code4,
					'archetype': archetype,
					'framework': parseInt( urlCodeToNum( code1 ) ),
					'power':     parseInt( urlCodeToNum( code2 ) ),
					'mask':      urlCodeToNum2( code3 + code4 ) << 1
				} );
				var power = applyVersionUpdate( version, 'power', {
					'type':      'power',
					'pos':       pos,
					'i':         i,
					'inc':       inc,
					'code1':     code1,
					'code2':     code2,
					'code3':     code3,
					'code4':     code4,
					'archetype': archetype,
					'framework': parseInt( urlCodeToNum( code1 ) ),
					'power':     parseInt( urlCodeToNum( code2 ) ),
					'mask':      urlCodeToNum2( code3 + code4 ) << 1
				} );
				var mask = applyVersionUpdate( version, 'mask', {
					'type':      'power',
					'pos':       pos,
					'i':         i,
					'inc':       inc,
					'code1':     code1,
					'code2':     code2,
					'code3':     code3,
					'code4':     code4,
					'archetype': archetype,
					'framework': parseInt( urlCodeToNum( code1 ) ),
					'power':     parseInt( urlCodeToNum( code2 ) ),
					'mask':      urlCodeToNum2( code3 + code4 ) << 1
				} );
				var powerCode = numToUrlCode( framework ) + numToUrlCode( power );
				var powerId = dataPowerIdFromCode[powerCode];
				var num = pos - 12;
				selectFramework( framework );
				selectPower( num );
				setPower( powerId );
				//validatePower(num, powerId);
				setAdvantage( 1, num, mask );
				inc = 4;
				inc = applyVersionUpdate( version, 'inc', {
					'type':      'power',
					'pos':       pos,
					'i':         i,
					'inc':       inc,
					'code1':     code1,
					'code2':     code2,
					'code3':     code3,
					'code4':     code4,
					'archetype': archetype,
					'framework': framework,
					'power':     power,
					'mask':      mask
				} );
				break;
			case 27:
			case 28:
			case 29:
				// specializations
				var code1 = applyVersionUpdate( version, 'code1', {
					'type':      'specialization',
					'pos':       pos,
					'i':         i,
					'inc':       inc,
					'code1':     data[i],
					'code2':     data[i + 1],
					'code3':     data[i + 2],
					'code4':     data[i + 3],
					'archetype': archetype
				} );
				var code2 = applyVersionUpdate( version, 'code2', {
					'type':      'specialization',
					'pos':       pos,
					'i':         i,
					'inc':       inc,
					'code1':     data[i],
					'code2':     data[i + 1],
					'code3':     data[i + 2],
					'code4':     data[i + 3],
					'archetype': archetype
				} );
				var code3 = applyVersionUpdate( version, 'code3', {
					'type':      'specialization',
					'pos':       pos,
					'i':         i,
					'inc':       inc,
					'code1':     data[i],
					'code2':     data[i + 1],
					'code3':     data[i + 2],
					'code4':     data[i + 3],
					'archetype': archetype
				} );
				var code4 = applyVersionUpdate( version, 'code4', {
					'type':      'specialization',
					'pos':       pos,
					'i':         i,
					'inc':       inc,
					'code1':     data[i],
					'code2':     data[i + 1],
					'code3':     data[i + 2],
					'code4':     data[i + 3],
					'archetype': archetype
				} );
				var codeNum = parseInt( urlCodeToNum4( code1 + code2 + code3 + code4 ) );
				var specialization = codeNum >> 4;
				var specializationTree = codeNum & ~(specialization << 4);
				specializationTree = applyVersionUpdate( version, 'specializationTree', {
					'type':               'specialization',
					'pos':                pos,
					'i':                  i,
					'inc':                inc,
					'code1':              code1,
					'code2':              code2,
					'code3':              code3,
					'code4':              code4,
					'archetype':          archetype,
					'specializationTree': specializationTree,
					'specialization':     specialization
				} );
				specialization = applyVersionUpdate( version, 'specialization', {
					'type':               'specialization',
					'pos':                pos,
					'i':                  i,
					'inc':                inc,
					'code1':              code1,
					'code2':              code2,
					'code3':              code3,
					'code4':              code4,
					'archetype':          archetype,
					'specializationTree': specializationTree,
					'specialization':     specialization
				} );
				var num = pos - 26;
				if ( num == 1 ) {
					specializationMasteryId = specializationTree;
				} else {
					setSpecializationTree( num, (specializationTree == 0) ? 0 : specializationTree + 8 );
				}
				setSpecialization( num, specialization );
				inc = 4;
				inc = applyVersionUpdate( version, 'inc', {
					'type':               'specialization',
					'pos':                pos,
					'i':                  i,
					'inc':                inc,
					'code1':              code1,
					'code2':              code2,
					'code3':              code3,
					'code4':              code4,
					'archetype':          archetype,
					'specializationTree': specializationTree,
					'specialization':     specialization
				} );
				break;
		}
		i += inc;
		pos++;
	}
	setSpecializationMastery( specializationMasteryId );
	validatePowers();
	if ( phArchetype.id > 1 ) {
		setArchetype( phArchetype.id );
	}
}
window.parseUrlParams = parseUrlParams;

// change updates
function changeUpdate() {
	setTitle();
	advantagePoints();
	buildLink( false );
}
window.changeUpdate = changeUpdate;

// set page title
function setTitle() {
	var title = siteName + ': ' + phName;
	if ( phName == '' ) {
		title = siteName;
	}
	if ( document.title != phName ) {
		document.title = title;
	}
}
window.setTitle = setTitle;

// update advantage points used
function advantagePoints() {
	var field = document.getElementById( 'advantagePoints' );
	field.innerHTML = statAdvantagePoints + ' / ' + maxAdvantagePointsTotal;
}
window.advantagePoints = advantagePoints;

// // add bookmark
// function addBookmark(name, url) {
//     if (window.sidebar) window.sidebar.addPanel(name, url, '');
//     else if (window.external && ('AddFavorite' in window.external)) window.external.AddFavorite(url, name);
// }
// window.addBookmark = addBookmark;

// update build url
var prevBuildLink;
function buildLink( submit ) {
	var field = document.getElementById( 'buildLink' );
	//var fieldBookmark = document.getElementById('buildLinkBookmark');
	var fieldRef = document.getElementById( 'buildLinkRef' );
	var base = window.location.href.replace( /\?.*$/, '' );
	//var link = '?v='+phVersion+'&n='+encodeURIComponent(phName)+'&a='+phArchetype.id+'&d=';
	var link = '?v=' + phVersion + '&n=' + encodeURIComponent( phName ) + '&d=';
	if ( submit ) {
		queueAnalytics( analyticsBuildCatagory, 'Version', phVersion );
	}
	if ( submit && phName != '' ) {
		queueAnalytics( analyticsBuildCatagory, 'Name', phName );
	}
	var params = [];
	params.push( phArchetype.code() );
	if ( submit && phArchetype.id > 0 ) {
		queueAnalytics( analyticsBuildCatagory, 'Archtype', phArchetype.name );
	}
	for ( var i = 1; i < phSuperStat.length; i++ ) {
		params.push( phSuperStat[i].code() );
		if ( submit && phSuperStat[i].id > 0 ) {
			queueAnalytics( analyticsBuildCatagory, 'SuperStat', phSuperStat[i].name );
		}
	}
	for ( var i = 1; i < phInnateTalent.length; i++ ) {
		params.push( phInnateTalent[i].code() );
		if ( submit && phInnateTalent[i].id > 0 ) {
			queueAnalytics( analyticsBuildCatagory, 'InnateTalent', phInnateTalent[i].name );
		}
	}
	for ( var i = 1; i < phTalent.length; i++ ) {
		params.push( phTalent[i].code() );
		if ( submit && phTalent[i].id > 0 ) {
			queueAnalytics( analyticsBuildCatagory, 'Talent', phTalent[i].name );
		}
	}
	for ( var i = 1; i < phTravelPower.length; i++ ) {
		params.push( phTravelPower[i].code() );
		params.push( numToUrlCode( phTravelPowerAdvantage[i] >> 1 ) );
		if ( submit && phTravelPower[i].id > 0 ) {
			queueAnalytics( analyticsBuildCatagory, 'TravelPower', phTravelPower[i].name );
			var advantageList = phTravelPower[i].getAdvantageList( phTravelPowerAdvantage[i] );
			for ( var j = 0; j < advantageList.length; j++ ) {
				queueAnalytics( analyticsBuildCatagory, 'TravelPowerAdvantage',
								phTravelPower[i].name + ': ' + advantageList[j].name );
			}
		}
	}
	for ( var i = 1; i < phPower.length; i++ ) {
		params.push( phPower[i].code() );
		params.push( numToUrlCode2( phPowerAdvantage[i] >> 1 ) );
		if ( submit && phPower[i].id > 0 ) {
			queueAnalytics( analyticsBuildCatagory, 'Power', phPower[i].name );
			var advantageList = phPower[i].getAdvantageList( phPowerAdvantage[i] );
			for ( var j = 0; j < advantageList.length; j++ ) {
				queueAnalytics( analyticsBuildCatagory, 'PowerAdvantage',
								phPower[i].name + ': ' + advantageList[j].name );
			}
		}
	}
	for ( var i = 1; i < phSpecializationTree.length - 1; i++ ) {
		if ( i == 1 ) {
			var specializationMasteryId = getSpecializationMasteryId( phSpecializationTree[4].id );
			params.push( numToUrlCode4( specializationMasteryId | (phSpecialization[1] << 4) ) );
			if ( submit && specializationMasteryId > 0 && phSpecializationTree[specializationMasteryId].id > 0 ) {
				queueAnalytics( analyticsBuildCatagory, 'SpecializationMastery',
								phSpecializationTree[specializationMasteryId].name );
			}
		} else {
			params.push( numToUrlCode4( ((phSpecializationTree[i].id == 0) ? 0 : phSpecializationTree[i].id - 8) | (phSpecialization[i] << 4) ) );
		}
		if ( submit ) {
			var specializationList = phSpecializationTree[i].specializationList;
			var specializationPointList = phSpecializationTree[i].getSpecializationList( phSpecialization[i] );
			for ( var j = 0; j < specializationList.length; j++ ) {
				if ( specializationPointList[j] > 0 ) {
					queueAnalytics( analyticsBuildCatagory, 'Specialization',
									phSpecializationTree[i].name + ': ' + specializationList[j].name,
									specializationPointList[j] );
				}
			}
		}
	}
	var data = params.join( '' );
	if ( submit ) {
		submitAnalytics( analyticsBuildCatagory, 'Data', data );
	}
	link += data;
	phBuildLink = buildUrl + link;
	//var name = phName;
	//if (name == '') name = 'Hero';
	//name = siteName+': '+name;
	var url = base + link;
	field.href = url;
	//field.setAttribute('onclick', 'return submitBuild()');
	//field.innerHTML = name;
	////fieldBookmark.setAttribute('onclick', 'addBookmark(\''+name+'\',\''+url+'\')');
	fieldRef.innerHTML = url;
	if ( prevBuildLink != undefined ) {
		setCookie( 'buildLink', prevBuildLink, cookieExpireDays );
	}
	prevBuildLink = url;
	var restore = document.getElementById( 'restorePrevBuild' );
	if ( getCookie( 'buildLink' ) == undefined ) {
		restore.style.display = 'none';
	} else {
		restore.style.display = '';
	}
}
window.buildLink = buildLink;

// restore previous build (if saved to cookie)
function restorePrevBuild() {
	var url = getCookie( 'buildLink' );
	if ( url != undefined ) {
		window.open( url, '_self' );
	}
}
window.restorePrevBuild = restorePrevBuild;

// submit build to google analytics
function submitBuild() {
	buildLink( true );
	return true;
}
window.submitBuild = submitBuild;

// generate forum entries
function forumEntry( type, first, second, third ) {
	var result = '';
	switch ( type ) {
		case 1:
			result += '<b><span class="forumFirst">' + first + '</span></b>';
			if ( second ) {
				result += ' <b><span class="forumSecond">' + second + '</span></b>';
				if ( third ) {
					result += ' <b><span class="forumThird">' + third + '</span></b>';
				}
			}
			result += '<br />';
			break;
		case 2:
			result += first;
			if ( second ) {
				result += ' ' + second;
				if ( third ) {
					result += ' ' + third;
				}
			}
			result += '\n';
			break;
		case 3:
			result += '[b][color=#f78112]' + first + '[/color][/b]';
			if ( second ) {
				result += ' [b][color=#fec530]' + second + '[/color][/b]';
				//if (third) result += ' [b][size=85][color=#ce6c10]'+third+'[/color][/size][/b]';
				if ( third ) {
					result += ' [color=#ce6c10]' + third + '[/color]';
				}
			}
			result += '\n';
			break;
	}
	return result;
}
window.forumEntry = forumEntry;
function forumAdvantageText( type, num, mask ) {
	var result = advantageText( type, num, mask );
	if ( result == '(advantages)' ) {
		result = '';
	}
	return result;
}
window.forumAdvantageText = forumAdvantageText;
function forumName( name ) {
	var result = name;
	if ( result == 'Clear' ) {
		result = '';
	}
	return result;
}
window.forumAdvantageText = forumAdvantageText;

// forum preview
function forumPreview() {
	var forumPreview = document.getElementById( 'forumPreview' );
	var result = [];
	result.push( '<b><a href="' + siteUrl + '"><span class="forumHeader">' + siteName + '</span></a></b> &nbsp; ' );
	result.push( '<b><a href="' + phBuildLink + '"><span class="forumLink">(Link to this build)</span></a></b><br />' );
	result.push( '<br />' );
	result.push( forumEntry( 1, 'Name:', phName ) );
	result.push( '<br />' );
	result.push( forumEntry( 1, 'Archetype:', phArchetype.name ) );
	result.push( '<br />' );
	result.push( forumEntry( 1, 'Super Stats:' ) );
	result.push( forumEntry( 1, 'Level 6:', forumName( phSuperStat[1].name ), '(Primary)' ) );
	result.push( forumEntry( 1, 'Level 10:', forumName( phSuperStat[2].name ), '(Secondary)' ) );
	result.push( forumEntry( 1, 'Level 15:', forumName( phSuperStat[3].name ), '(Secondary)' ) );
	result.push( '<br />' );
	result.push( forumEntry( 1, 'Talents:' ) );
	result.push( forumEntry( 1, 'Level 1:', forumName( phInnateTalent[1].name ) ) );
	if ( phArchetype.id > 1 ) {
		result.push( forumEntry( 1, 'Level 7:', forumName( phTalent[1].name ) ) );
		result.push( forumEntry( 1, 'Level 12:', forumName( phTalent[2].name ) ) );
		result.push( forumEntry( 1, 'Level 15:', forumName( phTalent[3].name ) ) );
		result.push( forumEntry( 1, 'Level 20:', forumName( phTalent[4].name ) ) );
		result.push( forumEntry( 1, 'Level 25:', forumName( phTalent[5].name ) ) );
		result.push( forumEntry( 1, 'Level 30:', forumName( phTalent[6].name ) ) );
		result.push( '<br />' );
	} else {
		result.push( forumEntry( 1, 'Level 6:', forumName( phTalent[1].name ) ) );
		result.push( forumEntry( 1, 'Level 9:', forumName( phTalent[2].name ) ) );
		result.push( forumEntry( 1, 'Level 12:', forumName( phTalent[3].name ) ) );
		result.push( forumEntry( 1, 'Level 15:', forumName( phTalent[4].name ) ) );
		result.push( forumEntry( 1, 'Level 18:', forumName( phTalent[5].name ) ) );
		result.push( forumEntry( 1, 'Level 21:', forumName( phTalent[6].name ) ) );
		result.push( '<br />' );
	}
	result.push( forumEntry( 1, 'Powers:' ) );
	result.push( forumEntry( 1, 'Level 1:', forumName( phPower[1].name ),
							 forumAdvantageText( 1, 1, phPowerAdvantage[1] ) ) );
	result.push( forumEntry( 1, 'Level 1:', forumName( phPower[2].name ),
							 forumAdvantageText( 1, 2, phPowerAdvantage[2] ) ) );
	result.push( forumEntry( 1, 'Level 6:', forumName( phPower[3].name ),
							 forumAdvantageText( 1, 3, phPowerAdvantage[3] ) ) );
	result.push( forumEntry( 1, 'Level 8:', forumName( phPower[4].name ),
							 forumAdvantageText( 1, 4, phPowerAdvantage[4] ) ) );
	result.push( forumEntry( 1, 'Level 11:', forumName( phPower[5].name ),
							 forumAdvantageText( 1, 5, phPowerAdvantage[5] ) ) );
	result.push( forumEntry( 1, 'Level 14:', forumName( phPower[6].name ),
							 forumAdvantageText( 1, 6, phPowerAdvantage[6] ) ) );
	result.push( forumEntry( 1, 'Level 17:', forumName( phPower[7].name ),
							 forumAdvantageText( 1, 7, phPowerAdvantage[7] ) ) );
	if ( phArchetype.id > 1 ) {
		result.push( forumEntry( 1, 'Level 21:', forumName( phPower[8].name ),
								 forumAdvantageText( 1, 8, phPowerAdvantage[8] ) ) );
		result.push( forumEntry( 1, 'Level 25:', forumName( phPower[9].name ),
								 forumAdvantageText( 1, 9, phPowerAdvantage[9] ) ) );
		result.push( forumEntry( 1, 'Level 30:', forumName( phPower[10].name ),
								 forumAdvantageText( 1, 10, phPowerAdvantage[10] ) ) );
		result.push( forumEntry( 1, 'Level 35:', forumName( phPower[11].name ),
								 forumAdvantageText( 1, 11, phPowerAdvantage[11] ) ) );
		result.push( forumEntry( 1, 'Level 40:', forumName( phPower[12].name ),
								 forumAdvantageText( 1, 12, phPowerAdvantage[12] ) ) );
		result.push( '<br />' );
	} else {
		result.push( forumEntry( 1, 'Level 20:', forumName( phPower[8].name ),
								 forumAdvantageText( 1, 8, phPowerAdvantage[8] ) ) );
		result.push( forumEntry( 1, 'Level 23:', forumName( phPower[9].name ),
								 forumAdvantageText( 1, 9, phPowerAdvantage[9] ) ) );
		result.push( forumEntry( 1, 'Level 26:', forumName( phPower[10].name ),
								 forumAdvantageText( 1, 10, phPowerAdvantage[10] ) ) );
		result.push( forumEntry( 1, 'Level 29:', forumName( phPower[11].name ),
								 forumAdvantageText( 1, 11, phPowerAdvantage[11] ) ) );
		result.push( forumEntry( 1, 'Level 32:', forumName( phPower[12].name ),
								 forumAdvantageText( 1, 12, phPowerAdvantage[12] ) ) );
		result.push( forumEntry( 1, 'Level 35:', forumName( phPower[13].name ),
								 forumAdvantageText( 1, 13, phPowerAdvantage[13] ) ) );
		result.push( forumEntry( 1, 'Level 38:', forumName( phPower[14].name ),
								 forumAdvantageText( 1, 14, phPowerAdvantage[14] ) ) );
		result.push( '<br />' );
	}
	result.push( forumEntry( 1, 'Travel Powers:' ) );
	result.push( forumEntry( 1, 'Level 6:', forumName( phTravelPower[1].name ),
							 forumAdvantageText( 2, 1, phTravelPowerAdvantage[1] ) ) );
	result.push( forumEntry( 1, 'Level 35:', forumName( phTravelPower[2].name ),
							 forumAdvantageText( 2, 2, phTravelPowerAdvantage[2] ) ) );
	result.push( '<br />' );
	result.push( forumEntry( 1, 'Specializations:' ) );
	for ( var i = 1; i <= 3; i++ ) {
		var specializationTree = phSpecializationTree[i];
		var mask = phSpecialization[i];
		var specializationList = specializationTree.specializationList;
		var specializationPointList = specializationTree.getSpecializationList( mask );
		for ( var j = 0; j < specializationList.length - 1; j++ ) {
			if ( specializationPointList[j] > 0 ) {
				result.push( forumEntry( 1, specializationTree.name + ':', forumName( specializationList[j].name ),
										 '(' + specializationPointList[j] + '/' + specializationList[j].maxPoints + ')' ) );
			}
		}
	}
	if ( phSpecializationTree[4].id != 0 ) {
		result.push( forumEntry( 1, 'Mastery:', forumName( phSpecializationTree[4].name ) + ' Mastery', '(1/1)' ) );
	}
	forumPreview.innerHTML = result.join( '' );
}
window.forumPreview = forumPreview;

// forum export
function setForumExportType( forumType ) {
	forumExportType = forumType;
	setCookie( 'forumType', forumType, cookieExpireDays );
}
window.setForumExportType = setForumExportType;
function selectForumExportType( forumType ) {
	document.getElementById( 'exportType_' + forumExportType ).setAttribute( 'class', 'button' );
	setForumExportType( forumType );
	document.getElementById( 'exportType_' + forumExportType ).setAttribute( 'class', 'selectedButton' );
	showView( 'Export' );
}
window.selectForumExportType = selectForumExportType;
function forumExport() {
	var forumType = getCookie( 'forumType' );
	var forumTypeNum;
	if ( forumType == undefined ) {
		forumType = forumExportType;
	}
	setForumExportType( forumType );
	if ( forumType == 'txt' ) {
		forumTypeNum = 2;
	} else {
		forumTypeNum = 3;
	}
	document.getElementById( 'exportType_' + forumType ).setAttribute( 'class', 'selectedButton' );
	var forumText = document.getElementById( 'forumText' );
	var result = [];
	//if (forumType == 'co') result.push('[font="Comic Sans MS"]');
	if ( forumTypeNum == 2 ) {
		result.push( siteName + ' ' + siteUrl + '\n' );
		result.push( '\n' );
		result.push( 'Link to this build: ' + phBuildLink + '\n' );
	} else {
		result.push( '[b][url=' + siteUrl + '][color=#f78112]' + siteName + '[/color][/url][/b] ' );
		result.push( '[b][url=' + phBuildLink + '][color=#8dcdff](Link to this build)[/color][/url][/b]\n' );
	}
	result.push( '\n' );
	result.push( forumEntry( forumTypeNum, 'Name:', phName ) );
	result.push( '\n' );
	result.push( forumEntry( forumTypeNum, 'Archetype:', phArchetype.name ) );
	result.push( '\n' );
	result.push( forumEntry( forumTypeNum, 'Super Stats:' ) );
	result.push( forumEntry( forumTypeNum, 'Level 6:', forumName( phSuperStat[1].name ), '(Primary)' ) );
	result.push( forumEntry( forumTypeNum, 'Level 10:', forumName( phSuperStat[2].name ), '(Secondary)' ) );
	result.push( forumEntry( forumTypeNum, 'Level 15:', forumName( phSuperStat[3].name ), '(Secondary)' ) );
	result.push( '\n' );
	result.push( forumEntry( forumTypeNum, 'Talents:' ) );
	result.push( forumEntry( forumTypeNum, 'Level 1:', forumName( phInnateTalent[1].name ) ) );
	if ( phArchetype.id > 1 ) {
		result.push( forumEntry( forumTypeNum, 'Level 7:', forumName( phTalent[1].name ) ) );
		result.push( forumEntry( forumTypeNum, 'Level 12:', forumName( phTalent[2].name ) ) );
		result.push( forumEntry( forumTypeNum, 'Level 15:', forumName( phTalent[3].name ) ) );
		result.push( forumEntry( forumTypeNum, 'Level 20:', forumName( phTalent[4].name ) ) );
		result.push( forumEntry( forumTypeNum, 'Level 25:', forumName( phTalent[5].name ) ) );
		result.push( forumEntry( forumTypeNum, 'Level 30:', forumName( phTalent[6].name ) ) );
		result.push( '\n' );
	} else {
		result.push( forumEntry( forumTypeNum, 'Level 6:', forumName( phTalent[1].name ) ) );
		result.push( forumEntry( forumTypeNum, 'Level 9:', forumName( phTalent[2].name ) ) );
		result.push( forumEntry( forumTypeNum, 'Level 12:', forumName( phTalent[3].name ) ) );
		result.push( forumEntry( forumTypeNum, 'Level 15:', forumName( phTalent[4].name ) ) );
		result.push( forumEntry( forumTypeNum, 'Level 18:', forumName( phTalent[5].name ) ) );
		result.push( forumEntry( forumTypeNum, 'Level 21:', forumName( phTalent[6].name ) ) );
		result.push( '\n' );
	}
	result.push( forumEntry( forumTypeNum, 'Powers:' ) );
	result.push( forumEntry( forumTypeNum, 'Level 1:', forumName( phPower[1].name ),
							 forumAdvantageText( 1, 1, phPowerAdvantage[1] ) ) );
	result.push( forumEntry( forumTypeNum, 'Level 1:', forumName( phPower[2].name ),
							 forumAdvantageText( 1, 2, phPowerAdvantage[2] ) ) );
	result.push( forumEntry( forumTypeNum, 'Level 6:', forumName( phPower[3].name ),
							 forumAdvantageText( 1, 3, phPowerAdvantage[3] ) ) );
	result.push( forumEntry( forumTypeNum, 'Level 8:', forumName( phPower[4].name ),
							 forumAdvantageText( 1, 4, phPowerAdvantage[4] ) ) );
	result.push( forumEntry( forumTypeNum, 'Level 11:', forumName( phPower[5].name ),
							 forumAdvantageText( 1, 5, phPowerAdvantage[5] ) ) );
	result.push( forumEntry( forumTypeNum, 'Level 14:', forumName( phPower[6].name ),
							 forumAdvantageText( 1, 6, phPowerAdvantage[6] ) ) );
	result.push( forumEntry( forumTypeNum, 'Level 17:', forumName( phPower[7].name ),
							 forumAdvantageText( 1, 7, phPowerAdvantage[7] ) ) );
	if ( phArchetype.id > 1 ) {
		result.push( forumEntry( forumTypeNum, 'Level 21:', forumName( phPower[8].name ),
								 forumAdvantageText( 1, 8, phPowerAdvantage[8] ) ) );
		result.push( forumEntry( forumTypeNum, 'Level 25:', forumName( phPower[9].name ),
								 forumAdvantageText( 1, 9, phPowerAdvantage[9] ) ) );
		result.push( forumEntry( forumTypeNum, 'Level 30:', forumName( phPower[10].name ),
								 forumAdvantageText( 1, 10, phPowerAdvantage[10] ) ) );
		result.push( forumEntry( forumTypeNum, 'Level 35:', forumName( phPower[11].name ),
								 forumAdvantageText( 1, 11, phPowerAdvantage[11] ) ) );
		result.push( forumEntry( forumTypeNum, 'Level 40:', forumName( phPower[12].name ),
								 forumAdvantageText( 1, 12, phPowerAdvantage[12] ) ) );
		result.push( '\n' );
	} else {
		result.push( forumEntry( forumTypeNum, 'Level 20:', forumName( phPower[8].name ),
								 forumAdvantageText( 1, 8, phPowerAdvantage[8] ) ) );
		result.push( forumEntry( forumTypeNum, 'Level 23:', forumName( phPower[9].name ),
								 forumAdvantageText( 1, 9, phPowerAdvantage[9] ) ) );
		result.push( forumEntry( forumTypeNum, 'Level 26:', forumName( phPower[10].name ),
								 forumAdvantageText( 1, 10, phPowerAdvantage[10] ) ) );
		result.push( forumEntry( forumTypeNum, 'Level 29:', forumName( phPower[11].name ),
								 forumAdvantageText( 1, 11, phPowerAdvantage[11] ) ) );
		result.push( forumEntry( forumTypeNum, 'Level 32:', forumName( phPower[12].name ),
								 forumAdvantageText( 1, 12, phPowerAdvantage[12] ) ) );
		result.push( forumEntry( forumTypeNum, 'Level 35:', forumName( phPower[13].name ),
								 forumAdvantageText( 1, 13, phPowerAdvantage[13] ) ) );
		result.push( forumEntry( forumTypeNum, 'Level 38:', forumName( phPower[14].name ),
								 forumAdvantageText( 1, 14, phPowerAdvantage[14] ) ) );
		result.push( '\n' );
	}
	result.push( forumEntry( forumTypeNum, 'Travel Powers:' ) );
	result.push( forumEntry( forumTypeNum, 'Level 6:', forumName( phTravelPower[1].name ),
							 forumAdvantageText( 2, 1, phTravelPowerAdvantage[1] ) ) );
	result.push( forumEntry( forumTypeNum, 'Level 35:', forumName( phTravelPower[2].name ),
							 forumAdvantageText( 2, 2, phTravelPowerAdvantage[2] ) ) );
	result.push( '\n' );
	result.push( forumEntry( forumTypeNum, 'Specializations:' ) );
	for ( var i = 1; i <= 3; i++ ) {
		var specializationTree = phSpecializationTree[i];
		var mask = phSpecialization[i];
		var specializationList = specializationTree.specializationList;
		var specializationPointList = specializationTree.getSpecializationList( mask );
		for ( var j = 0; j < specializationList.length - 1; j++ ) {
			if ( specializationPointList[j] > 0 ) {
				result.push( forumEntry( forumTypeNum, specializationTree.name + ':',
										 forumName( specializationList[j].name ),
										 '(' + specializationPointList[j] + '/' + specializationList[j].maxPoints + ')' ) );
			}
		}
	}
	if ( phSpecializationTree[4].id != 0 ) {
		result.push( forumEntry( forumTypeNum, 'Mastery:', forumName( phSpecializationTree[4].name ) + ' Mastery',
								 '(1/1)' ) );
	}
	//if (forumType == 'co') result.push('[/font]');
	forumText.innerHTML = result.join( '' );
}
window.forumExport = forumExport;

// preferences
function setPrefFontFamily( fontFamily ) {
	prefFontFamily = fontFamily;
	setCookie( 'prefFontFamily', fontFamily, cookieExpireDays );
	document.getElementById( 'body' ).style.fontFamily = fontFamily + ', sans-serif';
	document.getElementById( 'prefFontFamilyName' ).innerHTML = fontFamily;
	hideSection( 'selectionPref' );
	submitAnalytics( analyticsPrefCatagory, 'PrefFontFamily', fontFamily );
}
window.setPrefFontFamily = setPrefFontFamily;
function selectPrefFontFamily() {
	var selectPrefFontFamily = document.getElementById( 'selectionPref' );
	var children = selectPrefFontFamily.getElementsByTagName( '*' );
	while ( children.length > 0 ) {
		selectPrefFontFamily.removeChild( children[0] );
	}
	var numColumns = Math.floor( prefFontFamilyList.length / 25 ) + 1;
	if ( numColumns > 4 ) {
		numColumns = 4;
	}
	var currColumn = 0;
	var selectPrefFontFamilyColumn;
	for ( var i = 0; i < prefFontFamilyList.length; i++ ) {
		if ( i >= currColumn * 25 ) {
			currColumn++;
			var div = document.createElement( 'div' );
			div.setAttribute( 'id', 'selectPrefFontFamilyColumn' + currColumn );
			div.setAttribute( 'class', 'leftSelection' );
			selectPrefFontFamily.appendChild( div );
			selectPrefFontFamilyColumn = div;
		}
		var a = document.createElement( 'a' );
		a.setAttribute( 'id', 'selectPrefFontFamily' + i );
		a.setAttribute( 'onclick', 'setPrefFontFamily(\'' + prefFontFamilyList[i] + '\')' );
		a.innerHTML = '&nbsp;' + prefFontFamilyList[i] + '&nbsp;';
		selectPrefFontFamilyColumn.appendChild( a );
		selectPrefFontFamilyColumn.appendChild( document.createElement( 'br' ) );
	}
	showPositionSection( 'selectionPref', true );
}
window.selectPrefFontFamily = selectPrefFontFamily;
function setPrefFontSize( fontSize ) {
	prefFontSize = fontSize;
	setCookie( 'prefFontSize', fontSize, cookieExpireDays );
	document.getElementById( 'body' ).style.fontSize = fontSize + '%';
	document.getElementById( 'prefFontSize' ).innerHTML = fontSize + '%';
	submitAnalytics( analyticsPrefCatagory, 'PrefFontSize', fontSize );
}
window.setPrefFontSize = setPrefFontSize;
function selectPrefFontSize( change ) {
	setPrefFontSize( prefFontSize + change * 10 );
}
window.selectPrefFontSize = selectPrefFontSize;
// function populateFontList(fontList) {
//     prefFontFamilyList = [];
//     for (var key in fontList) {
//         var fontName = fontList[key];
//         fontName = fontName.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
//         if (!(fontName.match(/[_\-\s]Italic$/)
//               || fontName.match(/[_\-\s](Demi)?[Bb]old$/)
//               || fontName.match(/[_\-\s]Medium$/)
//               || fontName.match(/[_\-\s](Ultra)?[Ll]ight$/)
//               || fontName.match(/[_\-\s]Condensed$/))) {
//             fontName = fontName.replace(/\s*Regular$/, '');
//             prefFontFamilyList.add(fontName);
//         }
//     }
// }
// window.populateFontList = populateFontList;
function setPrefPopupTips( popupTips ) {
	prefPopupTips = popupTips;
	setCookie( 'prefPopupTips', popupTips, cookieExpireDays );
	document.getElementById( 'prefPopupTipsValue' ).innerHTML = prefPopupTipsList[popupTips];
	submitAnalytics( analyticsPrefCatagory, 'PrefPopupTips', prefPopupTipsList[popupTips] );
}
window.setPrefPopupTips = setPrefPopupTips;
function selectPrefPopupTips() {
	setPrefPopupTips( (prefPopupTips + 1) % 3 );
}
window.selectPrefPopupTips = selectPrefPopupTips;
function setPrefConfirmSelections( confirmSelections ) {
	prefConfirmSelections = confirmSelections;
	setCookie( 'prefConfirmSelections', confirmSelections, cookieExpireDays );
	document.getElementById( 'prefConfirmSelectionsValue' ).innerHTML = (confirmSelections ? "On" : "Off");
	submitAnalytics( analyticsPrefCatagory, 'PrefConfirmSelections', (confirmSelections ? "On" : "Off") );
}
window.setPrefConfirmSelections = setPrefConfirmSelections;
function selectPrefConfirmSelections() {
	setPrefConfirmSelections( !prefConfirmSelections );
}
window.selectPrefConfirmSelections = selectPrefConfirmSelections;
function setPrefAnalytics( analytics ) {
	if ( prefAnalytics && !analytics ) {
		submitAnalytics( analyticsPrefCatagory, 'PrefAnalytics', "Off" );
	}
	prefAnalytics = analytics;
	setCookie( 'prefAnalytics', analytics, cookieExpireDays );
	document.getElementById( 'prefAnalyticsValue' ).innerHTML = (analytics ? "On" : "Off");
	submitAnalytics( analyticsPrefCatagory, 'PrefAnalytics', (analytics ? "On" : "Off") );
	if ( prefAnalytics && analytics ) {
		submitAnalytics( analyticsPrefCatagory, 'PrefAnalytics', "On" );
	}
}
window.setPrefAnalytics = setPrefAnalytics;
function selectPrefAnalytics() {
	setPrefAnalytics( !prefAnalytics );
}
window.selectPrefAnalytics = selectPrefAnalytics;

// show views
function showView( view ) {
	var section = document.getElementById( 'view' + view );
	document.getElementById( 'viewEdit' ).style.display = 'none';
	document.getElementById( 'viewPreview' ).style.display = 'none';
	document.getElementById( 'viewExport' ).style.display = 'none';
	document.getElementById( 'viewPrefs' ).style.display = 'none';
	document.getElementById( 'viewHelp' ).style.display = 'none';
	document.getElementById( 'viewAbout' ).style.display = 'none';
	section.style.display = '';
	var showLink = document.getElementById( 'showView' + view );
	document.getElementById( 'showViewEdit' ).href.onclick = '';
	document.getElementById( 'showViewEdit' ).setAttribute( 'class', 'button' );
	document.getElementById( 'showViewPreview' ).href.onclick = '';
	document.getElementById( 'showViewPreview' ).setAttribute( 'class', 'button' );
	document.getElementById( 'showViewExport' ).href.onclick = '';
	document.getElementById( 'showViewExport' ).setAttribute( 'class', 'button' );
	document.getElementById( 'showViewPrefs' ).href.onclick = '';
	document.getElementById( 'showViewPrefs' ).setAttribute( 'class', 'button' );
	document.getElementById( 'showViewHelp' ).href.onclick = '';
	document.getElementById( 'showViewHelp' ).setAttribute( 'class', 'button' );
	document.getElementById( 'showViewAbout' ).href.onclick = '';
	document.getElementById( 'showViewAbout' ).setAttribute( 'class', 'button' );
	showLink.setAttribute( 'class', 'selectedButton' );
	showLink.href.onclick = 'return false;';
	if ( view == 'Preview' ) {
		forumPreview();
	}
	if ( view == 'Export' ) {
		forumExport();
	}
}
window.showView = showView;

// data dump
function dataDump() {
	var win = window.open( '', 'PowerHouse Data Dump' );
	win.document.write( '<h3><a onclick="document.getElementById(\'super-stat\').scrollIntoView();">Super Stat Data</a></h3>' );
	win.document.write( '<h3><a onclick="document.getElementById(\'innate-talent\').scrollIntoView();">Innate Talent Data</a></h3>' );
	win.document.write( '<h3><a onclick="document.getElementById(\'talent\').scrollIntoView();">Talent Data</a></h3>' );
	win.document.write( '<h3><a onclick="document.getElementById(\'travel-power\').scrollIntoView();">Travel Power Data</a></h3>' );
	win.document.write( '<h3><a onclick="document.getElementById(\'power-set\').scrollIntoView();">Power Set Data</a></h3>' );
	win.document.write( '<h3><a onclick="document.getElementById(\'framework\').scrollIntoView();">Framework Data</a></h3>' );
	win.document.write( '<h3><a onclick="document.getElementById(\'power\').scrollIntoView();">Power Data</a></h3>' );
	win.document.write( '<h3><a onclick="document.getElementById(\'archetype-group\').scrollIntoView();">Archetype Group Data</a></h3>' );
	win.document.write( '<h3><a onclick="document.getElementById(\'archetype\').scrollIntoView();">Archetype Data</a></h3>' );
	win.document.write( '<h3><a onclick="document.getElementById(\'specialization-tree\').scrollIntoView();">Specialization Tree Data</a></h3>' );
	win.document.write( '<h3><a onclick="document.getElementById(\'version-update\').scrollIntoView();">Version Update Data</a></h3>' );
	win.document.write( '<hr>' );
	win.document.write( '<h2 id="super-stat">Super Stat Data</h3>' );
	for ( var i = 1; i < dataSuperStat.length; i++ ) {
		win.document.write( 'dataSuperStat[' + i + '] = ' + dataSuperStat[i].toString() + '<br />' );
	}
	win.document.write( '<hr>' );
	win.document.write( '<h2 id="innate-talent">Innate Talent Data</h3>' );
	for ( var i = 1; i < dataInnateTalent.length; i++ ) {
		win.document.write( 'dataInnateTalent[' + i + '] = ' + dataInnateTalent[i].toString() + '<br />' );
	}
	win.document.write( '<hr>' );
	win.document.write( '<h2 id="talent">Talent Data</h3>' );
	for ( var i = 1; i < dataTalent.length; i++ ) {
		win.document.write( 'dataTalent[' + i + '] = ' + dataTalent[i].toString() + '<br />' );
	}
	win.document.write( '<hr>' );
	win.document.write( '<h2 id="travel-power">Travel Power Data</h3>' );
	for ( var i = 1; i < dataTravelPower.length; i++ ) {
		win.document.write( 'dataTravelPower[' + i + '] = ' + dataTravelPower[i].toString() + '<br />' );
	}
	win.document.write( '<hr>' );
	win.document.write( '<h2 id="power-set">Power Set Data</h3>' );
	for ( var i = 1; i < dataPowerSet.length; i++ ) {
		win.document.write( 'dataPowerSet[' + i + '] = ' + dataPowerSet[i].toString() + '<br />' );
	}
	win.document.write( '<hr>' );
	win.document.write( '<h2 id="framework">Framework Data</h3>' );
	for ( var i = 1; i < dataFramework.length; i++ ) {
		win.document.write( 'dataFramework[' + i + '] = ' + dataFramework[i].toString() + '<br />' );
	}
	win.document.write( '<hr>' );
	win.document.write( '<h2 id="power">Power Data</h3>' );
	for ( var i = 1; i < dataPower.length; i++ ) {
		win.document.write( 'dataPower[' + i + '] = ' + dataPower[i].toString() + '<br />' );
	}
	win.document.write( '<hr>' );
	win.document.write( '<h2 id="archetype-group">Archetype Group Data</h3>' );
	for ( var i = 1; i < dataArchetypeGroup.length; i++ ) {
		win.document.write( 'dataArchetypeGroup[' + i + '] = ' + dataArchetypeGroup[i].toString() + '<br />' );
	}
	win.document.write( '<hr>' );
	win.document.write( '<h2 id="archetype">Archetype Data</h3>' );
	for ( var i = 1; i < dataArchetype.length; i++ ) {
		win.document.write( 'dataArchetype[' + i + '] = ' + dataArchetype[i].toString() + '<br />' );
	}
	win.document.write( '<hr>' );
	win.document.write( '<h2 id="specialization-tree">Specialization Tree Data</h3>' );
	for ( var i = 1; i < dataSpecializationTree.length; i++ ) {
		win.document.write( 'dataSpecializationTree[' + i + '] = ' + dataSpecializationTree[i].toString() + '<br />' );
	}
	win.document.write( '<hr>' );
	win.document.write( '<h2 id="version-update">Version Update Data</h3>' );
	for ( var i = 1; i < dataVersionUpdate.length; i++ ) {
		win.document.write( 'dataVersionUpdate[' + i + '] = ' + dataVersionUpdate[i].toString() + '<br />' );
	}
	win.focus();
}
window.dataDump = dataDump;

// coerce value to boolean
function coerceToBoolean( value, defaultBoolean ) {
	if ( value === 'true' || value === 1 ) {
		return true;
	}
	if ( value === 'false' || value === 0 ) {
		return false;
	}
	return defaultBoolean;
}

// setup preferences
function setupPrefs() {
	// font family
	var fontFamily = getCookie( 'prefFontFamily' );
	if ( fontFamily == undefined ) {
		fontFamily = prefFontFamily;
	}
	setPrefFontFamily( fontFamily );
	// font size
	var fontSize = getCookie( 'prefFontSize' );
	if ( fontSize == undefined || isNaN( fontSize ) ) {
		fontSize = prefFontSize;
	}
	setPrefFontSize( parseInt( fontSize ) );
	// popup tips
	var popupTips = getCookie( 'prefPopupTips' );
	if ( popupTips == undefined || isNaN( popupTips ) ) {
		popupTips = prefPopupTips;
	} else {
		popupTips = parseInt( popupTips );
	}
	setPrefPopupTips( popupTips );
	// confirm selections
	var confirmSelections = getCookie( 'prefConfirmSelections' );
	if ( confirmSelections == undefined ) {
		confirmSelections = prefConfirmSelections;
	} else {
		confirmSelections = coerceToBoolean( confirmSelections, prefConfirmSelections );
	}
	setPrefConfirmSelections( confirmSelections );
	// analytics
	var analytics = getCookie( 'prefAnalytics' );
	if ( analytics == undefined ) {
		analytics = prefAnalytics;
	} else {
		analytics = coerceToBoolean( analytics, prefAnalytics );
	}
	setPrefAnalytics( analytics );
}
window.setupPrefs = setupPrefs;

// start
function start() {
	// setup preferences
	setupPrefs();

	// setup header/footer
	document.getElementById( 'header' ).style.display = '';
	document.getElementById( 'footer' ).style.display = '';

	// show edit view
	showView( 'Edit' );

	// setup version
	document.getElementById( 'version' ).firstChild.data = 'Version: ' + version + ' (' + releaseDate + ')';

	// setup name
	document.getElementById( 'fieldName' ).firstChild.data = phName;
	document.getElementById( 'sectionDisplayName' ).style.display = '';
	document.getElementById( 'editName' ).value = phName;
	document.getElementById( 'sectionEditName' ).style.display = 'none';
	setTitle();

	// setup archetype
	document.getElementById( 'fieldArchetype' ).innerHTML = phArchetype.desc;

	// setup super stats
	setupSuperStats();

	// setup innate talents
	setupInnateTalents();

	// setup talents
	setupTalents();

	// setup travel powers
	setupTravelPowers();

	// setup frameworks
	setupFrameworks();

	// setup powers
	// powers are setup when a framework is selected with the `selectFramework' function
	hideSection( 'selectionPower' );
	hideSection( 'selectionPowerAdvantage' );

	// setup archetypes
	setupArchtypes();

	// parse url
	parseUrlParams( window.location.href );

	// change updates
	changeUpdate();

	// submit build to google analytics
	submitBuild();
}
window.start = start;

window.onload = start;

//==============================================================================
// powerhouse.js ends here
//==============================================================================
