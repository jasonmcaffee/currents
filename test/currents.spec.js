const {Currents, setObjectBasedOnFullPath} = require('./../build/currents');

describe("Currents", ()=>{

  it("should allow event firing, registering, and unregistering for any property typed.", ()=>{
    //create the o
    let o = new Currents();

    //register on event listener
    let eventListenerCallCount = 0;
    let off = o.person.name().on((data, {name, fullPath, fullPathNames}) => {
      console.log(`name on handler received data: `, data, `for name: ${name} fullPath: ${fullPath} fullPathNames: ${fullPathNames}`);
      //name on handler received data:  jason mcaffee for name: name fullPath: person.name fullPathNames: person,name
      expect(name).toEqual('name');
      expect(data).toEqual('jason mcaffee');
      expect(fullPath).toEqual('person.name');
      expect(fullPathNames.length).toEqual(2);
      expect(fullPathNames[0]).toEqual('person');
      expect(fullPathNames[1]).toEqual('name');
      ++eventListenerCallCount;
    });

    //register event listener on parent object (person)
    let parentEventListenerCallCount = 0;
    let off2 = o.person().on((data, {name, fullPath, fullPathNames}) =>{
      console.log(`person on handler received data: `, data, `for name: ${name} fullPath: ${fullPath} fullPathNames: ${fullPathNames}`);
      //person on handler received data:  jason mcaffee for name: name fullPath: person.name fullPathNames: person,name

      expect(name).toEqual('name');
      expect(data).toEqual('jason mcaffee');
      expect(fullPath).toEqual('person.name');
      expect(fullPathNames.length).toEqual(2);
      expect(fullPathNames[0]).toEqual('person');
      expect(fullPathNames[1]).toEqual('name');
      ++parentEventListenerCallCount;
    });

    //fire event, expecting both the person.name and person event handlers to be called.
    o.person.name().fire('jason mcaffee');

    //unregister event handler
    off();
    off2();

    o.person.name().fire('jason2');

    expect(eventListenerCallCount).toEqual(1);
    expect(parentEventListenerCallCount).toEqual(1);
  });

  describe("off", ()=>{
    it("should return an off function when on is called", ()=>{
      let o = new Currents();
      let callCount = 0;
      let off = o.person.name().on(()=>{
        ++callCount;
      });
      o.person.name().fire('jason');
      off();
      o.person.name().fire('ted');
      expect(callCount).toEqual(1);
    });

    it("should provide an off action which unregisters a callback", ()=>{
      let o = new Currents();
      let callCount = 0;
      let callback = ()=>{
        ++callCount;
      }
      o.person.name().on(callback);
      o.person.name().fire('jason');
      o.person.name().off(callback);
      o.person.name().fire('ted');
      expect(callCount).toEqual(1);
    });

  });

  describe("setObject", ()=>{
    it("should provide a function for automatically setting properties based on event", ()=>{
      let store = {
        person:{
          name: '',
          friends:['todd'],
          // address:{   <-- doesn't exist, but will be created
          //   city: ''
          // }
        },
      };

      let o = new Currents();
      o.store().setObject(store);
      o.store.person.name().fire('jason');
      o.store.person.age().fire(38);
      o.store.person.friends().fire(['alison']);

      //set non existent property results in address object being created.
      o.store.person.address.city().fire('salt lake city');

      //set unrelated properties
      o.somethingUnrelated.person.name().fire('shouldnt apply to store');
      o.somethingUnrelated.person.age().fire('shouldnt apply to store');

      expect(store.person.name).toEqual('jason');
      expect(store.person.age).toEqual(38);
      expect(store.person.friends.length).toEqual(1);
      expect(store.person.friends[0]).toEqual('alison');
      expect(store.person.address != undefined).toEqual(true);
      expect(store.person.address.city).toEqual('salt lake city');

    });

    it("should provide a customization of setting properties", ()=>{
      let store = {
        person:{
          friends:['todd'],
        },
      };

      let o = new Currents();
      o.store().setObject(store);

      //customize setting the friends array, so that it pushes, rather than sets the value.
      let friendsOnSetValueCallCount = 0;
      o.store.person.friends().onSetValue(({objectToSet, nameOfPropertyToSet, value, parentObject, objectToSetPropertyNameOnParent})=>{
        objectToSet[nameOfPropertyToSet].push(value);
        ++friendsOnSetValueCallCount;
      });

      o.store().onSetValue(({objectToSet, nameOfPropertyToSet, value, parentObject, objectToSetPropertyNameOnParent})=>{
        console.log(`name of property to set`, nameOfPropertyToSet);
      });
      o.store.person.friends().fire('alison');

      expect(store.person.friends.length).toEqual(2);
      expect(store.person.friends[0]).toEqual('todd');
      expect(store.person.friends[1]).toEqual('alison');

      expect(friendsOnSetValueCallCount).toEqual(1);

      //set non existent property results in address object being created.
      o.store.person.address.city().fire('salt lake city');
      expect(store.person.address != undefined).toEqual(true);
      expect(store.person.address.city).toEqual('salt lake city');

    });

    it("should set object values", ()=>{
      let objectToSet = {};
      setObjectBasedOnFullPath({objectToSet, fullPathNames:['person', 'name'], value:'jason'});
      expect(objectToSet.person !== undefined).toEqual(true);
      expect(objectToSet.person.name).toEqual('jason');
    });

  });

  describe("examples", ()=>{

    it("should demonstrate registering, firing, and unregistering events", ()=>{
      //create the occurence
      let o = new Currents();

      //register on event listener
      let off = o.person.name().on((data, {name, fullPath, fullPathNames}) => {
        console.log(`on handler received data: `, data, `for name: ${name} fullPath: ${fullPath} fullPathNames: ${fullPathNames}`);
      });

      //fire event
      o.person.name().fire('jason mcaffee');

      //unregister event handler
      off();
    });

    it("should demonstrate maintaining a global store/state", ()=>{
      let store = {
        person:{
          name: '',
          age: -1
        }
      };
      //create the occurence
      let storeBus = new Currents();

      //register on event listener
      storeBus.person.name().on((data) => {
        store.person.name = data;
      });

      storeBus.person.age().on((data) => {
        store.person.age = data;
      });

      //fire event
      storeBus.person.name().fire('jason mcaffee');
      storeBus.person.age().fire(38);

      expect(store.person.name).toEqual('jason mcaffee');
      expect(store.person.age).toEqual(38);
    });

    it("should demonstrate maintaining a global store/state when entire sub properties are updated", ()=>{
      let store = {
        person:{
          name: '',
          age: -1
        }
      };
      //create the occurence
      let storeBus = new Currents();

      //register on event listener
      storeBus.person().on((data) => {
        store.person = data;
      });

      //fire event
      storeBus.person().fire({name: 'jason mcaffee', age: 38});

      expect(store.person.name).toEqual('jason mcaffee');
      expect(store.person.age).toEqual(38);
    });

  });


});