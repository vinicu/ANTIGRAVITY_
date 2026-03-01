const Benchmark = require('benchmark');

const suite = new Benchmark.Suite;

const authHeader1 = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTYyMzM0NTYwMCwiZXhwIjoxNjIzMzQ5MjAwfQ.1234567890';
const authHeader2 = 'InvalidHeader';

suite.add('Split Method', function() {
  const token = authHeader1 && authHeader1.split(' ')[1];
  const token2 = authHeader2 && authHeader2.split(' ')[1];
})
.add('Substring Method', function() {
  const spaceIndex = authHeader1 ? authHeader1.indexOf(' ') : -1;
  const token = spaceIndex !== -1 ? authHeader1.substring(spaceIndex + 1) : undefined;

  const spaceIndex2 = authHeader2 ? authHeader2.indexOf(' ') : -1;
  const token2 = spaceIndex2 !== -1 ? authHeader2.substring(spaceIndex2 + 1) : undefined;
})
.add('StartsWith Method', function() {
  const token = authHeader1 && authHeader1.startsWith('Bearer ') ? authHeader1.substring(7) : undefined;
  const token2 = authHeader2 && authHeader2.startsWith('Bearer ') ? authHeader2.substring(7) : undefined;
})
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
})
.run({ 'async': true });
