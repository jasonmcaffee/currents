const {EventBus} = require('./../build/eventbus');

describe("nevernull", ()=>{

  it("should provide an api for access to raw values", ()=>{
    //create the eventbus
    let eventbus = new EventBus();

    //register on event listener
    let eventListenerCallCount = 0;
    let off = eventbus.person.name({on: (data, {name, fullPath}) => {
      console.log(`on handler received data: `, data, `for name: ${name} fullPath: ${fullPath}`);
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


});