### FacebookData forms de conversão
#### Solution
Script usado para inserir o campo (input hidden) `facebook_data` nos formulários de conversão

#### Implementation
```javascript
(function () {
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
      throw new Error('The "callback" is not a function')
    }
    var currentExecution = 1
    frequency = frequency || 0
    frequency = (typeof when === 'number' && parseInt(when, 10)) || frequency
    stop = (typeof stop === 'function' && stop) || function () { return true }
    when = (typeof when === 'function' && when) || function () { return true }
    var interval = setInterval(function handlerInterval() {
      var resultOfWhenFunction = when()
      if (resultOfWhenFunction) {
        callback(resultOfWhenFunction)
      }
      if (stop(currentExecution, resultOfWhenFunction)) {
        clearInterval(interval)
      }
      currentExecution += 1
    }, frequency)
  }

  /**
   * Returns the value from cookies according 'key'
   * @param { string } key - The key of cookie
   * @param { F } fallback - The value returned when the cookie is not found
   * @return { string | F }
   */
  function getCookie (key, fallback) {
    var defaultValue = typeof fallback !== 'undefined' ? fallback : ''
    var matches = (new RegExp('\\b' + key + '=(.*?)($|;\\s)', 'g'))
      .exec(decodeURIComponent(document.cookie))
    return matches ? matches[1] : defaultValue
  }

  /**
   * Returns the value of cookie 'fb_external_id'
   * @return { string }
   */
  function getFbExternalId () {
    var fbutrk = getCookie('fb_external_id')
    if (fbutrk) {
      return fbutrk
    }
    var value = 'trk' + Date.now()
    var date = new Date()

    date.setTime(date.getTime() + 600000); // 10*60*1000 = 600000
    document.cookie = 'fb_external_id=' + value + ';expires=' + date.toUTCString() + ';path=/'

    return value
  }

  /**
   * Returns a tuple with attribute and value
   * @param { Object } dataLocation - The value returned from IP Stack API
   * @return { HTMLInputElement }
   */
  function buildFacebookDataField (dataLocation) {
    var dataLocation = dataLocation || {}
    var element = document.createElement('input')
    element.setAttribute('type', 'hidden')
    element.setAttribute('name', 'facebook_data')

    var data = {
      fbc: getCookie('_fbc'),
      fbp: getCookie('_fbp'),
      external_id: getCookie('fb_external_id', getFbExternalId()),
      user_agent: window.navigator.userAgent
    }

    if (dataLocation.ip) data.ip = dataLocation.ip
    if (dataLocation.city) data.city = dataLocation.city
    if (dataLocation.country) data.country = dataLocation.country
    if (dataLocation.zip) data.zip = dataLocation.zip

    element.setAttribute('value', window.btoa(JSON.stringify(data)))

    return element
  }

  /**
   * Returns the value of IP Stack API
   * @return { Object }
   */
  function getLocationDetails () {
    try {
      return new window.IPLocation().getSyncIpLocation()
    } catch (_) {
      return {}
    }
  }

  /**
   * Insert the input into form
   * @param { HTMLFormElement } form - The form element
   * @param { HTMLInputElement } input - The input element
   */
  function appendChild(form, input) {
    if (!form.querySelector('input[name=facebook_data]')) {
      form.appendChild(input)
    }
  }

  // Release the Kraken
  executer(function handler () {
    var field = buildFacebookDataField(getLocationDetails())

    document
      .querySelectorAll('form#conversion-form,form.mkt-form,form#contactform-contact,form#form-jumpstep-signup')
      .forEach(function eachForm (form) {
        appendChild(form, field.cloneNode(true))
      })
  }, function when () {
    return window.IPLocation || window.forceWithoutLocation
  }, function stop(i, w) {
    if (i === 9) {
      window.forceWithoutLocation = true
    }
    return i === 10 || w
  }, 1000)
})()
```

#### File
código-fonte: [executer.js](executer.js)
