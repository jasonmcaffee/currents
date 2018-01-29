const {EventBus, setObjectBasedOnFullPath} = require('./../build/occurence');

describe("EventBus", ()=>{

  it("should allow event firing, registering, and unregistering for any property typed.", ()=>{
    //create the eventbus
    let eventbus = new EventBus();

    //register on event listener
    let eventListenerCallCount = 0;
    let off = eventbus.person.name({on: (data, {name, fullPath, fullPathNames}) => {
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
    let off2 = eventbus.person({on:(data, {name, fullPath, fullPathNames}) =>{
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
    eventbus.person.name({fire:'jason mcaffee'});

    //unregister event handler
    off();
    off2();

    eventbus.person.name({fire:'jason2'});

    expect(eventListenerCallCount).toEqual(1);
    expect(parentEventListenerCallCount).toEqual(1);
  });

  describe("off", ()=>{
    it("should return an off function when on is called", ()=>{
      let eventBus = new EventBus();
      let callCount = 0;
      let off = eventBus.person.name({on:()=>{
        ++callCount;
      }});
      eventBus.person.name({fire:'jason'});
      off();
      eventBus.person.name({fire:'ted'});
      expect(callCount).toEqual(1);
    });

    it("should provide an off action which unregisters a callback", ()=>{
      let eventBus = new EventBus();
      let callCount = 0;
      let callback = ()=>{
        ++callCount;
      }
      eventBus.person.name({on:callback});
      eventBus.person.name({fire:'jason'});
      eventBus.person.name({off:callback});
      eventBus.person.name({fire:'ted'});
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

      let eventBus = new EventBus();
      eventBus.person({setObject:store.person});
      eventBus.person.name({fire:'jason'});
      eventBus.person.age({fire:38});
      eventBus.person.friends({fire:'alison'});//default behavior is to add/push to arrays.

      //set non existent property
      eventBus.person.address.city({fire:'salt lake city'});

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
      //create the eventbus
      let eventbus = new EventBus();

      //register on event listener
      let off = eventbus.person.name({on: (data, {name, fullPath, fullPathNames}) => {
        console.log(`on handler received data: `, data, `for name: ${name} fullPath: ${fullPath} fullPathNames: ${fullPathNames}`);
      }});

      //fire event
      eventbus.person.name({fire: 'jason mcaffee'});

      //unregister event handler
      off();

      eventbus.person.name({fire: 'jason'});
    });

    it("should demonstrate maintaining a global store/state", ()=>{
      let store = {
        person:{
          name: 'not set',
          age: -1
        }
      };
      //create the eventbus
      let storeBus = new EventBus();

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