console.log('hey!!!');
process.send({
  type : 'process:msg',
  data : {
    success : true
  }
});

process.on('message', function(packet) {
  "use strict";
  console.log('aaaaaaaa');
  console.log(packet);
});