### Executer
#### Solution
Script usado para executar função em determinado tempo de acordo com uma condição

#### Implementation
```javascript
/**
 * Execute a Callback function with a condition with certain frequency
 * @param { Function } callback The callback to be called
 * @param { Function | Number } when The function or number in milliseconds that indicates when the callback is called
 * @param { Function } stop The function that indicates when the interval must be stopped. This function receives two arguments: the number of current execution and the result of When function
 * @param { Number } frequency The frequency of execution of retries
 * @return { void }
 */
function executer (callback, when, stop, frequency) {
  if (typeof callback !== 'function') {
    throw new Error('The "callback" is not a function');
  }
  var currentExecution = 1;
  frequency = frequency || 0;
  frequency = (typeof when === 'number' && parseInt(when, 10)) || frequency;
  stop = (typeof stop === 'function' && stop) || function () { return true; };
  when = (typeof when === 'function' && when) || function () { return true; };
  var interval = setInterval(function handlerInterval() {
    var resultOfWhenFunction = when();
    if (resultOfWhenFunction) {
      callback();
    }
    if (stop(currentExecution, resultOfWhenFunction)) {
      clearInterval(interval);
    }
    currentExecution += 1;
  }, frequency);
}
```

#### File
código-fonte: [executer.js](executer.js)
