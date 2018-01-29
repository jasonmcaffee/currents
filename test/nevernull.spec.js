const {EventBus} = require('./../build/eventbus');

describe("nevernull", ()=>{

  it("should allow event firing, registering, and unregistering for any property typed.", ()=>{
    //create the eventbus
    let eventbus = new EventBus();

    //register on event listener
    let eventListenerCallCount = 0;
    let off = eventbus.person.name({on: (data, {name, fullPath, fullPathNames}) => {
      console.log(`on handler received data: `, data, `for name: ${name} fullPath: ${fullPath} fullPathNames: ${fullPathNames}`);
      expect(name).toEqual('name');
      ++eventListenerCallCount;
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

  });


});