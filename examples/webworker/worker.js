importScripts('../lindenmayer.js');
var lsystem = new LSystem({});
var timeout = {}

onmessage = function(e) {
  
  // wait a few ms to start thread, to be able to cancel old tasks
  clearTimeout(timeout);
  timeout = setTimeout(function() {
      console.log('received message from main', e. data);
      lsystem.setAxiom(e.data.axiom);
      console.log('succesfully set the axiom');
      lsystem.setProductions(e.data.productions);
      console.log('succesfully set the productions');
      lsystem.iterate(parseInt(e.data.iterations));
      console.log('iterated!');
      postMessage({
        result: lsystem.getString(),
        initial: e.data
      });
      
  }, 20);

};
