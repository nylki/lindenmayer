importScripts('../lindenmayer.js');
var lsystem = new LSystem({});
var timeout = {}

onmessage = function(e) {
  
  // wait a few ms to start thread, to be able to cancel old tasks
  clearTimeout(timeout);
  timeout = setTimeout(function() {
      // console.log('received message from main', e. data);
      lsystem.setWord(e.data.word);
      lsystem.setProductions(e.data.productions);
      lsystem.iterate(e.data.iterations);
      postMessage({
        result: lsystem.getString(),
        initial: e.data
      });
      
  }, 20);

};
