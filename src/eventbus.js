//if Proxy is not natively supported, ensure polyfill is created.
require('../vendor/reflect');

export class EventBus{
  constructor(){
    return nn(new EventedProperty({name:'EventBus', fullPath:'EventBus'}));
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
  console.log(`nn called with: `, eventedProperty);
  let triggerEventFunction = ()=>{
    console.log(`event triggered`);
    return undefined;
  };
  triggerEventFunction.eventedProperty = eventedProperty;

  //intercept all property access on the wrappedValue function-object
  return new Proxy(triggerEventFunction, handler);
};

/**
 * Proxy handler object.  Any time a property is read, get is executed first, allowing us to ensure the property value
 * is never null/undefined.
 * @type {{get: handler.get}}
 */
const handler = {

  get: function(parentTriggerEventFunction, name){
    let parentEventedProperty = parentTriggerEventFunction.eventedProperty;
    console.log(`parentEventedProperty is: `, parentEventedProperty);
    console.log(`name being accessed is: `, name);

    let eventedProperty = new EventedProperty({name, parentEventedProperty});

    //ensure the property is never null.
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
    this.fullPath =  fullPath ? fullPath : `${parentEventedProperty.fullPath}.${name}`;
    this.name = name;
  }
  trigger(){

  }
  register(callback){
    //return unregister function.
  }
  unregister(callback){

  }
}



// module.exports = nn;
