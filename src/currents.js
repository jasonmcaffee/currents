//if Proxy is not natively supported, ensure polyfill is created.
require('../vendor/reflect');

export class Currents{
  constructor(){
    let result = nn(new EventedProperty({name:'', fullPath:''}));
    return result;
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
  fire(data, {context}={}){
    context = context || this;
    // console.log(`${this.fullPath} triggered with data: `, data);
    for(let i = 0, len=this.callbacks.length; i < len; ++i){
      this.callbacks[i](data, context);
    }
    if(this.parentEventedProperty){
      this.parentEventedProperty.fire(data, {context});
    }
  }

  setObject(objectToSet, {setValue=defaultSetValue}={}){
    // this.objectToSet = objectToSet;
    this.setValue = setValue;
    this.on((value, eventedProperty)=>{
      let {fullPathNames, setValue} = eventedProperty;
      //omit the first fullPathName, since that represents the objectToSet.
      //e.g. eventBus.person({objectToSet: person});
      let [omit, ...remainingFullPathNames] = fullPathNames;
      fullPathNames = remainingFullPathNames;
      setObjectBasedOnFullPath({objectToSet, fullPathNames, value, setValue});
    });
  }

  onSetValue(setValueFunction){
    this.setValue = setValueFunction;
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
    if(action === undefined){
      return this;
    }
    let {on, off, fire, setObject, onSetValue, ...rest} = action;
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
        result = this.setObject(setObject, rest);
        break;
      case onSetValue !== undefined:
        result = this.onSetValue(onSetValue);
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
export function setObjectBasedOnFullPath({objectToSet, fullPathNames, value, parentObject, objectToSetPropertyNameOnParent, setValue=defaultSetValue}){
  if(fullPathNames.length == 0){
    objectToSet = value;
    return;
  }
  //ensure there is something to set
  let firstFullPathName = fullPathNames[0];

  if(fullPathNames.length == 1){
    setValue({objectToSet, nameOfPropertyToSet: firstFullPathName, value, parentObject, objectToSetPropertyNameOnParent});
  }else{
    let [objectToSetPropertyNameOnParent, ...remainingFullPathNames] = fullPathNames;
    let parentObject = objectToSet;
    setObjectBasedOnFullPath({
      objectToSet: objectToSet[firstFullPathName],
      fullPathNames:remainingFullPathNames,
      value,
      parentObject,
      objectToSetPropertyNameOnParent,
      setValue,
    });
  }
}

function defaultSetValue({objectToSet, nameOfPropertyToSet, value, parentObject, objectToSetPropertyNameOnParent}){
  //shouldn't ever happen, but check for it anyways.
  if(parentObject === undefined && objectToSet === undefined){
    console.error('setValue unable to set value of undefined parentObject and undefined objectToSet', {objectToSet, nameOfPropertyToSet, value, parentObject, objectToSetPropertyNameOnParent} );
  }
  if(objectToSet !== undefined){
    if(typeof objectToSet === "object"){
      objectToSet[nameOfPropertyToSet] = value;
    }else{
      console.error('setValue unable to set values on non objects', {objectToSet, nameOfPropertyToSet, value, parentObject, objectToSetPropertyNameOnParent});
    }
  }else if(parentObject !== undefined){
    parentObject[objectToSetPropertyNameOnParent] = {[nameOfPropertyToSet]: value};
  }
}