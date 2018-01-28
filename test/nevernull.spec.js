const nn = require('./../build/eventbus');

describe("nevernull", ()=>{

  it("should provide an api for access to raw values", ()=>{
    let base = {name: `eventbus`, fullPath: `eventbus`};
    let eventbus = nn(base);
    let test = eventbus.person.name;
  });


});