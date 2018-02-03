const {Currents, setObjectBasedOnFullPath} = require('./../build/currents');

describe("Currents", ()=>{

  it("should allow event firing, registering, and unregistering for any property typed.", ()=>{
    //create the o
    let o = new Currents();

    //register on event listener
    let eventListenerCallCount = 0;
    let off = o.person.name({on: (data, {name, fullPath, fullPathNames}) => {
      console.log(`name on handler received data: `, data, `for name: ${name} fullPath: ${fullPath} fullPathNames: ${fullPathNames}`);
      //name on handler received data:  jason mcaffee for name: name fullPath: person.name fullPathNames: person,name

      expect(name).toEqual('name');
      expect(data).toEqual('jason mcaffee');
      expect(fullPath).toEqual('person.name');
      expect(fullPathNames.length).toEqual(2);
      expect(fullPathNames[0]).toEqual('person');
      expect(fullPathNames[1]).toEqual('name');
      ++eventListenerCallCount;
    }});

    //register event listener on parent object (person)
    let parentEventListenerCallCount = 0;
    let off2 = o.person({on:(data, {name, fullPath, fullPathNames}) =>{
      console.log(`person on handler received data: `, data, `for name: ${name} fullPath: ${fullPath} fullPathNames: ${fullPathNames}`);
      //person on handler received data:  jason mcaffee for name: name fullPath: person.name fullPathNames: person,name

      expect(name).toEqual('name');
      expect(data).toEqual('jason mcaffee');
      expect(fullPath).toEqual('person.name');
      expect(fullPathNames.length).toEqual(2);
      expect(fullPathNames[0]).toEqual('person');
      expect(fullPathNames[1]).toEqual('name');
      ++parentEventListenerCallCount;
    }});

    //fire event, expecting both the person.name and person event handlers to be called.
    o.person.name({fire:'jason mcaffee'});

    //unregister event handler
    off();
    off2();

    o.person.name({fire:'jason2'});

    expect(eventListenerCallCount).toEqual(1);
    expect(parentEventListenerCallCount).toEqual(1);
  });

  describe("off", ()=>{
    it("should return an off function when on is called", ()=>{
      let o = new Currents();
      let callCount = 0;
      let off = o.person.name({on:()=>{
        ++callCount;
      }});
      o.person.name({fire:'jason'});
      off();
      o.person.name({fire:'ted'});
      expect(callCount).toEqual(1);
    });

    it("should provide an off action which unregisters a callback", ()=>{
      let o = new Currents();
      let callCount = 0;
      let callback = ()=>{
        ++callCount;
      }
      o.person.name({on:callback});
      o.person.name({fire:'jason'});
      o.person.name({off:callback});
      o.person.name({fire:'ted'});
      expect(callCount).toEqual(1);
    });

  });

  describe("setObject", ()=>{
    it("should provide a function for automatically setting properties based on event", ()=>{
      let store = {
        person:{
          name: 'not set',
          friends:[],
          // address:{   <-- doesn't exist, but will be created
          //   city: ''
          // }
        },
      };

      let o = new Currents();
      o.person({setObject:store.person}); //bad. need a name:'person' to enforce o.something.name doesn't set person.
      o.person.name({fire:'jason'});
      o.person.age({fire:38});
      o.person.friends({fire:'alison'});//default behavior is to add/push to arrays.

      //set non existent property
      o.person.address.city({fire:'salt lake city'});

      expect(store.person.name).toEqual('jason');
      expect(store.person.age).toEqual(38);
      expect(store.person.friends.length).toEqual(1);
      expect(store.person.friends[0]).toEqual('alison');
      expect(store.person.address != undefined).toEqual(true);
      expect(store.person.address.city).toEqual('salt lake city');

    });

    it("should provide a constructor option for automatically setting properties based on event", ()=>{
      let store = {
        person:{
          name: 'not set',
          friends:[],
          // address:{   <-- doesn't exist, but will be created
          //   city: ''
          // }
        },
      };

      let o = new Currents({setObject:store});
      o.store.person.name({fire:'jason'});
      o.store.person.age({fire:38});
      o.store.person.friends({fire:'alison'});//default behavior is to add/push to arrays.

      //set non existent property
      o.store.person.address.city({fire:'salt lake city'});

      expect(store.person.name).toEqual('jason');
      expect(store.person.age).toEqual(38);
      expect(store.person.friends.length).toEqual(1);
      expect(store.person.friends[0]).toEqual('alison');
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
      let off = o.person.name({on: (data, {name, fullPath, fullPathNames}) => {
        console.log(`on handler received data: `, data, `for name: ${name} fullPath: ${fullPath} fullPathNames: ${fullPathNames}`);
      }});

      //fire event
      o.person.name({fire: 'jason mcaffee'});

      //unregister event handler
      off();

      o.person.name({fire: 'jason'});
    });

    it("should demonstrate maintaining a global store/state", ()=>{
      let store = {
        person:{
          name: 'not set',
          age: -1
        }
      };
      //create the occurence
      let storeBus = new Currents();

      //register on event listener
      storeBus.person.name({on: (data) => {
        store.person.name = data;
      }});

      storeBus.person.age({on: (data) => {
        store.person.age = data;
      }});

      //fire event
      storeBus.person.name({fire: 'jason mcaffee'});
      storeBus.person.age({fire: 38});

      expect(store.person.name).toEqual('jason mcaffee');
      expect(store.person.age).toEqual(38);
    });

  });


});