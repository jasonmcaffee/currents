//if Proxy is not natively supported, ensure polyfill is created.
require('../vendor/reflect');

export class EventBus{
  constructor(){
    return nn(new EventedProperty({name:'', fullPath:''}));
  }
}

/**
 * Returns an object which allows for safe navigation of properties.
 * When raw property values are needed, simply execute the property as a function.
 *
 * e.g.
 * let nnObject = nn({ a: 1 });
 * nnObject.a() == 1
 * nnObject.non.existent.property.access() == undefined
 *
 * @param eventedProperty - object to be wrapped.
 * @returns {Proxy}
 */
const nn = (eventedProperty)=>{
  // console.log(`nn called with: `, eventedProperty);

  //when a property is invoked as a function, pass the call down to EventedProperty.handleAction, which will use passed
  //in data to determine which action to perform (fire, on, off)
  //e.g. eventbus.person.name({fire:'some data'}) will invoke this function.
  let eventedPropertyActionFunc = (action)=>{
    return eventedProperty.handleAction(action);
  };
  //attach eventedProperty so proxy has access.
  eventedPropertyActionFunc.eventedProperty = eventedProperty;

  //intercept all property access on the wrappedValue function-object
  return new Proxy(eventedPropertyActionFunc, handler);
};

/**
 * Proxy handler object.  Any time a property is read, get is executed first, allowing us to ensure the property value
 * is never null/undefined.
 * @type {{get: handler.get}}
 */
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

  /**
   * Conditionally sets the target[property].
   * If the target has a value (ie is not undefined), property will be set to the value.
   * If the target is undefined, the attempt to set the property will be ignored.
   * @param target - target which contains the property we will set the value of.
   * @param property - property name on the target which should be assigned value.
   * @param value - value to assign to the target[property].
   * @param receiver - the object to which the assignment was originally directed (usually the Proxy object).
     */
  set: function(target, property, value, receiver){
    let rawTarget = target();
    if(rawTarget === undefined){ return; }
    rawTarget[property] = value;
  }
};

/**
 * Cache the undefined version for speed.
 */
const nnUndefinedProperty = nn(undefined);


class EventedProperty{
  constructor({parentEventedProperty, name, fullPath}){
    this.callbacks = [];
    this.fullPath =  calculateFullPath({parentEventedProperty, name, fullPath});
    this.fullPathNames = this.fullPath.split('.');
    this.name = name;
    this.eventedProperties = {};
  }

  /**
   * todo: bubble up to parent.
   * @param data
   */
  fire(data){
    // console.log(`${this.fullPath} triggered with data: `, data);
    for(let i = 0, len=this.callbacks.length; i < len; ++i){
      this.callbacks[i](data, this);
    }
  }
  on(callback){
    //return unregister function.
    this.callbacks.push(callback);
    let off = function(){
      let callbackIndex = this.callbacks.indexOf(callback);
      // console.log(`off removing callback at index`, callbackIndex);
      if(callbackIndex < 0){return;}
      this.callbacks.splice(callbackIndex, 1);
      return callback;
    }.bind(this);
    return off;
  }
  // off(callback){
  //
  // }
  handleAction(action){
    let propertyNames = Object.getOwnPropertyNames(action);
    if(propertyNames.length != 1){ return console.error('invalid action: ', action); }
    let actionName = propertyNames[0];
    let actionValue = action[actionName];
    if(typeof this[actionName] !== "function"){ return console.error('invalid action: ', action); }
    return this[actionName](actionValue);
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
    let separator = parentEventedProperty && parentEventedProperty.fullPath !== '' ? '.' : '';
    calculatedFullPath = `${parentEventedProperty.fullPath}${separator}${name}`;
  }else{
    calculatedFullPath = name;
  }
  return calculatedFullPath;
}



// module.exports = nn;
