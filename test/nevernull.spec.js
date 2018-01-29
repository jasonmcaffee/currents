const {EventBus} = require('./../build/eventbus');

describe("nevernull", ()=>{

  it("should allow event firing, registering, and unregistering for any property typed.", ()=>{
    //create the eventbus
    let eventbus = new EventBus();

    //register on event listener
    let eventListenerCallCount = 0;
    let off = eventbus.person.name({on: (data, {name, fullPath, fullPathNames}) => {
      console.log(`name on handler received data: `, data, `for name: ${name} fullPath: ${fullPath} fullPathNames: ${fullPathNames}`);
      expect(name).toEqual('name');
      expect(fullPath).toEqual('person.name');
      expect(fullPathNames.length).toEqual(2);
      expect(fullPathNames[0]).toEqual('person');
      expect(fullPathNames[1]).toEqual('name');
      ++eventListenerCallCount;
    }});

    let off2 = eventbus.person({on:(data, {name, fullPath, fullPathNames}) =>{
      console.log(`person on handler received data: `, data, `for name: ${name} fullPath: ${fullPath} fullPathNames: ${fullPathNames}`);
    }});
    //fire event
    eventbus.person.name({fire:'jason mcaffee'});

    //unregister event handler
    off();

    eventbus.person.name({fire:'jason2'});

    expect(eventListenerCallCount).toEqual(1);
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
      storeBus.person.name({on: (data, {name, fullPath, fullPathNames}) => {
        store.person.name = data;
      }});

      storeBus.person.age({on: (data, {name, fullPath, fullPathNames}) => {
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