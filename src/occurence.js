//if Proxy is not natively supported, ensure polyfill is created.
require('../vendor/reflect');

export class Occurence{
  constructor(){
    return nn(new EventedProperty({name:'', fullPath:''}));
  }
}

const nn = (eventedProperty)=>{
  // console.log(`nn called with: `, eventedProperty);

  //when a property is invoked as a function, pass the call down to EventedProperty.handleAction, which will use passed
  //in data to determine which action to perform (fire, on, off)
  //e.g. occurence.person.name({fire:'some data'}) will invoke this function.
  let eventedPropertyActionFunc = (action)=>{
    return eventedProperty.handleAction(action);
  };
  //attach eventedProperty so proxy has access.
  eventedPropertyActionFunc.eventedProperty = eventedProperty;

  //intercept all property access on the wrappedValue function-object
  return new Proxy(eventedPropertyActionFunc, handler);
};

const handler = {

  get: function(parentEventedPropertyActionFunc, name){
    let parentEventedProperty = parentEventedPropertyActionFunc.eventedProperty;
    // console.log(`parentEventedProperty is: `, parentEventedProperty);
    // console.log(`name being accessed is: `, name);

    //create a new evented property with the accessed name, if one doesn't already exist.
    if(parentEventedProperty.eventedProperties[name] === undefined){
      parentEventedProperty.eventedProperties[name] = new EventedProperty({name, parentEventedProperty});
    }

    let eventedProperty = parentEventedProperty.eventedProperties[name];

    //wrap the eventedProperty with trigger function
    return nn(eventedProperty);
  },
};

class EventedProperty{
  constructor({parentEventedProperty, name, fullPath}){
    this.callbacks = [];
    this.fullPath =  calculateFullPath({parentEventedProperty, name, fullPath});
    this.fullPathNames = this.fullPath.split('.');
    this.name = name;
    this.eventedProperties = {};
    this.parentEventedProperty = parentEventedProperty;
  }

  /**
   *
   * @param data - data to be sent to each callback.
   * @param context - when child is fired, we want the parent to have access to the fullPath, etc. of the child.
   * e.g. occurence.person.on((data, {fullPath})=>{...})   occurence.person.name(fire:'jason')
   *      should result in person.on fullPath == 'person.name';
   */
  fire(data, {context}){
    context = context || this;
    // console.log(`${this.fullPath} triggered with data: `, data);
    for(let i = 0, len=this.callbacks.length; i < len; ++i){
      this.callbacks[i](data, context);
    }
    if(this.parentEventedProperty){
      this.parentEventedProperty.fire(data, {context});
    }
  }

  setObject(objectToSet){
    // this.objectToSet = objectToSet;
    this.on((value, {fullPathNames})=>{
      //omit the first fullPathName, since that represents the objectToSet.
      //e.g. eventBus.person({objectToSet: person});
      let [omit, ...remainingFullPathNames] = fullPathNames;
      setObjectBasedOnFullPath({objectToSet, fullPathNames: remainingFullPathNames, value});
    });
  }
  //todo: once
  on(callback){
    this.callbacks.push(callback);
    let off = function(){
      return this.off(callback);
    }.bind(this);
    return off;
  }
  off(callback){
    let callbackIndex = this.callbacks.indexOf(callback);
    // console.log(`off removing callback at index`, callbackIndex);
    if(callbackIndex < 0){return;}
    this.callbacks.splice(callbackIndex, 1);
    return callback;
  }

  handleAction(action){
    let {on, off, fire, setObject, ...rest} = action;
    let result;
    switch(true){
      case on != undefined:
        result = this.on(on, rest);
        break;
      case off !== undefined:
        this.off(off, rest);
        break;
      case fire !== undefined:
        result = this.fire(fire, rest);
        break;
      case setObject !== undefined:
        result = this.setObject(setObject);
        break;
      default:
        console.error('invalid action: ', action);
    }
    return result;
  }
}

/**
 * the base evented property is the EventBus, which has a blank name and fullpath, so we don't want to include it in our event string names.
 * @param parentEventedProperty
 * @param name
 * @param fullPath
 * @returns {*}
 */
function calculateFullPath({parentEventedProperty, name, fullPath}){
  if(fullPath){
    return fullPath;
  }
  let calculatedFullPath;
  if(parentEventedProperty !== undefined){
    let separator = parentEventedProperty.fullPath !== '' ? '.' : '';
    calculatedFullPath = `${parentEventedProperty.fullPath}${separator}${name}`;
  }else{
    calculatedFullPath = name;
  }
  return calculatedFullPath;
}

/**
 *
 * @param objectToSet
 * @param fullPathNames - e.g. ['person', 'name']
 * @param value - e.g. 'jason'
 */
export function setObjectBasedOnFullPath({objectToSet, fullPathNames, value}){
  if(fullPathNames.length == 0){
    objectToSet = value;
    return;
  }

  //ensure there is something to set
  let firstFullPathName = fullPathNames[0];

  if(fullPathNames.length == 1){
    setValueBasedOnType({objectToSet, nameOfPropertyToSet: firstFullPathName, value});
  }else if(fullPathNames.length == 2){
    //just set the value
    objectToSet[firstFullPathName] = objectToSet[firstFullPathName] || {}; //ensure the property exists.
    let secondFullPathName = fullPathNames[1];
    setValueBasedOnType({objectToSet: objectToSet[firstFullPathName], nameOfPropertyToSet: secondFullPathName, value});
  }else{
    let [discard, ...remainingFullPathNames] = fullPathNames;
    setObjectBasedOnFullPath({objectToSet: objectToSet[firstFullPathName], fullPathNames:remainingFullPathNames, value});
  }
}

function setValueBasedOnType({objectToSet, nameOfPropertyToSet, value}){
  if(Array.isArray(objectToSet[nameOfPropertyToSet])){
    objectToSet[nameOfPropertyToSet].push(value);
  }else{
    objectToSet[nameOfPropertyToSet] = value;
  }
}